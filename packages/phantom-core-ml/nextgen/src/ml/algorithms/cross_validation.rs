//! Cross-validation and model selection utilities
//!
//! This module provides robust cross-validation techniques and hyperparameter
//! optimization methods for all implemented ML algorithms.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::*;
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use ndarray_rand::rand::{SeedableRng, Rng};
use ndarray_rand::rand::rngs::StdRng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

/// Cross-validation strategies
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum CrossValidationStrategy {
    /// K-Fold cross-validation
    KFold { k: usize, shuffle: bool, random_state: Option<u64> },
    /// Stratified K-Fold (for classification)
    StratifiedKFold { k: usize, random_state: Option<u64> },
    /// Leave-One-Out cross-validation
    LeaveOneOut,
    /// Time series split (for temporal data)
    TimeSeriesSplit { n_splits: usize, max_train_size: Option<usize> },
}

/// Cross-validation results
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CrossValidationResult {
    pub strategy: CrossValidationStrategy,
    pub scores: Vec<f64>,
    pub mean_score: f64,
    pub std_score: f64,
    pub fold_results: Vec<FoldResult>,
    pub best_params: Option<HashMap<String, serde_json::Value>>,
}

/// Individual fold result
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FoldResult {
    pub fold_index: usize,
    pub train_score: f64,
    pub validation_score: f64,
    pub training_time_ms: u64,
    pub prediction_time_ms: u64,
}

/// Hyperparameter optimization strategies
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum HyperparameterStrategy {
    /// Grid search over parameter combinations
    GridSearch {
        param_grid: HashMap<String, Vec<serde_json::Value>>,
        n_jobs: Option<i32>,
    },
    /// Random search over parameter distributions
    RandomSearch {
        param_distributions: HashMap<String, ParameterDistribution>,
        n_iter: usize,
        random_state: Option<u64>,
        n_jobs: Option<i32>,
    },
    /// Bayesian optimization (simplified)
    BayesianOptimization {
        param_bounds: HashMap<String, (f64, f64)>,
        n_calls: usize,
        random_state: Option<u64>,
        acquisition: AcquisitionFunction,
    },
}

/// Parameter distributions for random search
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ParameterDistribution {
    Uniform { low: f64, high: f64 },
    Normal { mean: f64, std: f64 },
    LogUniform { low: f64, high: f64 },
    Choice { choices: Vec<serde_json::Value> },
    IntUniform { low: i32, high: i32 },
}

/// Acquisition functions for Bayesian optimization
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum AcquisitionFunction {
    ExpectedImprovement,
    ProbabilityOfImprovement,
    UpperConfidenceBound { kappa: f64 },
}

/// Cross-validation executor
pub struct CrossValidator {
    strategy: CrossValidationStrategy,
    scoring_metric: ScoringMetric,
    n_jobs: Option<i32>,
    verbose: bool,
}

/// Scoring metrics for evaluation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ScoringMetric {
    // Regression metrics
    MeanSquaredError,
    MeanAbsoluteError,
    RSquared,

    // Classification metrics
    Accuracy,
    Precision,
    Recall,
    F1Score,
    RocAuc,

    // Clustering metrics
    SilhouetteScore,
    CalinskiHarabasz,
    DaviesBouldin,

    // Custom metric
    Custom(fn(&Array1<f64>, &Array1<f64>) -> f64),
}

impl CrossValidator {
    pub fn new(strategy: CrossValidationStrategy) -> Self {
        Self {
            strategy,
            scoring_metric: ScoringMetric::MeanSquaredError,
            n_jobs: None,
            verbose: false,
        }
    }

    pub fn with_scoring(mut self, metric: ScoringMetric) -> Self {
        self.scoring_metric = metric;
        self
    }

    pub fn with_n_jobs(mut self, n_jobs: i32) -> Self {
        self.n_jobs = Some(n_jobs);
        self
    }

    pub fn with_verbose(mut self, verbose: bool) -> Self {
        self.verbose = verbose;
        self
    }

