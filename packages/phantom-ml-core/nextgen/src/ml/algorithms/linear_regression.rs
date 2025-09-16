//! Linear Regression with Gradient Descent
//!
//! Production-ready implementation of linear regression using gradient descent optimization.
//! Supports both batch and stochastic gradient descent with regularization options.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{MLAlgorithm, RegressionAlgorithm, CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis, s};
use ndarray_linalg::norm::Norm;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LinearRegressionConfig {
    pub common: CommonConfig,
    pub learning_rate: f64,
    pub max_iterations: usize,
    pub tolerance: f64,
    pub regularization: RegularizationType,
    pub alpha: f64, // Regularization strength
    pub fit_intercept: bool,
    pub normalize: bool,
    pub batch_size: Option<usize>, // None for full batch, Some(size) for mini-batch
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum RegularizationType {
    None,
    L1, // Lasso
    L2, // Ridge
    ElasticNet(f64), // Elastic Net with l1_ratio parameter
}

impl Default for LinearRegressionConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            learning_rate: 0.01,
            max_iterations: 1000,
            tolerance: 1e-6,
            regularization: RegularizationType::None,
            alpha: 0.01,
            fit_intercept: true,
            normalize: false,
            batch_size: None, // Full batch by default
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LinearRegressionModel {
    pub weights: Array1<f64>,
    pub intercept: f64,
    pub n_features: usize,
    pub feature_means: Option<Array1<f64>>,
    pub feature_stds: Option<Array1<f64>>,
    pub training_history: Vec<f64>, // Loss history
}

pub struct LinearRegression {
    config: LinearRegressionConfig,
    model: Option<LinearRegressionModel>,
    rng: Option<ndarray_rand::rand::rngs::StdRng>,
}

impl MLAlgorithm for LinearRegression {
    type Config = LinearRegressionConfig;
    type Model = LinearRegressionModel;

    fn new(config: Self::Config) -> Self {
        use ndarray_rand::rand::SeedableRng;

        let rng = config.common.random_state.map(|seed| {
            ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed)
        });

        Self {
            config,
            model: None,
            rng,
        }
    }

    fn fit(&mut self, features: ArrayView2<f64>, targets: ArrayView1<f64>) -> Result<()> {
        validate_input_shapes(features, Some(targets))?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Prepare feature matrix (add intercept column if needed)
        let (x_processed, feature_means, feature_stds) = self.preprocess_features(features)?;
        let y = targets.to_owned();

        // Initialize weights
        let mut weights = if self.config.fit_intercept {
            Array1::zeros(n_features + 1)
        } else {
            Array1::zeros(n_features)
        };

        // Initialize weights with small random values
        if let Some(ref mut rng) = self.rng {
            use ndarray_rand::RandomExt;
            use ndarray_rand::rand_distr::Normal;

            let normal = Normal::new(0.0, 0.01).unwrap();
            weights = Array1::random_using(weights.len(), normal, rng);
        }

        let mut training_history = Vec::new();
        let mut prev_loss = f64::INFINITY;

        // Gradient descent training loop
        for iteration in 0..self.config.max_iterations {
            let (loss, gradients) = match self.config.batch_size {
                None => self.compute_full_batch_gradients(&x_processed, &y, &weights)?,
                Some(batch_size) => self.compute_mini_batch_gradients(
                    &x_processed, &y, &weights, batch_size, iteration
                )?,
            };

            // Update weights
            weights = &weights - self.config.learning_rate * &gradients;

            training_history.push(loss);

            // Check for convergence
            if (prev_loss - loss).abs() < self.config.tolerance {
                if self.config.common.verbose {
                    println!("Converged after {} iterations", iteration + 1);
                }
                break;
            }

            prev_loss = loss;

            if self.config.common.verbose && iteration % 100 == 0 {
                println!("Iteration {}: Loss = {:.6}", iteration, loss);
            }
        }

        // Extract intercept and weights
        let (intercept, weights) = if self.config.fit_intercept {
            (weights[0], weights.slice(s![1..]).to_owned())
        } else {
            (0.0, weights)
        };

        self.model = Some(LinearRegressionModel {
            weights,
            intercept,
            n_features,
            feature_means,
            feature_stds,
            training_history,
        });

        Ok(())
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not trained".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let (x_processed, _, _) = self.preprocess_features_with_stored_params(features, model)?;

        // Compute predictions: X * w + b
        let predictions = if self.config.fit_intercept {
            x_processed.dot(&model.weights) + model.intercept
        } else {
            x_processed.dot(&model.weights)
        };

        Ok(predictions)
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }

    fn get_params(&self) -> HashMap<String, String> {
        let mut params = HashMap::new();
        params.insert("learning_rate".to_string(), self.config.learning_rate.to_string());
        params.insert("max_iterations".to_string(), self.config.max_iterations.to_string());
        params.insert("tolerance".to_string(), self.config.tolerance.to_string());
        params.insert("alpha".to_string(), self.config.alpha.to_string());
        params.insert("fit_intercept".to_string(), self.config.fit_intercept.to_string());
        params.insert("normalize".to_string(), self.config.normalize.to_string());
        params.insert("regularization".to_string(), format!("{:?}", self.config.regularization));

        if let Some(ref model) = self.model {
            params.insert("n_features".to_string(), model.n_features.to_string());
            params.insert("intercept".to_string(), model.intercept.to_string());
            params.insert("final_loss".to_string(),
                model.training_history.last().unwrap_or(&0.0).to_string());
        }

        params
    }
}

