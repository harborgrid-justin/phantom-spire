//! Production-ready machine learning algorithms
//!
//! This module contains real ML implementations to replace the simulated ones.
//! All algorithms are designed for production use with proper error handling,
//! memory efficiency, and performance optimizations.

pub mod linear_regression;
pub mod random_forest;
pub mod neural_networks;
pub mod clustering;
pub mod anomaly_detection;
pub mod time_series;
pub mod preprocessing;
pub mod evaluation;
pub mod cross_validation;

pub use linear_regression::*;
pub use random_forest::*;
pub use neural_networks::*;
pub use clustering::*;
pub use anomaly_detection::*;
pub use time_series::*;
pub use preprocessing::*;
pub use evaluation::*;
pub use cross_validation::*;

use crate::error::{PhantomMLError, Result};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Trait for all machine learning algorithms
pub trait MLAlgorithm: Send + Sync {
    type Config: Clone + Send + Sync;
    type Model: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>;

    /// Create a new instance with configuration
    fn new(config: Self::Config) -> Self;

    /// Train the algorithm on the provided data
    fn fit(&mut self, features: ArrayView2<f64>, targets: ArrayView1<f64>) -> Result<()>;

    /// Make predictions on new data
    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<f64>>;

    /// Get the trained model for serialization
    fn model(&self) -> Option<&Self::Model>;

    /// Load a pre-trained model
    fn load_model(&mut self, model: Self::Model) -> Result<()>;

    /// Get feature importance scores (if supported)
    fn feature_importance(&self) -> Option<Array1<f64>> {
        None
    }

    /// Get model parameters as a string for inspection
    fn get_params(&self) -> HashMap<String, String>;
}

/// Trait for classification algorithms
pub trait ClassificationAlgorithm: MLAlgorithm {
    /// Predict class probabilities
    fn predict_proba(&self, features: ArrayView2<f64>) -> Result<Array2<f64>>;

    /// Get the number of classes
    fn n_classes(&self) -> usize;
}

/// Trait for regression algorithms
pub trait RegressionAlgorithm: MLAlgorithm {
    /// Get prediction intervals/confidence bounds
    fn predict_intervals(&self, features: ArrayView2<f64>, confidence: f64) -> Result<Array2<f64>>;
}

/// Trait for clustering algorithms (unsupervised)
pub trait ClusteringAlgorithm: Send + Sync {
    type Config: Clone + Send + Sync;
    type Model: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>;

    /// Create a new instance with configuration
    fn new(config: Self::Config) -> Self;

    /// Fit the clustering algorithm and return cluster assignments
    fn fit_predict(&mut self, features: ArrayView2<f64>) -> Result<Array1<i32>>;

    /// Predict cluster assignments for new data
    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>>;

    /// Get cluster centers (if applicable)
    fn cluster_centers(&self) -> Option<Array2<f64>>;

    /// Get the trained model
    fn model(&self) -> Option<&Self::Model>;

    /// Load a pre-trained model
    fn load_model(&mut self, model: Self::Model) -> Result<()>;
}

/// Common configuration parameters
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CommonConfig {
    pub random_state: Option<u64>,
    pub n_jobs: Option<i32>,
    pub verbose: bool,
}

impl Default for CommonConfig {
    fn default() -> Self {
        Self {
            random_state: Some(42),
            n_jobs: Some(-1), // Use all available cores
            verbose: false,
        }
    }
}