    /// Perform cross-validation for regression algorithms
    pub fn cross_validate_regression<T: RegressionAlgorithm + Clone + Send + Sync>(
        &self,
        algorithm: &T,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
    ) -> Result<CrossValidationResult> {
        let splits = self.generate_splits(features.nrows(), Some(targets))?;
        let mut fold_results = Vec::new();

        // Process folds in parallel if n_jobs allows
        let results: Vec<Result<FoldResult>> = if self.n_jobs.unwrap_or(1) != 1 {
            splits.par_iter().enumerate().map(|(fold_idx, (train_idx, val_idx))| {
                self.evaluate_fold_regression(algorithm, features, targets, train_idx, val_idx, fold_idx)
            }).collect()
        } else {
            splits.iter().enumerate().map(|(fold_idx, (train_idx, val_idx))| {
                self.evaluate_fold_regression(algorithm, features, targets, train_idx, val_idx, fold_idx)
            }).collect()
        };

        for result in results {
            fold_results.push(result?);
        }

        let scores: Vec<f64> = fold_results.iter().map(|r| r.validation_score).collect();
        let mean_score = scores.iter().sum::<f64>() / scores.len() as f64;
        let std_score = {
            let variance = scores.iter()
                .map(|&s| (s - mean_score).powi(2))
                .sum::<f64>() / scores.len() as f64;
            variance.sqrt()
        };

        Ok(CrossValidationResult {
            strategy: self.strategy.clone(),
            scores,
            mean_score,
            std_score,
            fold_results,
            best_params: None,
        })
    }

    /// Perform cross-validation for classification algorithms
    pub fn cross_validate_classification<T: ClassificationAlgorithm + Clone + Send + Sync>(
        &self,
        algorithm: &T,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
    ) -> Result<CrossValidationResult> {
        let splits = self.generate_splits(features.nrows(), Some(targets))?;
        let mut fold_results = Vec::new();

        let results: Vec<Result<FoldResult>> = if self.n_jobs.unwrap_or(1) != 1 {
            splits.par_iter().enumerate().map(|(fold_idx, (train_idx, val_idx))| {
                self.evaluate_fold_classification(algorithm, features, targets, train_idx, val_idx, fold_idx)
            }).collect()
        } else {
            splits.iter().enumerate().map(|(fold_idx, (train_idx, val_idx))| {
                self.evaluate_fold_classification(algorithm, features, targets, train_idx, val_idx, fold_idx)
            }).collect()
        };

        for result in results {
            fold_results.push(result?);
        }

        let scores: Vec<f64> = fold_results.iter().map(|r| r.validation_score).collect();
        let mean_score = scores.iter().sum::<f64>() / scores.len() as f64;
        let std_score = {
            let variance = scores.iter()
                .map(|&s| (s - mean_score).powi(2))
                .sum::<f64>() / scores.len() as f64;
            variance.sqrt()
        };

        Ok(CrossValidationResult {
            strategy: self.strategy.clone(),
            scores,
            mean_score,
            std_score,
            fold_results,
            best_params: None,
        })
    }

    /// Generate train/validation splits based on strategy
    fn generate_splits(&self, n_samples: usize, targets: Option<ArrayView1<f64>>) -> Result<Vec<(Vec<usize>, Vec<usize>)>> {
        match &self.strategy {
            CrossValidationStrategy::KFold { k, shuffle, random_state } => {
                self.generate_kfold_splits(n_samples, *k, *shuffle, *random_state)
            },
            CrossValidationStrategy::StratifiedKFold { k, random_state } => {
                if let Some(targets) = targets {
                    self.generate_stratified_kfold_splits(targets, *k, *random_state)
                } else {
                    return Err(PhantomMLError::Configuration(
                        "StratifiedKFold requires target values".to_string()
                    ));
                }
            },
            CrossValidationStrategy::LeaveOneOut => {
                self.generate_loo_splits(n_samples)
            },
            CrossValidationStrategy::TimeSeriesSplit { n_splits, max_train_size } => {
                self.generate_timeseries_splits(n_samples, *n_splits, *max_train_size)
            },
        }
    }

