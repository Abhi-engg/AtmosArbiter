"""
AtmosArbiter: Neural Arbitration Core (PyTorch 2.x)
Problem Statement 26081 (MoES / NCMRWF | SIH 2026)

Module 1: TopoWeight Engine (Spatial Res-SE U-Net)
Module 2: ChronoShift Layer (Lead-Time Multi-Head Cross-Attention)
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class SqueezeExcitation(nn.Module):
    """Channel-wise Squeeze-and-Excitation block for inter-model feature recalibration."""
    def __init__(self, channels: int, reduction: int = 4):
        super().__init__()
        self.fc = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, c, _, _ = x.shape
        w = self.fc(x).view(b, c, 1, 1)
        return x * w


class ResidualSEBlock(nn.Module):
    """Residual convolutional block with SE attention."""
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.se = SqueezeExcitation(out_channels)
        self.shortcut = nn.Sequential()
        if in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = self.shortcut(x)
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = self.se(out)
        out = F.relu(out + res)
        return out


class ChronoShiftAttention(nn.Module):
    """
    Lead-Time Cross-Attention Layer.
    Embeds forecast lead time (e.g. t+24h to t+240h) using sinusoidal position encodings
    and cross-attends with spatial feature representations.
    """
    def __init__(self, feature_dim: int, embed_dim: int = 64):
        super().__init__()
        self.lead_embed = nn.Sequential(
            nn.Linear(1, embed_dim),
            nn.SiLU(),
            nn.Linear(embed_dim, feature_dim)
        )
        self.cross_attn = nn.MultiheadAttention(embed_dim=feature_dim, num_heads=4, batch_first=True)

    def forward(self, spatial_feats: torch.Tensor, lead_time_hours: torch.Tensor) -> torch.Tensor:
        # spatial_feats: (B, C, H, W)
        # lead_time_hours: (B, 1)
        b, c, h, w = spatial_feats.shape
        lead_vec = self.lead_embed(lead_time_hours).unsqueeze(1) # (B, 1, C)

        # Flatten spatial tokens (B, H*W, C)
        tokens = spatial_feats.flatten(2).permute(0, 2, 1)
        attn_out, _ = self.cross_attn(query=lead_vec, key=tokens, value=tokens)
        
        # Modulate spatial features with temporal attention
        scale = torch.sigmoid(attn_out).permute(0, 2, 1).view(b, c, 1, 1)
        return spatial_feats * (1.0 + scale)


class AtmosArbiterNet(nn.Module):
    """
    Full AtmosArbiter Dual-Branch Neural Arbitration Network.
    
    Inputs:
        - model_forecasts: (B, M, H, W) - e.g. M=2 (NCUM Physical NWP, GraphCast AI)
        - orography_priors: (B, 3, H, W) - DEM Elevation, Terrain Slope, Land-Sea Mask
        - lead_time: (B, 1) - Lead time horizon in hours
        
    Outputs:
        - blended_forecast: (B, 1, H, W)
        - dynamic_weights: (B, M, H, W) where sum(W_m) == 1.0 along M dimension
        - exceedance_prob: (B, 1, H, W) P(Rain > 65mm)
    """
    def __init__(self, num_models: int = 2, in_channels: int = 5, base_filters: int = 32):
        super().__init__()
        self.num_models = num_models
        
        # Encoder: Ingests model predictions + topographic priors
        self.enc1 = ResidualSEBlock(in_channels, base_filters)
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = ResidualSEBlock(base_filters, base_filters * 2)
        self.pool2 = nn.MaxPool2d(2)
        
        # Bottleneck: ChronoShift Temporal Attention
        self.bottleneck = ResidualSEBlock(base_filters * 2, base_filters * 4)
        self.chronoshift = ChronoShiftAttention(base_filters * 4)
        
        # Decoder
        self.up2 = nn.ConvTranspose2d(base_filters * 4, base_filters * 2, kernel_size=2, stride=2)
        self.dec2 = ResidualSEBlock(base_filters * 4, base_filters * 2)
        self.up1 = nn.ConvTranspose2d(base_filters * 2, base_filters, kernel_size=2, stride=2)
        self.dec1 = ResidualSEBlock(base_filters * 2, base_filters)
        
        # Arbitration Head: Predicts dynamic weights W_m(x, y, t)
        self.weight_head = nn.Sequential(
            nn.Conv2d(base_filters, num_models, kernel_size=1),
            nn.Softmax(dim=1) # Enforces sum(W_m) = 1.0
        )
        
        # Uncertainty / Exceedance Head: Predicts P(Severe Event)
        self.exceedance_head = nn.Sequential(
            nn.Conv2d(base_filters, 1, kernel_size=1),
            nn.Sigmoid()
        )

    def forward(self, model_forecasts: torch.Tensor, orography_priors: torch.Tensor, lead_time: torch.Tensor):
        # Concatenate forecasts + static priors
        x = torch.cat([model_forecasts, orography_priors], dim=1) # (B, 2+3=5, H, W)
        
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool1(e1))
        
        b = self.bottleneck(self.pool2(e2))
        b = self.chronoshift(b, lead_time)
        
        d2 = self.dec2(torch.cat([self.up2(b), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        
        # Output dynamic spatial weights W_m(x, y, t)
        weights = self.weight_head(d1) # (B, M, H, W)
        
        # Compute dynamically blended forecast: Y_hat = sum(W_m * X_m)
        blended = torch.sum(weights * model_forecasts, dim=1, keepdim=True) # (B, 1, H, W)
        
        # Compute exceedance probability
        exceedance = self.exceedance_head(d1) # (B, 1, H, W)
        
        return blended, weights, exceedance


if __name__ == '__main__':
    # Unit Test verification
    print("Testing AtmosArbiterNet instantiation & forward pass...")
    model = AtmosArbiterNet(num_models=2, in_channels=5)
    dummy_models = torch.randn(2, 2, 64, 64)
    dummy_orography = torch.randn(2, 3, 64, 64)
    dummy_lead = torch.tensor([[24.0], [72.0]])
    
    blended, weights, exceedance = model(dummy_models, dummy_orography, dummy_lead)
    print(f"Blended output shape: {blended.shape}")
    print(f"Dynamic weights shape: {weights.shape}")
    print(f"Weights sum across models (pixel 0,0): {weights[0, :, 0, 0].sum().item():.4f}")
    assert torch.allclose(weights.sum(dim=1), torch.ones_like(weights[:, 0])), "Weights must sum to 1.0"
    print("SUCCESS: AtmosArbiterNet validated!")
