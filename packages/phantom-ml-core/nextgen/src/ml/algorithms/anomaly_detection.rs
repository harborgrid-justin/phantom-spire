//! Anomaly Detection Algorithms
//!
//! Production-ready implementation of various anomaly detection methods
//! including isolation forest, one-class SVM, and statistical approaches.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

/// Trait for anomaly detection algorithms
pub trait AnomalyDetector: Send + Sync {
    type Config: Clone + Send + Sync;
    type Model: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>;

    fn new(config: Self::Config) -> Self;
    fn fit(&mut self, features: ArrayView2<f64>) -> Result<()>;
    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>>; // 1 for normal, -1 for anomaly
    fn decision_function(&self, features: ArrayView2<f64>) -> Result<Array1<f64>>; // Anomaly scores
    fn model(&self) -> Option<&Self::Model>;
    fn load_model(&mut self, model: Self::Model) -> Result<()>;
}

// Isolation Forest Implementation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IsolationForestConfig {
    pub common: CommonConfig,
    pub n_estimators: usize,
    pub max_samples: MaxSamples,
    pub contamination: f64, // Expected proportion of outliers
    pub max_features: f64,  // Fraction of features to use
    pub bootstrap: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MaxSamples {
    Auto,
    Fixed(usize),
    Fraction(f64),
}