    /// Generate K-Fold splits
    fn generate_kfold_splits(&self, n_samples: usize, k: usize, shuffle: bool, random_state: Option<u64>) -> Result<Vec<(Vec<usize>, Vec<usize>)>> {
        if k > n_samples {
            return Err(PhantomMLError::Configuration(
                format!("Cannot have more folds ({}) than samples ({})", k, n_samples)
            ));
        }

        let mut indices: Vec<usize> = (0..n_samples).collect();

        if shuffle {
            let mut rng = match random_state {
                Some(seed) => StdRng::seed_from_u64(seed),
                None => StdRng::from_entropy(),
            };

            // Fisher-Yates shuffle
            for i in (1..n_samples).rev() {
                let j = rng.gen_range(0..=i);
                indices.swap(i, j);
            }
        }

        let mut splits = Vec::new();
        let fold_size = n_samples / k;
        let remainder = n_samples % k;

        for fold_idx in 0..k {
            let start = fold_idx * fold_size + fold_idx.min(remainder);
            let end = start + fold_size + if fold_idx < remainder { 1 } else { 0 };

            let val_indices = indices[start..end].to_vec();
            let train_indices: Vec<usize> = indices.iter()
                .enumerate()
                .filter(|(i, _)| *i < start || *i >= end)
                .map(|(_, &idx)| idx)
                .collect();

            splits.push((train_indices, val_indices));
        }

        Ok(splits)
    }

    /// Generate stratified K-Fold splits (simplified implementation)
    fn generate_stratified_kfold_splits(&self, targets: ArrayView1<f64>, k: usize, random_state: Option<u64>) -> Result<Vec<(Vec<usize>, Vec<usize>)>> {
        // For simplicity, we'll treat this as regular K-Fold
        // A full implementation would stratify by class distribution
        self.generate_kfold_splits(targets.len(), k, true, random_state)
    }

    /// Generate Leave-One-Out splits
    fn generate_loo_splits(&self, n_samples: usize) -> Result<Vec<(Vec<usize>, Vec<usize>)>> {
        let mut splits = Vec::new();

        for i in 0..n_samples {
            let val_indices = vec![i];
            let train_indices: Vec<usize> = (0..n_samples).filter(|&j| j != i).collect();
            splits.push((train_indices, val_indices));
        }

        Ok(splits)
    }

    /// Generate time series splits
    fn generate_timeseries_splits(&self, n_samples: usize, n_splits: usize, max_train_size: Option<usize>) -> Result<Vec<(Vec<usize>, Vec<usize>)>> {
        if n_splits >= n_samples {
            return Err(PhantomMLError::Configuration(
                "Too many splits for time series data".to_string()
            ));
        }

        let mut splits = Vec::new();
        let test_size = n_samples / (n_splits + 1);

        for split_idx in 1..=n_splits {
            let test_end = split_idx * test_size + test_size;
            let test_start = test_end - test_size;

            let train_end = test_start;
            let train_start = if let Some(max_size) = max_train_size {
                (train_end - max_size).max(0)
            } else {
                0
            };

            if train_start < train_end && test_start < test_end && test_end <= n_samples {
                let train_indices: Vec<usize> = (train_start..train_end).collect();
                let val_indices: Vec<usize> = (test_start..test_end).collect();
                splits.push((train_indices, val_indices));
            }
        }

        Ok(splits)
    }

