"""
AtmosArbiter: PeakGuard Loss Function
Problem Statement 26081 (MoES / NCMRWF | SIH 2026)

Module 3: Asymmetric Extreme Value Pinball Quantile Loss (tau = 0.98)
Penalizes extreme event under-prediction 10x more than over-prediction
to prevent conditional mean regression from diluting flash flood peaks.
"""

import torch
import torch.nn as nn


class PeakGuardLoss(nn.Module):
    """
    PeakGuard Asymmetric Quantile Loss.
    
    L_tau(y, y_hat) = max(tau * (y - y_hat), (tau - 1) * (y - y_hat))
    
    For extreme rainfall / heat:
        - When y > y_hat (under-predicting a severe event): penalty scaled by tau * underpredict_penalty
        - When y_hat > y (over-predicting): penalty scaled by (1 - tau)
    """
    def __init__(self, tau: float = 0.98, underpredict_penalty: float = 10.0, threshold: float = 65.0):
        super().__init__()
        self.tau = tau
        self.underpredict_penalty = underpredict_penalty
        self.threshold = threshold

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        error = target - pred
        
        # Standard Pinball loss
        pinball = torch.maximum(self.tau * error, (self.tau - 1.0) * error)
        
        # Extreme event boost: heavily penalize under-predicting values exceeding severe threshold
        is_extreme_underpredict = (target >= self.threshold) & (error > 0)
        weights = torch.ones_like(error)
        weights[is_extreme_underpredict] = self.underpredict_penalty
        
        loss = torch.mean(weights * pinball)
        return loss


if __name__ == '__main__':
    loss_fn = PeakGuardLoss(tau=0.98, underpredict_penalty=10.0, threshold=65.0)
    
    target_extreme = torch.tensor([180.0]) # Severe cloudburst
    pred_diluted = torch.tensor([90.0])   # Smeared average
    pred_preserved = torch.tensor([175.0]) # PeakGuard retained
    
    l_diluted = loss_fn(pred_diluted, target_extreme)
    l_preserved = loss_fn(pred_preserved, target_extreme)
    
    print(f"Loss for diluted prediction (90mm vs 180mm): {l_diluted.item():.2f}")
    print(f"Loss for preserved prediction (175mm vs 180mm): {l_preserved.item():.2f}")
    print(f"Penalty ratio: {l_diluted.item() / l_preserved.item():.1f}x higher penalty for washing out peaks!")
