"""
Setup script for the exoplanet ML pipeline
This script will prepare the environment for integrating with google-research/exoplanet-ml
"""

import os
import subprocess
import sys

def setup_ml_environment():
    """Setup the machine learning environment for exoplanet detection"""
    
    print("🚀 Setting up ExoPlanet ML Pipeline...")
    
    # Required packages for the ML pipeline
    required_packages = [
        'numpy',
        'pandas', 
        'scikit-learn',
        'tensorflow',
        'matplotlib',
        'astropy',  # For astronomical data handling
        'lightkurve',  # For Kepler/TESS data processing
    ]
    
    print("📦 Installing required packages...")
    for package in required_packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
    
    # Create directories for ML models and data
    directories = [
        'ml_models',
        'data/raw',
        'data/processed',
        'data/results'
    ]
    
    print("📁 Creating directory structure...")
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created {directory}")
    
    print("🎯 ML Pipeline setup complete!")
    print("\nNext steps:")
    print("1. Clone google-research/exoplanet-ml repository")
    print("2. Integrate the pre-trained models")
    print("3. Set up data preprocessing pipeline")
    
    return True

if __name__ == "__main__":
    setup_ml_environment()