impl RegressionAlgorithm for LinearRegression {
    fn predict_intervals(&self, features: ArrayView2<f64>, confidence: f64) -> Result<Array2<f64>> {
        let predictions = self.predict(features)?;
        let model = self.model.as_ref().unwrap();

        // Simple confidence interval estimation based on training residuals
        // In practice, you'd want to use the residual standard error from training
        let std_error = self.estimate_prediction_std_error(features)?;

        // Use t-distribution critical value (approximated with normal for simplicity)
        let alpha = 1.0 - confidence;
        let z_score = statrs::distribution::Normal::new(0.0, 1.0)
            .unwrap()
            .inverse_cdf(1.0 - alpha / 2.0);

        let mut intervals = Array2::zeros((predictions.len(), 2));

        for (i, (&pred, &std_err)) in predictions.iter().zip(std_error.iter()).enumerate() {
            let margin = z_score * std_err;
            intervals[[i, 0]] = pred - margin; // Lower bound
            intervals[[i, 1]] = pred + margin; // Upper bound
        }

        Ok(intervals)
    }
}

impl LinearRegression {
    fn preprocess_features(&self, features: ArrayView2<f64>) -> Result<(Array2<f64>, Option<Array1<f64>>, Option<Array1<f64>>)> {
        let mut x = features.to_owned();
        let mut feature_means = None;
        let mut feature_stds = None;

        // Normalize features if requested
        if self.config.normalize {
            let means = x.mean_axis(Axis(0)).unwrap();
            let stds = x.std_axis(Axis(0), 0.0);

            // Avoid division by zero
            let stds = stds.mapv(|s| if s.abs() < 1e-8 { 1.0 } else { s });

            x = (x - &means) / &stds;

            feature_means = Some(means);
            feature_stds = Some(stds);
        }

        // Add intercept column if needed
        if self.config.fit_intercept {
            let n_samples = x.nrows();
            let mut x_with_intercept = Array2::ones((n_samples, x.ncols() + 1));
            x_with_intercept.slice_mut(s![.., 1..]).assign(&x);
            x = x_with_intercept;
        }

        Ok((x, feature_means, feature_stds))
    }

    fn preprocess_features_with_stored_params(
        &self,
        features: ArrayView2<f64>,
        model: &LinearRegressionModel,
    ) -> Result<(Array2<f64>, Option<Array1<f64>>, Option<Array1<f64>>)> {
        let mut x = features.to_owned();

        // Apply normalization using stored parameters
        if let (Some(ref means), Some(ref stds)) = (&model.feature_means, &model.feature_stds) {
            x = (x - means) / stds;
        }

        // Add intercept column if needed (but don't include it in the returned weights)
        if self.config.fit_intercept {
            let n_samples = x.nrows();
            let mut x_with_intercept = Array2::ones((n_samples, x.ncols() + 1));
            x_with_intercept.slice_mut(s![.., 1..]).assign(&x);
            x = x_with_intercept;
        }

        Ok((x, model.feature_means.clone(), model.feature_stds.clone()))
    }

    fn compute_full_batch_gradients(
        &self,
        x: &Array2<f64>,
        y: &Array1<f64>,
        weights: &Array1<f64>,
    ) -> Result<(f64, Array1<f64>)> {
        let n_samples = x.nrows() as f64;

        // Forward pass
        let predictions = x.dot(weights);
        let residuals = &predictions - y;

        // Compute loss (MSE + regularization)
        let mse_loss = residuals.dot(&residuals) / (2.0 * n_samples);
        let reg_loss = self.compute_regularization_loss(weights);
        let total_loss = mse_loss + reg_loss;

        // Compute gradients
        let base_gradients = x.t().dot(&residuals) / n_samples;
        let reg_gradients = self.compute_regularization_gradients(weights);
        let gradients = base_gradients + reg_gradients;

        Ok((total_loss, gradients))
    }

    fn compute_mini_batch_gradients(
        &self,
        x: &Array2<f64>,
        y: &Array1<f64>,
        weights: &Array1<f64>,
        batch_size: usize,
        iteration: usize,
    ) -> Result<(f64, Array1<f64>)> {
        let n_samples = x.nrows();

        // Create batch indices (simple sequential batching)
        let start_idx = (iteration * batch_size) % n_samples;
        let end_idx = std::cmp::min(start_idx + batch_size, n_samples);

        let batch_x = x.slice(s![start_idx..end_idx, ..]);
        let batch_y = y.slice(s![start_idx..end_idx]);

        // Compute gradients on batch
        let batch_size_f = (end_idx - start_idx) as f64;
        let predictions = batch_x.dot(weights);
        let residuals = &predictions - &batch_y;

        let mse_loss = residuals.dot(&residuals) / (2.0 * batch_size_f);
        let reg_loss = self.compute_regularization_loss(weights);
        let total_loss = mse_loss + reg_loss;

        let base_gradients = batch_x.t().dot(&residuals) / batch_size_f;
        let reg_gradients = self.compute_regularization_gradients(weights);
        let gradients = base_gradients + reg_gradients;

        Ok((total_loss, gradients))
    }