    /// Evaluate a single fold for regression
    fn evaluate_fold_regression<T: RegressionAlgorithm + Clone>(
        &self,
        algorithm: &T,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        train_idx: &[usize],
        val_idx: &[usize],
        fold_index: usize,
    ) -> Result<FoldResult> {
        use std::time::Instant;

        // Create training and validation sets
        let train_features = self.select_rows(features, train_idx)?;
        let train_targets = self.select_elements(targets, train_idx)?;
        let val_features = self.select_rows(features, val_idx)?;
        let val_targets = self.select_elements(targets, val_idx)?;

        // Train model
        let start_time = Instant::now();
        let mut model = algorithm.clone();
        model.fit(train_features.view(), train_targets.view())?;
        let training_time_ms = start_time.elapsed().as_millis() as u64;

        // Make predictions
        let pred_start = Instant::now();
        let train_predictions = model.predict(train_features.view())?;
        let val_predictions = model.predict(val_features.view())?;
        let prediction_time_ms = pred_start.elapsed().as_millis() as u64;

        // Calculate scores
        let train_score = self.calculate_score(&train_predictions, &train_targets)?;
        let validation_score = self.calculate_score(&val_predictions, &val_targets)?;

        Ok(FoldResult {
            fold_index,
            train_score,
            validation_score,
            training_time_ms,
            prediction_time_ms,
        })
    }

    /// Evaluate a single fold for classification
    fn evaluate_fold_classification<T: ClassificationAlgorithm + Clone>(
        &self,
        algorithm: &T,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        train_idx: &[usize],
        val_idx: &[usize],
        fold_index: usize,
    ) -> Result<FoldResult> {
        use std::time::Instant;

        // Create training and validation sets
        let train_features = self.select_rows(features, train_idx)?;
        let train_targets = self.select_elements(targets, train_idx)?;
        let val_features = self.select_rows(features, val_idx)?;
        let val_targets = self.select_elements(targets, val_idx)?;

        // Train model
        let start_time = Instant::now();
        let mut model = algorithm.clone();
        model.fit(train_features.view(), train_targets.view())?;
        let training_time_ms = start_time.elapsed().as_millis() as u64;

        // Make predictions
        let pred_start = Instant::now();
        let train_predictions = model.predict(train_features.view())?;
        let val_predictions = model.predict(val_features.view())?;
        let prediction_time_ms = pred_start.elapsed().as_millis() as u64;

        // Calculate scores
        let train_score = self.calculate_score(&train_predictions, &train_targets)?;
        let validation_score = self.calculate_score(&val_predictions, &val_targets)?;

        Ok(FoldResult {
            fold_index,
            train_score,
            validation_score,
            training_time_ms,
            prediction_time_ms,
        })
    }

    /// Select rows from a 2D array
    fn select_rows(&self, array: ArrayView2<f64>, indices: &[usize]) -> Result<Array2<f64>> {
        let mut result = Array2::zeros((indices.len(), array.ncols()));
        for (i, &idx) in indices.iter().enumerate() {
            if idx >= array.nrows() {
                return Err(PhantomMLError::DataProcessing(
                    format!("Index {} out of bounds for array with {} rows", idx, array.nrows())
                ));
            }
            result.row_mut(i).assign(&array.row(idx));
        }
        Ok(result)
    }

    /// Select elements from a 1D array
    fn select_elements(&self, array: ArrayView1<f64>, indices: &[usize]) -> Result<Array1<f64>> {
        let mut result = Array1::zeros(indices.len());
        for (i, &idx) in indices.iter().enumerate() {
            if idx >= array.len() {
                return Err(PhantomMLError::DataProcessing(
                    format!("Index {} out of bounds for array with {} elements", idx, array.len())
                ));
            }
            result[i] = array[idx];
        }
        Ok(result)
    }

