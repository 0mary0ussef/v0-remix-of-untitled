import numpy as np
import pandas as pd
from scipy import signal
from scipy.optimize import minimize
import json
import sys
from typing import Dict, List, Tuple, Optional

class RealExoplanetDetector:
    """
    Real exoplanet detection algorithms based on NASA's methods:
    - Box Least Squares (BLS) for period detection
    - Transit Light Curve Fitting
    - Statistical significance testing
    - False positive probability calculation
    """
    
    def __init__(self):
        self.min_period = 0.5  # days
        self.max_period = 50.0  # days
        self.min_transit_duration = 0.01  # days
        self.detection_threshold = 7.0  # sigma
        
    def preprocess_lightcurve(self, time: np.ndarray, flux: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess light curve data using NASA's standard methods
        """
        # Remove NaN values
        mask = np.isfinite(time) & np.isfinite(flux)
        time, flux = time[mask], flux[mask]
        
        # Sort by time
        sort_idx = np.argsort(time)
        time, flux = time[sort_idx], flux[sort_idx]
        
        # Normalize flux to relative units
        median_flux = np.median(flux)
        flux = flux / median_flux
        
        # Remove outliers using sigma clipping (3-sigma)
        flux_median = np.median(flux)
        flux_std = np.std(flux)
        outlier_mask = np.abs(flux - flux_median) < 3 * flux_std
        
        return time[outlier_mask], flux[outlier_mask]
    
    def box_least_squares(self, time: np.ndarray, flux: np.ndarray) -> Dict:
        """
        Implement Box Least Squares algorithm for period detection
        Based on Kovács et al. 2002 and used by NASA's TESS pipeline
        """
        periods = np.logspace(np.log10(self.min_period), np.log10(self.max_period), 1000)
        best_power = 0
        best_period = 0
        best_t0 = 0
        best_duration = 0
        
        for period in periods:
            # Phase fold the data
            phase = ((time % period) / period)
            
            # Try different transit durations (1-20% of period)
            for duration_frac in np.linspace(0.01, 0.2, 20):
                duration = duration_frac * period
                
                # Try different transit centers
                for t0_frac in np.linspace(0, 1, 50):
                    # Calculate BLS power
                    power = self._calculate_bls_power(phase, flux, t0_frac, duration_frac)
                    
                    if power > best_power:
                        best_power = power
                        best_period = period
                        best_t0 = t0_frac * period
                        best_duration = duration
        
        return {
            'period': best_period,
            'power': best_power,
            't0': best_t0,
            'duration': best_duration
        }
    
    def _calculate_bls_power(self, phase: np.ndarray, flux: np.ndarray, 
                           t0_frac: float, duration_frac: float) -> float:
        """Calculate BLS power for given parameters"""
        # Define in-transit and out-of-transit phases
        transit_mask = np.abs(phase - t0_frac) < duration_frac / 2
        
        if np.sum(transit_mask) < 3:  # Need at least 3 points in transit
            return 0
        
        # Calculate mean flux in and out of transit
        flux_in = np.mean(flux[transit_mask])
        flux_out = np.mean(flux[~transit_mask])
        
        # Calculate BLS power (signal-to-noise ratio)
        n_in = np.sum(transit_mask)
        n_out = np.sum(~transit_mask)
        
        if n_in == 0 or n_out == 0:
            return 0
        
        # Standard deviation of out-of-transit flux
        sigma_out = np.std(flux[~transit_mask])
        
        if sigma_out == 0:
            return 0
        
        # BLS power calculation
        power = (flux_out - flux_in) * np.sqrt(n_in * n_out / (n_in + n_out)) / sigma_out
        
        return max(0, power)
    
    def fit_transit_model(self, time: np.ndarray, flux: np.ndarray, 
                         period: float, t0: float, duration: float) -> Dict:
        """
        Fit a simple transit model to the data
        Based on Mandel & Agol 2002 transit model
        """
        def transit_model(params):
            depth, period_fit, t0_fit, duration_fit = params
            
            # Phase fold
            phase = ((time - t0_fit) % period_fit) / period_fit
            phase[phase > 0.5] -= 1  # Center around 0
            
            # Simple box transit model
            model_flux = np.ones_like(time)
            transit_mask = np.abs(phase * period_fit) < duration_fit / 2
            model_flux[transit_mask] = 1 - depth
            
            return model_flux
        
        def chi_squared(params):
            if params[0] < 0 or params[0] > 0.1:  # Depth constraints
                return 1e10
            if params[1] < self.min_period or params[1] > self.max_period:
                return 1e10
            if params[3] < self.min_transit_duration or params[3] > params[1] / 2:
                return 1e10
                
            model = transit_model(params)
            return np.sum((flux - model) ** 2)
        
        # Initial guess
        initial_depth = max(0.001, 1 - np.min(flux))
        initial_params = [initial_depth, period, t0, duration]
        
        # Fit the model
        try:
            result = minimize(chi_squared, initial_params, method='Nelder-Mead')
            fitted_params = result.x
            
            # Calculate goodness of fit
            model_flux = transit_model(fitted_params)
            residuals = flux - model_flux
            chi2 = np.sum(residuals ** 2)
            reduced_chi2 = chi2 / (len(flux) - 4)  # 4 parameters
            
            return {
                'depth': fitted_params[0],
                'period': fitted_params[1],
                't0': fitted_params[2],
                'duration': fitted_params[3],
                'chi2': chi2,
                'reduced_chi2': reduced_chi2,
                'model_flux': model_flux.tolist()
            }
        except:
            return None
    
    def calculate_planet_properties(self, depth: float, period: float, 
                                  stellar_radius: float = 1.0) -> Dict:
        """
        Calculate physical planet properties from transit parameters
        Using standard exoplanet formulas
        """
        # Planet radius (in Earth radii)
        planet_radius = np.sqrt(depth) * stellar_radius * 109.2  # Solar to Earth radii
        
        # Semi-major axis (AU) using Kepler's third law
        stellar_mass = 1.0  # Solar masses (assumption)
        semi_major_axis = ((period / 365.25) ** 2 * stellar_mass) ** (1/3)
        
        # Equilibrium temperature (K)
        stellar_temp = 5778  # K (Sun-like star assumption)
        eq_temp = stellar_temp * np.sqrt(stellar_radius / (2 * semi_major_axis * 215))
        
        # Orbital velocity (km/s)
        orbital_velocity = 2 * np.pi * semi_major_axis * 149.6e6 / (period * 24 * 3600) / 1000
        
        return {
            'radius_earth': round(planet_radius, 2),
            'period_days': round(period, 3),
            'semi_major_axis_au': round(semi_major_axis, 4),
            'equilibrium_temp_k': round(eq_temp, 1),
            'orbital_velocity_kms': round(orbital_velocity, 2)
        }
    
    def calculate_detection_significance(self, time: np.ndarray, flux: np.ndarray,
                                       model_flux: np.ndarray) -> Dict:
        """
        Calculate statistical significance of detection
        """
        residuals = flux - model_flux
        noise_std = np.std(residuals)
        
        # Signal-to-noise ratio
        signal_depth = np.max(model_flux) - np.min(model_flux)
        snr = signal_depth / noise_std
        
        # False alarm probability (simplified)
        # In reality, this would involve more complex statistics
        false_alarm_prob = 1 / (1 + np.exp(snr - 5))
        
        # Detection confidence
        confidence = max(0, min(100, (snr - 3) / 7 * 100))
        
        return {
            'snr': round(snr, 2),
            'confidence_percent': round(confidence, 1),
            'false_alarm_probability': round(false_alarm_prob, 6),
            'detection_significance_sigma': round(snr, 1)
        }
    
    def analyze_lightcurve(self, csv_data: str) -> Dict:
        """
        Main analysis function that processes CSV data and returns results
        """
        try:
            # Parse CSV data
            lines = csv_data.strip().split('\n')
            header = lines[0].lower()
            
            # Detect column format
            if 'time' in header and 'flux' in header:
                data = []
                for line in lines[1:]:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        try:
                            time_val = float(parts[0])
                            flux_val = float(parts[1])
                            data.append([time_val, flux_val])
                        except ValueError:
                            continue
                
                if len(data) < 100:
                    return {'error': 'Insufficient data points. Need at least 100 measurements.'}
                
                data = np.array(data)
                time, flux = data[:, 0], data[:, 1]
            else:
                return {'error': 'CSV must contain "time" and "flux" columns'}
            
            # Preprocess data
            time, flux = self.preprocess_lightcurve(time, flux)
            
            if len(time) < 50:
                return {'error': 'Too few valid data points after preprocessing'}
            
            # Run BLS algorithm
            bls_result = self.box_least_squares(time, flux)
            
            # Check if significant period found
            if bls_result['power'] < self.detection_threshold:
                return {
                    'planet_detected': False,
                    'confidence': 15.0,
                    'analysis': {
                        'bls_power': round(bls_result['power'], 2),
                        'best_period': round(bls_result['period'], 3),
                        'message': 'No significant periodic signal detected'
                    }
                }
            
            # Fit transit model
            transit_fit = self.fit_transit_model(
                time, flux, 
                bls_result['period'], 
                bls_result['t0'], 
                bls_result['duration']
            )
            
            if transit_fit is None:
                return {
                    'planet_detected': False,
                    'confidence': 25.0,
                    'analysis': {'message': 'Transit model fitting failed'}
                }
            
            # Calculate planet properties
            planet_props = self.calculate_planet_properties(
                transit_fit['depth'], 
                transit_fit['period']
            )
            
            # Calculate detection significance
            significance = self.calculate_detection_significance(
                time, flux, np.array(transit_fit['model_flux'])
            )
            
            # Determine if planet is detected
            planet_detected = significance['snr'] > 5.0 and significance['confidence_percent'] > 70
            
            return {
                'planet_detected': planet_detected,
                'confidence': significance['confidence_percent'],
                'analysis': {
                    'bls_power': round(bls_result['power'], 2),
                    'signal_to_noise': significance['snr'],
                    'detection_significance': significance['detection_significance_sigma'],
                    'false_alarm_probability': significance['false_alarm_probability']
                },
                'planet_properties': planet_props if planet_detected else None,
                'transit_parameters': {
                    'depth_ppm': round(transit_fit['depth'] * 1e6, 1),
                    'period_days': round(transit_fit['period'], 3),
                    'duration_hours': round(transit_fit['duration'] * 24, 2),
                    'reduced_chi_squared': round(transit_fit['reduced_chi2'], 3)
                } if planet_detected else None
            }
            
        except Exception as e:
            return {'error': f'Analysis failed: {str(e)}'}

def main():
    csv_data = sys.stdin.read()
    
    if not csv_data or len(csv_data.strip()) == 0:
        print(json.dumps({'error': 'No CSV data provided'}))
        return
    
    detector = RealExoplanetDetector()
    result = detector.analyze_lightcurve(csv_data)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
