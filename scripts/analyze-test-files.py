import requests
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from scipy.stats import median_abs_deviation


# Download and analyze both files
desert_fail_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desert_fail_instrumental-Oboo5P3E2iopNkGUGggDqFVOP4LS14.csv"
desert_success_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desert_success_exo-IxZHONyLi22c0KlfybRacLX68vxCRo.csv"

def analyze_lightcurve(url, name):
    print(f"\n{'='*60}")
    print(f"Analyzing: {name}")
    print(f"{'='*60}")
    
    # Download data
    response = requests.get(url)
    lines = response.text.strip().split('\n')[1:]  # Skip header
    
    time = []
    flux = []
    for line in lines:
        parts = line.split(',')
        if len(parts) >= 2:
            try:
                t = float(parts[0])
                f = float(parts[1])
                time.append(t)
                flux.append(f)
            except:
                pass
    
    time = np.array(time)
    flux = np.array(flux)
    
    print(f"Data points: {len(flux)}")
    print(f"Time span: {time[-1] - time[0]:.2f} days")
    
    # Basic statistics
    mean_flux = np.mean(flux)
    median_flux = np.median(flux)
    std_flux = np.std(flux)
    mad_flux = median_abs_deviation(flux)
    
    print(f"\nFlux Statistics:")
    print(f"  Mean: {mean_flux:.6f}")
    print(f"  Median: {median_flux:.6f}")
    print(f"  Std Dev: {std_flux:.6f}")
    print(f"  MAD: {mad_flux:.6f}")
    print(f"  Coefficient of Variation: {std_flux/mean_flux:.6f}")
    
    # Normalize flux
    normalized_flux = flux / median_flux
    
    # Transit depth
    min_flux = np.min(normalized_flux)
    transit_depth = 1 - min_flux
    print(f"\nTransit Depth: {transit_depth:.6f} ({transit_depth*100:.4f}%)")
    
    # Signal-to-noise ratio
    signal_strength = transit_depth
    noise_level = mad_flux / median_flux
    snr = signal_strength / noise_level if noise_level > 0 else 0
    print(f"SNR: {snr:.2f}")
    
    # Check for instrumental artifacts
    # Look for sudden jumps or ramps
    diff_flux = np.diff(flux)
    max_jump = np.max(np.abs(diff_flux))
    mean_diff = np.mean(np.abs(diff_flux))
    print(f"\nInstrumental Check:")
    print(f"  Max flux jump: {max_jump:.6f}")
    print(f"  Mean flux change: {mean_diff:.6f}")
    print(f"  Jump ratio: {max_jump/mean_diff:.2f}")
    
    # Check for linear trends (instrumental ramps)
    from scipy.stats import linregress
    slope, intercept, r_value, p_value, std_err = linregress(time, flux)
    print(f"  Linear trend slope: {slope:.8f}")
    print(f"  R-squared: {r_value**2:.6f}")
    
    # Periodicity analysis using Lomb-Scargle
    frequencies = np.linspace(0.01, 0.5, 1000)
    periods = 1 / frequencies
    power = signal.lombscargle(time, normalized_flux - np.mean(normalized_flux), frequencies, normalize=True)
    
    best_period_idx = np.argmax(power)
    best_period = periods[best_period_idx]
    best_power = power[best_period_idx]
    
    print(f"\nPeriodicity:")
    print(f"  Best period: {best_period:.2f} days")
    print(f"  Power: {best_power:.4f}")
    
    # Check for secondary eclipse (eclipsing binary indicator)
    if best_period > 0:
        phase = ((time - time[0]) % best_period) / best_period
        phase_sorted_idx = np.argsort(phase)
        phase_sorted = phase[phase_sorted_idx]
        flux_sorted = normalized_flux[phase_sorted_idx]
        
        # Check around phase 0.5 for secondary eclipse
        secondary_mask = (phase_sorted > 0.4) & (phase_sorted < 0.6)
        if np.sum(secondary_mask) > 0:
            secondary_depth = 1 - np.min(flux_sorted[secondary_mask])
            print(f"  Secondary eclipse depth: {secondary_depth:.6f}")
        
    # Odd-even transit check
    print(f"\nBinary Check:")
    print(f"  (Would need multiple transits to compute odd-even difference)")
    
    return {
        'time': time,
        'flux': flux,
        'transit_depth': transit_depth,
        'snr': snr,
        'max_jump': max_jump,
        'jump_ratio': max_jump/mean_diff,
        'linear_slope': slope,
        'r_squared': r_value**2,
        'best_period': best_period,
        'best_power': best_power
    }

# Analyze both files
fail_data = analyze_lightcurve(desert_fail_url, "Desert_fail_instrumental (SHOULD BE NEGATIVE)")
success_data = analyze_lightcurve(desert_success_url, "Desert_success_exo (SHOULD BE POSITIVE)")

print(f"\n{'='*60}")
print("COMPARISON & DETECTION CRITERIA")
print(f"{'='*60}")

print("\nKey Differences:")
print(f"Transit Depth: Fail={fail_data['transit_depth']:.6f}, Success={success_data['transit_depth']:.6f}")
print(f"SNR: Fail={fail_data['snr']:.2f}, Success={success_data['snr']:.2f}")
print(f"Jump Ratio: Fail={fail_data['jump_ratio']:.2f}, Success={success_data['jump_ratio']:.2f}")
print(f"Linear Trend R²: Fail={fail_data['r_squared']:.6f}, Success={success_data['r_squared']:.6f}")
print(f"Periodicity Power: Fail={fail_data['best_power']:.4f}, Success={success_data['best_power']:.4f}")

print("\nRECOMMENDED DETECTION CRITERIA:")
print("1. SNR > 3.0 (signal-to-noise ratio)")
print("2. Transit depth > 0.001 (0.1%)")
print("3. Jump ratio < 10 (reject instrumental artifacts)")
print("4. Linear trend R² < 0.3 (reject instrumental ramps)")
print("5. Periodicity power > 0.1 (periodic signal)")
print("6. Transit shape symmetry check")
print("7. No secondary eclipse at phase 0.5 (reject binaries)")