    /// Calculate score based on scoring metric
    fn calculate_score(&self, predictions: &Array1<f64>, actual: &Array1<f64>) -> Result<f64> {
        if predictions.len() != actual.len() {
            return Err(PhantomMLError::DataProcessing(
                "Predictions and actual values must have same length".to_string()
            ));
        }

        match &self.scoring_metric {
            ScoringMetric::MeanSquaredError => {
                let mse = predictions.iter()
                    .zip(actual.iter())
                    .map(|(&pred, &actual)| (pred - actual).powi(2))
                    .sum::<f64>() / predictions.len() as f64;
                Ok(-mse) // Negative because higher is better in cross-validation
            },
            ScoringMetric::MeanAbsoluteError => {
                let mae = predictions.iter()
                    .zip(actual.iter())
                    .map(|(&pred, &actual)| (pred - actual).abs())
                    .sum::<f64>() / predictions.len() as f64;
                Ok(-mae) // Negative because higher is better
            },
            ScoringMetric::RSquared => {
                let mean_actual = actual.mean().unwrap();
                let ss_tot: f64 = actual.iter().map(|&y| (y - mean_actual).powi(2)).sum();
                let ss_res: f64 = predictions.iter()
                    .zip(actual.iter())
                    .map(|(&pred, &actual)| (actual - pred).powi(2))
                    .sum();

                if ss_tot == 0.0 {
                    Ok(1.0)
                } else {
                    Ok(1.0 - (ss_res / ss_tot))
                }
            },
            ScoringMetric::Accuracy => {
                let correct = predictions.iter()
                    .zip(actual.iter())
                    .filter(|(&pred, &actual)| (pred - actual).abs() < 0.5)
                    .count();
                Ok(correct as f64 / predictions.len() as f64)
            },
            _ => {
                // For other metrics, implement as needed
                Ok(0.0)
            }
        }
    }
}

/// Hyperparameter optimization
pub struct HyperparameterOptimizer {
    strategy: HyperparameterStrategy,
    cv_strategy: CrossValidationStrategy,
    scoring_metric: ScoringMetric,
    n_jobs: Option<i32>,
    verbose: bool,
}

impl HyperparameterOptimizer {
    pub fn new(strategy: HyperparameterStrategy) -> Self {
        Self {
            strategy,
            cv_strategy: CrossValidationStrategy::KFold { k: 5, shuffle: true, random_state: Some(42) },
            scoring_metric: ScoringMetric::MeanSquaredError,
            n_jobs: None,
            verbose: false,
        }
    }

    pub fn with_cv_strategy(mut self, cv_strategy: CrossValidationStrategy) -> Self {
        self.cv_strategy = cv_strategy;
        self
    }

    pub fn with_scoring(mut self, metric: ScoringMetric) -> Self {
        self.scoring_metric = metric;
        self
    }

    /// Optimize hyperparameters for a regression algorithm
    pub fn optimize_regression<T, F>(
        &self,
        create_algorithm: F,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
    ) -> Result<(HashMap<String, serde_json::Value>, f64)>
    where
        T: RegressionAlgorithm + Clone + Send + Sync,
        F: Fn(HashMap<String, serde_json::Value>) -> Result<T> + Send + Sync + Clone,
    {
        match &self.strategy {
            HyperparameterStrategy::GridSearch { param_grid, n_jobs } => {
                self.grid_search_regression(create_algorithm, param_grid, features, targets, *n_jobs)
            },
            HyperparameterStrategy::RandomSearch { param_distributions, n_iter, random_state, n_jobs } => {
                self.random_search_regression(create_algorithm, param_distributions, *n_iter, *random_state, features, targets, *n_jobs)
            },
            HyperparameterStrategy::BayesianOptimization { .. } => {
                // Simplified implementation - would use proper Bayesian optimization library
                Err(PhantomMLError::Configuration(
                    "Bayesian optimization not fully implemented yet".to_string()
                ))
            },
        }
    }