/// Validation utilities
pub fn validate_input_shapes(features: ArrayView2<f64>, targets: Option<ArrayView1<f64>>) -> Result<()> {
    if features.nrows() == 0 {
        return Err(PhantomMLError::DataProcessing(
            "Input features cannot be empty".to_string()
        ));
    }

    if features.ncols() == 0 {
        return Err(PhantomMLError::DataProcessing(
            "Features must have at least one column".to_string()
        ));
    }

    if let Some(targets) = targets {
        if features.nrows() != targets.len() {
            return Err(PhantomMLError::DataProcessing(
                format!(
                    "Number of samples mismatch: features have {} rows, targets have {} elements",
                    features.nrows(),
                    targets.len()
                )
            ));
        }
    }

    // Check for NaN or infinite values
    for &val in features.iter() {
        if !val.is_finite() {
            return Err(PhantomMLError::DataProcessing(
                "Features contain NaN or infinite values".to_string()
            ));
        }
    }

    if let Some(targets) = targets {
        for &val in targets.iter() {
            if !val.is_finite() {
                return Err(PhantomMLError::DataProcessing(
                    "Targets contain NaN or infinite values".to_string()
                ));
            }
        }
    }

    Ok(())
}

/// Split data into train/validation sets
pub fn train_validation_split(
    features: ArrayView2<f64>,
    targets: ArrayView1<f64>,
    validation_fraction: f64,
    random_state: Option<u64>,
) -> Result<(Array2<f64>, Array1<f64>, Array2<f64>, Array1<f64>)> {
    use ndarray_rand::rand::SeedableRng;
    use ndarray_rand::rand_distr::Uniform;
    use ndarray_rand::RandomExt;

    if validation_fraction <= 0.0 || validation_fraction >= 1.0 {
        return Err(PhantomMLError::Configuration(
            "validation_fraction must be between 0 and 1".to_string()
        ));
    }

    let n_samples = features.nrows();
    let n_val = (n_samples as f64 * validation_fraction) as usize;
    let n_train = n_samples - n_val;

    // Generate random indices
    let mut rng = match random_state {
        Some(seed) => ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed),
        None => ndarray_rand::rand::rngs::StdRng::from_entropy(),
    };

    let mut indices: Vec<usize> = (0..n_samples).collect();

    // Fisher-Yates shuffle
    for i in (1..n_samples).rev() {
        let j = (Array1::random_using((1,), Uniform::new(0.0, 1.0), &mut rng)[0] * (i + 1) as f64) as usize;
        indices.swap(i, j);
    }

    // Split indices
    let train_indices = &indices[..n_train];
    let val_indices = &indices[n_train..];

    // Create train arrays
    let mut x_train = Array2::zeros((n_train, features.ncols()));
    let mut y_train = Array1::zeros(n_train);

    for (i, &idx) in train_indices.iter().enumerate() {
        x_train.row_mut(i).assign(&features.row(idx));
        y_train[i] = targets[idx];
    }

    // Create validation arrays
    let mut x_val = Array2::zeros((n_val, features.ncols()));
    let mut y_val = Array1::zeros(n_val);

    for (i, &idx) in val_indices.iter().enumerate() {
        x_val.row_mut(i).assign(&features.row(idx));
        y_val[i] = targets[idx];
    }

    Ok((x_train, y_train, x_val, y_val))
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_validate_input_shapes() {
        let features = Array::zeros((100, 5));
        let targets = Array::zeros(100);

        assert!(validate_input_shapes(features.view(), Some(targets.view())).is_ok());

        // Test mismatched shapes
        let bad_targets = Array::zeros(50);
        assert!(validate_input_shapes(features.view(), Some(bad_targets.view())).is_err());

        // Test empty features
        let empty_features = Array::zeros((0, 5));
        assert!(validate_input_shapes(empty_features.view(), None).is_err());
    }

    #[test]
    fn test_train_validation_split() {
        let features = Array::ones((100, 3));
        let targets = Array::from_iter(0..100).mapv(|x| x as f64);

        let result = train_validation_split(
            features.view(),
            targets.view(),
            0.2,
            Some(42)
        );

        assert!(result.is_ok());
        let (x_train, y_train, x_val, y_val) = result.unwrap();

        assert_eq!(x_train.nrows(), 80);
        assert_eq!(y_train.len(), 80);
        assert_eq!(x_val.nrows(), 20);
        assert_eq!(y_val.len(), 20);
    }
}