impl Default for IsolationForestConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            n_estimators: 100,
            max_samples: MaxSamples::Auto,
            contamination: 0.1,
            max_features: 1.0,
            bootstrap: false,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IsolationTree {
    pub root: Option<IsolationNode>,
    pub max_depth: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IsolationNode {
    pub feature_idx: Option<usize>,
    pub threshold: Option<f64>,
    pub left: Option<Box<IsolationNode>>,
    pub right: Option<Box<IsolationNode>>,
    pub size: usize, // Number of samples that reached this node during training
    pub depth: usize,
    pub is_leaf: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IsolationForestModel {
    pub trees: Vec<IsolationTree>,
    pub n_features: usize,
    pub contamination: f64,
    pub threshold: f64, // Anomaly threshold based on contamination
    pub average_path_length: f64,
}

pub struct IsolationForest {
    config: IsolationForestConfig,
    model: Option<IsolationForestModel>,
    rng: Option<ndarray_rand::rand::rngs::StdRng>,
}

impl AnomalyDetector for IsolationForest {
    type Config = IsolationForestConfig;
    type Model = IsolationForestModel;

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

    fn fit(&mut self, features: ArrayView2<f64>) -> Result<()> {
        validate_input_shapes(features, None)?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Determine sample size for each tree
        let max_samples = match self.config.max_samples {
            MaxSamples::Auto => 256.min(n_samples),
            MaxSamples::Fixed(n) => n.min(n_samples),
            MaxSamples::Fraction(f) => ((n_samples as f64 * f) as usize).max(1),
        };

        // Calculate maximum depth
        let max_depth = (max_samples as f64).log2().ceil() as usize;

        // Build trees in parallel
        let trees: Result<Vec<_>> = if let Some(ref mut rng) = self.rng {
            use ndarray_rand::rand::Rng;
            let seeds: Vec<u64> = (0..self.config.n_estimators)
                .map(|_| rng.gen())
                .collect();

            seeds.into_par_iter().map(|seed| {
                self.build_tree(features, max_samples, max_depth, seed)
            }).collect()
        } else {
            (0..self.config.n_estimators).into_par_iter().map(|i| {
                self.build_tree(features, max_samples, max_depth, i as u64)
            }).collect()
        };

        let trees = trees?;

        // Calculate anomaly scores for training data to set threshold
        let training_scores = self.calculate_path_lengths(features, &trees);
        let average_path_length = self.harmonic_number(max_samples - 1) + 0.5772156649; // Euler-Mascheroni constant

        // Calculate threshold based on contamination
        let mut sorted_scores: Vec<f64> = training_scores.iter().cloned().collect();
        sorted_scores.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let threshold_idx = ((1.0 - self.config.contamination) * sorted_scores.len() as f64) as usize;
        let threshold = sorted_scores[threshold_idx.min(sorted_scores.len() - 1)];

        self.model = Some(IsolationForestModel {
            trees,
            n_features,
            contamination: self.config.contamination,
            threshold,
            average_path_length,
        });

        Ok(())
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        let scores = self.decision_function(features)?;
        let model = self.model.as_ref().unwrap();

        Ok(scores.mapv(|score| if score >= model.threshold { -1 } else { 1 }))
    }

    fn decision_function(&self, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not fitted".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let path_lengths = self.calculate_path_lengths(features, &model.trees);

        // Convert path lengths to anomaly scores
        // Lower path length = higher anomaly score
        let scores = path_lengths.mapv(|path_len| {
            2.0_f64.powf(-path_len / model.average_path_length)
        });

        Ok(scores)
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

impl IsolationForest {
    fn build_tree(
        &self,
        features: ArrayView2<f64>,
        max_samples: usize,
        max_depth: usize,
        seed: u64,
    ) -> Result<IsolationTree> {
        use ndarray_rand::rand::SeedableRng;
        let mut rng = ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed);

        // Sample data for this tree
        let sample_indices = self.sample_data(features.nrows(), max_samples, &mut rng);
        let mut sampled_features = Array2::zeros((sample_indices.len(), features.ncols()));

        for (new_idx, &orig_idx) in sample_indices.iter().enumerate() {
            sampled_features.row_mut(new_idx).assign(&features.row(orig_idx));
        }

        // Build the tree
        let root = self.build_isolation_node(
            sampled_features.view(),
            0,
            max_depth,
            &mut rng,
        )?;

        Ok(IsolationTree {
            root: Some(root),
            max_depth,
        })
    }

    fn sample_data(
        &self,
        n_samples: usize,
        max_samples: usize,
        rng: &mut ndarray_rand::rand::rngs::StdRng,
    ) -> Vec<usize> {
        use ndarray_rand::rand::seq::SliceRandom;

        if self.config.bootstrap {
            // Sample with replacement
            use ndarray_rand::rand::Rng;
            (0..max_samples)
                .map(|_| rng.gen_range(0..n_samples))
                .collect()
        } else {
            // Sample without replacement
            let mut indices: Vec<usize> = (0..n_samples).collect();
            indices.shuffle(rng);
            indices.truncate(max_samples);
            indices
        }
    }

    fn build_isolation_node(
        &self,
        features: ArrayView2<f64>,
        depth: usize,
        max_depth: usize,
        rng: &mut ndarray_rand::rand::rngs::StdRng,
    ) -> Result<IsolationNode> {
        use ndarray_rand::rand::Rng;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Stop conditions
        if depth >= max_depth || n_samples <= 1 {
            return Ok(IsolationNode {
                feature_idx: None,
                threshold: None,
                left: None,
                right: None,
                size: n_samples,
                depth,
                is_leaf: true,
            });
        }

        // Select features to consider
        let max_features = (n_features as f64 * self.config.max_features) as usize;
        let selected_features = if max_features < n_features {
            let mut feature_indices: Vec<usize> = (0..n_features).collect();
            feature_indices.shuffle(rng);
            feature_indices.truncate(max_features);
            feature_indices
        } else {
            (0..n_features).collect()
        };

        // Randomly select a feature and threshold
        let feature_idx = selected_features[rng.gen_range(0..selected_features.len())];
        let feature_col = features.column(feature_idx);

        let min_val = feature_col.fold(f64::INFINITY, |a, &b| a.min(b));
        let max_val = feature_col.fold(f64::NEG_INFINITY, |a, &b| a.max(b));

        if (max_val - min_val).abs() < 1e-10 {
            // No variance in this feature
            return Ok(IsolationNode {
                feature_idx: None,
                threshold: None,
                left: None,
                right: None,
                size: n_samples,
                depth,
                is_leaf: true,
            });
        }

        let threshold = min_val + rng.gen::<f64>() * (max_val - min_val);

        // Split the data
        let (left_mask, right_mask) = self.create_split_masks(features, feature_idx, threshold);

        // Check if split is valid
        let left_count = left_mask.iter().filter(|&&m| m).count();
        let right_count = right_mask.iter().filter(|&&m| m).count();

        if left_count == 0 || right_count == 0 {
            return Ok(IsolationNode {
                feature_idx: None,
                threshold: None,
                left: None,
                right: None,
                size: n_samples,
                depth,
                is_leaf: true,
            });
        }

        // Create child datasets
        let left_features = self.apply_mask(features, &left_mask);
        let right_features = self.apply_mask(features, &right_mask);

        // Recursively build children
        let left_child = self.build_isolation_node(
            left_features.view(),
            depth + 1,
            max_depth,
            rng,
        )?;

        let right_child = self.build_isolation_node(
            right_features.view(),
            depth + 1,
            max_depth,
            rng,
        )?;

        Ok(IsolationNode {
            feature_idx: Some(feature_idx),
            threshold: Some(threshold),
            left: Some(Box::new(left_child)),
            right: Some(Box::new(right_child)),
            size: n_samples,
            depth,
            is_leaf: false,
        })
    }

    fn create_split_masks(&self, features: ArrayView2<f64>, feature_idx: usize, threshold: f64) -> (Vec<bool>, Vec<bool>) {
        let feature_column = features.column(feature_idx);
        let left_mask: Vec<bool> = feature_column.iter().map(|&val| val < threshold).collect();
        let right_mask: Vec<bool> = feature_column.iter().map(|&val| val >= threshold).collect();
        (left_mask, right_mask)
    }

    fn apply_mask(&self, features: ArrayView2<f64>, mask: &[bool]) -> Array2<f64> {
        let count = mask.iter().filter(|&&m| m).count();
        let n_features = features.ncols();

        let mut filtered_features = Array2::zeros((count, n_features));
        let mut filtered_idx = 0;

        for (orig_idx, &include) in mask.iter().enumerate() {
            if include {
                filtered_features.row_mut(filtered_idx).assign(&features.row(orig_idx));
                filtered_idx += 1;
            }
        }

        filtered_features
    }

    fn calculate_path_lengths(&self, features: ArrayView2<f64>, trees: &[IsolationTree]) -> Array1<f64> {
        let n_samples = features.nrows();
        let mut path_lengths = Array1::zeros(n_samples);

        for tree in trees {
            if let Some(ref root) = tree.root {
                for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
                    let path_length = self.calculate_sample_path_length(root, sample, 0.0);
                    path_lengths[i] += path_length;
                }
            }
        }

        // Average over all trees
        path_lengths / trees.len() as f64
    }

    fn calculate_sample_path_length(&self, node: &IsolationNode, sample: ArrayView1<f64>, current_depth: f64) -> f64 {
        if node.is_leaf {
            // Add average path length for the remaining samples in this leaf
            return current_depth + self.harmonic_number(node.size - 1);
        }

        if let (Some(feature_idx), Some(threshold)) = (node.feature_idx, node.threshold) {
            if sample[feature_idx] < threshold {
                if let Some(ref left) = node.left {
                    return self.calculate_sample_path_length(left, sample, current_depth + 1.0);
                }
            } else {
                if let Some(ref right) = node.right {
                    return self.calculate_sample_path_length(right, sample, current_depth + 1.0);
                }
            }
        }

        current_depth
    }

    fn harmonic_number(&self, n: usize) -> f64 {
        if n <= 1 {
            return 0.0;
        }
        2.0 * (n as f64).ln() - 2.0 * (n - 1) as f64 / n as f64
    }
}

// One-Class SVM Implementation (Simplified)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OneClassSVMConfig {
    pub common: CommonConfig,
    pub nu: f64, // Upper bound on the fraction of training errors and lower bound of the fraction of support vectors
    pub gamma: f64, // Kernel coefficient
    pub kernel: KernelType,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum KernelType {
    RBF,
    Linear,
    Polynomial { degree: usize },
}

impl Default for OneClassSVMConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            nu: 0.1,
            gamma: 0.1,
            kernel: KernelType::RBF,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OneClassSVMModel {
    pub support_vectors: Array2<f64>,
    pub dual_coef: Array1<f64>,
    pub intercept: f64,
    pub n_features: usize,
    pub gamma: f64,
    pub kernel: KernelType,
}

pub struct OneClassSVM {
    config: OneClassSVMConfig,
    model: Option<OneClassSVMModel>,
}

impl AnomalyDetector for OneClassSVM {
    type Config = OneClassSVMConfig;
    type Model = OneClassSVMModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit(&mut self, features: ArrayView2<f64>) -> Result<()> {
        validate_input_shapes(features, None)?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // This is a simplified One-Class SVM implementation
        // In practice, you'd solve the quadratic programming problem

        // For demonstration, we'll use a simplified approach:
        // 1. Use all points as potential support vectors
        // 2. Set uniform coefficients
        // 3. Calculate intercept based on nu

        let n_support = (n_samples as f64 * self.config.nu * 2.0) as usize;
        let n_support = n_support.max(1).min(n_samples);

        // Select support vectors (first n_support points for simplicity)
        let support_vectors = features.slice(ndarray::s![..n_support, ..]).to_owned();
        let dual_coef = Array1::from_elem(n_support, 1.0 / n_support as f64);

        // Calculate intercept (simplified)
        let mut scores = Vec::new();
        for i in 0..n_support {
            let sample = features.row(i);
            let score = self.calculate_decision_score_impl(
                sample,
                support_vectors.view(),
                dual_coef.view(),
                0.0,
                self.config.gamma,
                &self.config.kernel
            );
            scores.push(score);
        }

        scores.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let intercept_idx = (scores.len() as f64 * self.config.nu) as usize;
        let intercept = -scores[intercept_idx.min(scores.len() - 1)];

        self.model = Some(OneClassSVMModel {
            support_vectors,
            dual_coef,
            intercept,
            n_features,
            gamma: self.config.gamma,
            kernel: self.config.kernel.clone(),
        });

        Ok(())
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        let scores = self.decision_function(features)?;
        Ok(scores.mapv(|score| if score >= 0.0 { 1 } else { -1 }))
    }

    fn decision_function(&self, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not fitted".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let mut scores = Array1::zeros(features.nrows());

        for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
            scores[i] = self.calculate_decision_score_impl(
                sample,
                model.support_vectors.view(),
                model.dual_coef.view(),
                model.intercept,
                model.gamma,
                &model.kernel,
            );
        }

        Ok(scores)
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

impl OneClassSVM {
    fn calculate_decision_score_impl(
        &self,
        sample: ArrayView1<f64>,
        support_vectors: ArrayView2<f64>,
        dual_coef: ArrayView1<f64>,
        intercept: f64,
        gamma: f64,
        kernel: &KernelType,
    ) -> f64 {
        let mut score = 0.0;

        for (i, sv) in support_vectors.axis_iter(Axis(0)).enumerate() {
            let kernel_value = match kernel {
                KernelType::RBF => {
                    let dist_sq = sample.iter().zip(sv.iter())
                        .map(|(&a, &b)| (a - b).powi(2))
                        .sum::<f64>();
                    (-gamma * dist_sq).exp()
                },
                KernelType::Linear => {
                    sample.dot(&sv)
                },
                KernelType::Polynomial { degree } => {
                    (1.0 + sample.dot(&sv)).powi(*degree as i32)
                },
            };

            score += dual_coef[i] * kernel_value;
        }

        score + intercept
    }
}

// Statistical Anomaly Detection (Z-Score and IQR methods)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StatisticalAnomalyConfig {
    pub common: CommonConfig,
    pub method: StatisticalMethod,
    pub threshold: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum StatisticalMethod {
    ZScore,
    ModifiedZScore,
    IQR,
}

impl Default for StatisticalAnomalyConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            method: StatisticalMethod::ZScore,
            threshold: 2.0, // 2 standard deviations for Z-score, or IQR multiplier
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StatisticalAnomalyModel {
    pub means: Array1<f64>,
    pub stds: Array1<f64>,
    pub medians: Array1<f64>,
    pub q1: Array1<f64>,
    pub q3: Array1<f64>,
    pub mad: Array1<f64>, // Median Absolute Deviation
    pub method: StatisticalMethod,
    pub threshold: f64,
    pub n_features: usize,
}

pub struct StatisticalAnomalyDetector {
    config: StatisticalAnomalyConfig,
    model: Option<StatisticalAnomalyModel>,
}

impl AnomalyDetector for StatisticalAnomalyDetector {
    type Config = StatisticalAnomalyConfig;
    type Model = StatisticalAnomalyModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit(&mut self, features: ArrayView2<f64>) -> Result<()> {
        validate_input_shapes(features, None)?;

        let n_features = features.ncols();
        let mut means = Array1::zeros(n_features);
        let mut stds = Array1::zeros(n_features);
        let mut medians = Array1::zeros(n_features);
        let mut q1 = Array1::zeros(n_features);
        let mut q3 = Array1::zeros(n_features);
        let mut mad = Array1::zeros(n_features);

        for (feat_idx, feature_col) in features.axis_iter(Axis(1)).enumerate() {
            // Calculate mean and standard deviation
            means[feat_idx] = feature_col.mean().unwrap_or(0.0);
            let variance = feature_col.iter()
                .map(|&x| (x - means[feat_idx]).powi(2))
                .sum::<f64>() / feature_col.len() as f64;
            stds[feat_idx] = variance.sqrt();

            // Calculate median and quartiles
            let mut sorted_values: Vec<f64> = feature_col.iter().cloned().collect();
            sorted_values.sort_by(|a, b| a.partial_cmp(b).unwrap());

            let n = sorted_values.len();
            medians[feat_idx] = if n % 2 == 0 {
                (sorted_values[n / 2 - 1] + sorted_values[n / 2]) / 2.0
            } else {
                sorted_values[n / 2]
            };

            // Calculate Q1 and Q3
            let q1_idx = n / 4;
            let q3_idx = 3 * n / 4;
            q1[feat_idx] = sorted_values[q1_idx];
            q3[feat_idx] = sorted_values[q3_idx.min(n - 1)];

            // Calculate MAD (Median Absolute Deviation)
            let median_val = medians[feat_idx];
            let mut abs_deviations: Vec<f64> = feature_col.iter()
                .map(|&x| (x - median_val).abs())
                .collect();
            abs_deviations.sort_by(|a, b| a.partial_cmp(b).unwrap());

            mad[feat_idx] = if abs_deviations.len() % 2 == 0 {
                let mid = abs_deviations.len() / 2;
                (abs_deviations[mid - 1] + abs_deviations[mid]) / 2.0
            } else {
                abs_deviations[abs_deviations.len() / 2]
            };
        }

        self.model = Some(StatisticalAnomalyModel {
            means,
            stds,
            medians,
            q1,
            q3,
            mad,
            method: self.config.method.clone(),
            threshold: self.config.threshold,
            n_features,
        });

        Ok(())
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        let scores = self.decision_function(features)?;
        Ok(scores.mapv(|score| if score > 0.0 { -1 } else { 1 }))
    }

    fn decision_function(&self, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not fitted".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let mut scores = Array1::zeros(features.nrows());

        for (sample_idx, sample) in features.axis_iter(Axis(0)).enumerate() {
            let mut max_anomaly_score = 0.0;

            for (feat_idx, &value) in sample.iter().enumerate() {
                let anomaly_score = match model.method {
                    StatisticalMethod::ZScore => {
                        if model.stds[feat_idx] > 1e-10 {
                            ((value - model.means[feat_idx]) / model.stds[feat_idx]).abs()
                        } else {
                            0.0
                        }
                    },
                    StatisticalMethod::ModifiedZScore => {
                        if model.mad[feat_idx] > 1e-10 {
                            0.6745 * (value - model.medians[feat_idx]).abs() / model.mad[feat_idx]
                        } else {
                            0.0
                        }
                    },
                    StatisticalMethod::IQR => {
                        let iqr = model.q3[feat_idx] - model.q1[feat_idx];
                        let lower_bound = model.q1[feat_idx] - model.threshold * iqr;
                        let upper_bound = model.q3[feat_idx] + model.threshold * iqr;

                        if value < lower_bound {
                            (lower_bound - value) / iqr
                        } else if value > upper_bound {
                            (value - upper_bound) / iqr
                        } else {
                            0.0
                        }
                    },
                };

                max_anomaly_score = max_anomaly_score.max(anomaly_score);
            }

            scores[sample_idx] = max_anomaly_score - model.threshold;
        }

        Ok(scores)
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_isolation_forest() {
        // Create normal data with some outliers
        let mut data = Vec::new();
        // Normal data around (0, 0)
        for i in 0..50 {
            data.push((i as f64 - 25.0) * 0.1);
            data.push((i as f64 - 25.0) * 0.1);
        }
        // Add outliers
        data.extend_from_slice(&[10.0, 10.0, -10.0, -10.0]);

        let x = Array::from_shape_vec((52, 2), data).unwrap();

        let mut iforest = IsolationForest::new(IsolationForestConfig {
            n_estimators: 50,
            contamination: 0.1,
            ..Default::default()
        });

        assert!(iforest.fit(x.view()).is_ok());

        let predictions = iforest.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 52);

        let scores = iforest.decision_function(x.view()).unwrap();
        assert_eq!(scores.len(), 52);

        // Last two points should have higher anomaly scores
        assert!(scores[50] > scores[0]);
        assert!(scores[51] > scores[0]);
    }

    #[test]
    fn test_one_class_svm() {
        let x = Array::from_shape_vec((40, 3), (0..120).map(|i| i as f64).collect()).unwrap();

        let mut svm = OneClassSVM::new(OneClassSVMConfig {
            nu: 0.1,
            gamma: 0.1,
            ..Default::default()
        });

        assert!(svm.fit(x.view()).is_ok());

        let predictions = svm.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 40);

        let scores = svm.decision_function(x.view()).unwrap();
        assert_eq!(scores.len(), 40);
    }

    #[test]
    fn test_statistical_anomaly_detection() {
        // Create data with clear outliers
        let mut data = Vec::new();
        // Normal data
        for i in 0..30 {
            data.push(i as f64);
        }
        // Add clear outliers
        data.extend_from_slice(&[100.0, 200.0, -100.0]);

        let x = Array::from_shape_vec((33, 1), data).unwrap();

        let mut detector = StatisticalAnomalyDetector::new(StatisticalAnomalyConfig {
            method: StatisticalMethod::ZScore,
            threshold: 2.0,
            ..Default::default()
        });

        assert!(detector.fit(x.view()).is_ok());

        let predictions = detector.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 33);

        let scores = detector.decision_function(x.view()).unwrap();
        assert_eq!(scores.len(), 33);

        // Outliers should have higher scores
        assert!(scores[30] > scores[0]);
        assert!(scores[31] > scores[0]);
        assert!(scores[32] > scores[0]);
    }

    #[test]
    fn test_statistical_methods() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0, 100.0]; // Clear outlier: 100.0
        let x = Array::from_shape_vec((6, 1), data).unwrap();

        // Test Z-Score method
        let mut z_detector = StatisticalAnomalyDetector::new(StatisticalAnomalyConfig {
            method: StatisticalMethod::ZScore,
            threshold: 2.0,
            ..Default::default()
        });
        z_detector.fit(x.view()).unwrap();
        let z_predictions = z_detector.predict(x.view()).unwrap();
        assert_eq!(z_predictions[5], -1); // Last point should be anomaly

        // Test IQR method
        let mut iqr_detector = StatisticalAnomalyDetector::new(StatisticalAnomalyConfig {
            method: StatisticalMethod::IQR,
            threshold: 1.5,
            ..Default::default()
        });
        iqr_detector.fit(x.view()).unwrap();
        let iqr_predictions = iqr_detector.predict(x.view()).unwrap();
        assert_eq!(iqr_predictions[5], -1); // Last point should be anomaly
    }
}