    fn compute_regularization_loss(&self, weights: &Array1<f64>) -> f64 {
        match self.config.regularization {
            RegularizationType::None => 0.0,
            RegularizationType::L1 => {
                self.config.alpha * weights.iter().map(|w| w.abs()).sum::<f64>()
            },
            RegularizationType::L2 => {
                self.config.alpha * weights.dot(weights) / 2.0
            },
            RegularizationType::ElasticNet(l1_ratio) => {
                let l1_term = l1_ratio * weights.iter().map(|w| w.abs()).sum::<f64>();
                let l2_term = (1.0 - l1_ratio) * weights.dot(weights) / 2.0;
                self.config.alpha * (l1_term + l2_term)
            },
        }
    }

    fn compute_regularization_gradients(&self, weights: &Array1<f64>) -> Array1<f64> {
        match self.config.regularization {
            RegularizationType::None => Array1::zeros(weights.len()),
            RegularizationType::L1 => {
                self.config.alpha * weights.mapv(|w| if w > 0.0 { 1.0 } else if w < 0.0 { -1.0 } else { 0.0 })
            },
            RegularizationType::L2 => {
                self.config.alpha * weights
            },
            RegularizationType::ElasticNet(l1_ratio) => {
                let l1_grad = l1_ratio * weights.mapv(|w| if w > 0.0 { 1.0 } else if w < 0.0 { -1.0 } else { 0.0 });
                let l2_grad = (1.0 - l1_ratio) * weights;
                self.config.alpha * (l1_grad + l2_grad)
            },
        }
    }

    fn estimate_prediction_std_error(&self, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        // Simplified standard error estimation
        // In a full implementation, you'd compute the covariance matrix and use it
        let model = self.model.as_ref().unwrap();

        // For now, return a constant standard error based on final training loss
        let std_error = model.training_history.last().unwrap_or(&1.0).sqrt();
        Ok(Array1::from_elem(features.nrows(), std_error))
    }

    /// Get training loss history
    pub fn training_history(&self) -> Option<&Vec<f64>> {
        self.model.as_ref().map(|m| &m.training_history)
    }

    /// Compute R-squared score
    pub fn score(&self, features: ArrayView2<f64>, targets: ArrayView1<f64>) -> Result<f64> {
        let predictions = self.predict(features)?;
        let target_mean = targets.mean().unwrap();

        let ss_res = targets.iter().zip(predictions.iter())
            .map(|(&y_true, &y_pred)| (y_true - y_pred).powi(2))
            .sum::<f64>();

        let ss_tot = targets.iter()
            .map(|&y| (y - target_mean).powi(2))
            .sum::<f64>();

        let r2 = 1.0 - (ss_res / ss_tot);
        Ok(r2)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_linear_regression_fit_predict() {
        // Create simple linear data: y = 2x + 1 + noise
        let x = Array::from_shape_vec((100, 1), (0..100).map(|i| i as f64).collect()).unwrap();
        let y = x.mapv(|x| 2.0 * x + 1.0) + Array::from_vec(vec![0.1; 100]); // Add small noise

        let mut lr = LinearRegression::new(LinearRegressionConfig::default());

        assert!(lr.fit(x.view(), y.view()).is_ok());

        let predictions = lr.predict(x.view()).unwrap();
        let score = lr.score(x.view(), y.view()).unwrap();

        assert!(score > 0.95); // Should have high R² for this simple case
        assert!(predictions.len() == y.len());
    }

    #[test]
    fn test_linear_regression_with_regularization() {
        let x = Array::ones((50, 3));
        let y = Array::ones(50);

        let config = LinearRegressionConfig {
            regularization: RegularizationType::L2,
            alpha: 0.1,
            ..Default::default()
        };

        let mut lr = LinearRegression::new(config);
        assert!(lr.fit(x.view(), y.view()).is_ok());

        let predictions = lr.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 50);
    }

    #[test]
    fn test_prediction_intervals() {
        let x = Array::ones((20, 2));
        let y = Array::ones(20);

        let mut lr = LinearRegression::new(LinearRegressionConfig::default());
        lr.fit(x.view(), y.view()).unwrap();

        let intervals = lr.predict_intervals(x.view(), 0.95).unwrap();
        assert_eq!(intervals.shape(), &[20, 2]);

        // Lower bounds should be less than upper bounds
        for i in 0..20 {
            assert!(intervals[[i, 0]] <= intervals[[i, 1]]);
        }
    }
}