    /// Grid search for regression algorithms
    fn grid_search_regression<T, F>(
        &self,
        create_algorithm: F,
        param_grid: &HashMap<String, Vec<serde_json::Value>>,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        n_jobs: Option<i32>,
    ) -> Result<(HashMap<String, serde_json::Value>, f64)>
    where
        T: RegressionAlgorithm + Clone + Send + Sync,
        F: Fn(HashMap<String, serde_json::Value>) -> Result<T> + Send + Sync + Clone,
    {
        // Generate all parameter combinations
        let param_combinations = self.generate_param_combinations(param_grid)?;

        let cv = CrossValidator::new(self.cv_strategy.clone())
            .with_scoring(self.scoring_metric.clone());

        let mut best_params = HashMap::new();
        let mut best_score = f64::NEG_INFINITY;

        // Evaluate each combination
        let results: Vec<Result<(HashMap<String, serde_json::Value>, f64)>> = if n_jobs.unwrap_or(1) != 1 {
            param_combinations.par_iter().map(|params| {
                let algorithm = create_algorithm(params.clone())?;
                let cv_result = cv.cross_validate_regression(&algorithm, features, targets)?;
                Ok((params.clone(), cv_result.mean_score))
            }).collect()
        } else {
            param_combinations.iter().map(|params| {
                let algorithm = create_algorithm(params.clone())?;
                let cv_result = cv.cross_validate_regression(&algorithm, features, targets)?;
                Ok((params.clone(), cv_result.mean_score))
            }).collect()
        };

        for result in results {
            let (params, score) = result?;
            if score > best_score {
                best_score = score;
                best_params = params;
            }
        }

        Ok((best_params, best_score))
    }

    /// Random search for regression algorithms
    fn random_search_regression<T, F>(
        &self,
        create_algorithm: F,
        param_distributions: &HashMap<String, ParameterDistribution>,
        n_iter: usize,
        random_state: Option<u64>,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        n_jobs: Option<i32>,
    ) -> Result<(HashMap<String, serde_json::Value>, f64)>
    where
        T: RegressionAlgorithm + Clone + Send + Sync,
        F: Fn(HashMap<String, serde_json::Value>) -> Result<T> + Send + Sync + Clone,
    {
        let mut rng = match random_state {
            Some(seed) => StdRng::seed_from_u64(seed),
            None => StdRng::from_entropy(),
        };

        // Generate random parameter combinations
        let mut param_combinations = Vec::new();
        for _ in 0..n_iter {
            let mut params = HashMap::new();
            for (param_name, distribution) in param_distributions {
                let value = self.sample_from_distribution(distribution, &mut rng)?;
                params.insert(param_name.clone(), value);
            }
            param_combinations.push(params);
        }

        let cv = CrossValidator::new(self.cv_strategy.clone())
            .with_scoring(self.scoring_metric.clone());

        let mut best_params = HashMap::new();
        let mut best_score = f64::NEG_INFINITY;

        // Evaluate each combination
        for params in param_combinations {
            let algorithm = create_algorithm(params.clone())?;
            let cv_result = cv.cross_validate_regression(&algorithm, features, targets)?;

            if cv_result.mean_score > best_score {
                best_score = cv_result.mean_score;
                best_params = params;
            }
        }

        Ok((best_params, best_score))
    }

    /// Generate all parameter combinations for grid search
    fn generate_param_combinations(&self, param_grid: &HashMap<String, Vec<serde_json::Value>>) -> Result<Vec<HashMap<String, serde_json::Value>>> {
        if param_grid.is_empty() {
            return Ok(vec![HashMap::new()]);
        }

        let param_names: Vec<&String> = param_grid.keys().collect();
        let param_values: Vec<&Vec<serde_json::Value>> = param_grid.values().collect();

        let mut combinations = Vec::new();
        let total_combinations: usize = param_values.iter().map(|v| v.len()).product();

        for i in 0..total_combinations {
            let mut params = HashMap::new();
            let mut index = i;

            for (j, param_name) in param_names.iter().enumerate() {
                let values = &param_values[j];
                let value_index = index % values.len();
                params.insert(param_name.to_string(), values[value_index].clone());
                index /= values.len();
            }

            combinations.push(params);
        }

        Ok(combinations)
    }

