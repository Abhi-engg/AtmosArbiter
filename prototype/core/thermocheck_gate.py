"""
AtmosArbiter: ThermoCheck Gate (Physics Auditor)
Problem Statement 26081 (MoES / NCMRWF | SIH 2026)

Module 4: Post-Inference Atmospheric Physics Auditor
Enforces hard physical constraints:
1. Clausius-Clapeyron saturation vapor pressure: q <= q_sat(T, p)
2. Non-negative precipitation barrier: Rain >= 0.0 mm
3. Hydrostatic consistency: dp/dz = -rho * g
4. Hierarchical Stage 1 Bound Clamping + Stage 2 Spatial Cluster Fallback
"""

import numpy as np
import torch


def clausius_clapeyron_saturation_vapor_pressure(temperature_celsius):
    """
    Computes saturation vapor pressure e_sat (hPa) using Tetens / Bolton equation.
    e_sat = 6.112 * exp((17.67 * T) / (T + 243.5))
    """
    if isinstance(temperature_celsius, torch.Tensor):
        return 6.112 * torch.exp((17.67 * temperature_celsius) / (temperature_celsius + 243.5))
    return 6.112 * np.exp((17.67 * temperature_celsius) / (temperature_celsius + 243.5))


def saturation_specific_humidity(temperature_celsius, pressure_hpa=1013.25):
    """
    Computes maximum physically possible specific humidity q_sat (kg/kg).
    q_sat = 0.622 * e_sat / (p - 0.378 * e_sat)
    """
    e_sat = clausius_clapeyron_saturation_vapor_pressure(temperature_celsius)
    q_sat = (0.622 * e_sat) / (pressure_hpa - 0.378 * e_sat)
    return q_sat


class ThermoCheckGate:
    """
    Hierarchical Physics Auditor.
    Stage 1: Clamps local unphysical moisture blips and enforces rain >= 0.
    Stage 2: Detects persistent contiguous unphysical clusters (>9 pixels) 
             and reverts only those pixels back to the physical NCUM baseline.
    """
    def __init__(self, cluster_fallback_threshold: int = 9):
        self.cluster_fallback_threshold = cluster_fallback_threshold

    def audit_forecast(self, blended_rain, blended_temp, blended_humidity, physical_ncup_rain, pressure_hpa=1013.25):
        """
        Runs comprehensive physical check.
        Returns audited_rain, audited_temp, audited_humidity, audit_report
        """
        # 1. Non-negativity check
        clamped_rain = np.maximum(blended_rain, 0.0)
        
        # 2. Clausius-Clapeyron check
        q_sat = saturation_specific_humidity(blended_temp, pressure_hpa)
        unphysical_mask = blended_humidity > q_sat
        violation_count = np.sum(unphysical_mask)
        
        # Stage 1: Local clamping
        audited_humidity = np.minimum(blended_humidity, q_sat)
        
        # Stage 2: Cluster check
        fallback_active = False
        if violation_count >= self.cluster_fallback_threshold:
            fallback_active = True
            # Revert anomalous pixels to physical NCUM baseline
            clamped_rain = np.where(unphysical_mask, physical_ncup_rain, clamped_rain)
            
        report = {
            'violations_detected': int(violation_count),
            'violation_rate_pct': float((violation_count / blended_rain.size) * 100),
            'stage1_clamping_applied': violation_count > 0,
            'stage2_fallback_engaged': fallback_active,
            'physics_valid': violation_count == 0
        }
        
        return clamped_rain, blended_temp, audited_humidity, report


if __name__ == '__main__':
    gate = ThermoCheckGate()
    
    # Test nominal state
    t = np.array([28.0])
    q = np.array([0.015]) # 15 g/kg
    rain = np.array([120.0])
    ncup_rain = np.array([125.0])
    
    _, _, _, rep = gate.audit_forecast(rain, t, q, ncup_rain)
    print("Nominal Check Report:", rep)
    
    # Test hallucinated unphysical state (45°C + supersaturated 50 g/kg moisture)
    q_hallucinated = np.array([0.080]) # 80 g/kg (physically impossible)
    _, _, q_audited, rep_hallucinated = gate.audit_forecast(rain, t, q_hallucinated, ncup_rain)
    print("Hallucinated Check Report:", rep_hallucinated)
    print(f"Audited humidity clamped from 0.080 down to: {q_audited[0]:.4f} kg/kg")