    /// Sample from parameter distribution
    fn sample_from_distribution(&self, distribution: &ParameterDistribution, rng: &mut StdRng) -> Result<serde_json::Value> {
        match distribution {
            ParameterDistribution::Uniform { low, high } => {
                let value = rng.gen_range(*low..*high);
                Ok(serde_json::Value::Number(serde_json::Number::from_f64(value).unwrap()))
            },
            ParameterDistribution::Normal { mean, std } => {
                use ndarray_rand::rand_distr::{Distribution, Normal};
                let normal = Normal::new(*mean, *std).map_err(|e| PhantomMLError::Configuration(e.to_string()))?;
                let value = normal.sample(rng);
                Ok(serde_json::Value::Number(serde_json::Number::from_f64(value).unwrap()))
            },
            ParameterDistribution::LogUniform { low, high } => {
                let log_low = low.ln();
                let log_high = high.ln();
                let log_value = rng.gen_range(log_low..log_high);
                let value = log_value.exp();
                Ok(serde_json::Value::Number(serde_json::Number::from_f64(value).unwrap()))
            },
            ParameterDistribution::Choice { choices } => {
                if choices.is_empty() {
                    return Err(PhantomMLError::Configuration("Empty choices list".to_string()));
                }
                let index = rng.gen_range(0..choices.len());
                Ok(choices[index].clone())
            },
            ParameterDistribution::IntUniform { low, high } => {
                let value = rng.gen_range(*low..*high);
                Ok(serde_json::Value::Number(serde_json::Number::from(value)))
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ml::algorithms::linear_regression::*;
    use ndarray::Array;

    #[test]
    fn test_kfold_cross_validation() {
        let features = Array::ones((100, 3));
        let targets = Array::from_iter(0..100).mapv(|x| x as f64);

        let cv = CrossValidator::new(CrossValidationStrategy::KFold {
            k: 5,
            shuffle: true,
            random_state: Some(42)
        });

        let config = LinearRegressionConfig {
            learning_rate: 0.01,
            max_iterations: 1000,
            regularization: RegularizationType::None,
            tolerance: 1e-6,
            fit_intercept: true,
            normalize: false,
            solver: SolverType::GradientDescent,
        };

        let algorithm = LinearRegression::new(config);
        let result = cv.cross_validate_regression(&algorithm, features.view(), targets.view());

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.scores.len(), 5);
    }

    #[test]
    fn test_grid_search() {
        let features = Array::ones((50, 2));
        let targets = Array::from_iter(0..50).mapv(|x| x as f64 * 2.0 + 1.0);

        let mut param_grid = HashMap::new();
        param_grid.insert("learning_rate".to_string(), vec![
            serde_json::Value::Number(serde_json::Number::from_f64(0.01).unwrap()),
            serde_json::Value::Number(serde_json::Number::from_f64(0.1).unwrap()),
        ]);
        param_grid.insert("max_iterations".to_string(), vec![
            serde_json::Value::Number(serde_json::Number::from(100)),
            serde_json::Value::Number(serde_json::Number::from(1000)),
        ]);

        let optimizer = HyperparameterOptimizer::new(HyperparameterStrategy::GridSearch {
            param_grid,
            n_jobs: Some(1)
        });

        let create_algorithm = |params: HashMap<String, serde_json::Value>| -> Result<LinearRegression> {
            let learning_rate = params.get("learning_rate")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.01);
            let max_iterations = params.get("max_iterations")
                .and_then(|v| v.as_u64())
                .unwrap_or(1000) as usize;

            let config = LinearRegressionConfig {
                learning_rate,
                max_iterations,
                regularization: RegularizationType::None,
                tolerance: 1e-6,
                fit_intercept: true,
                normalize: false,
                solver: SolverType::GradientDescent,
            };

            Ok(LinearRegression::new(config))
        };

        let result = optimizer.optimize_regression(create_algorithm, features.view(), targets.view());
        assert!(result.is_ok());

        let (best_params, best_score) = result.unwrap();
        assert!(best_params.contains_key("learning_rate"));
        assert!(best_params.contains_key("max_iterations"));
    }
}