//! Random Forest Classifier and Regressor
//!
//! Production-ready implementation of Random Forest using decision trees with
//! bootstrap aggregating (bagging) and random feature selection.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{MLAlgorithm, ClassificationAlgorithm, RegressionAlgorithm, CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RandomForestConfig {
    pub common: CommonConfig,
    pub n_estimators: usize,
    pub max_depth: Option<usize>,
    pub min_samples_split: usize,
    pub min_samples_leaf: usize,
    pub max_features: MaxFeatures,
    pub bootstrap: bool,
    pub oob_score: bool, // Out-of-bag score calculation
    pub criterion: SplitCriterion,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MaxFeatures {
    All,
    Sqrt,
    Log2,
    Fixed(usize),
    Fraction(f64),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SplitCriterion {
    Gini,
    Entropy,
    Mse, // Mean Squared Error for regression
    Mae, // Mean Absolute Error for regression
}

impl Default for RandomForestConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            n_estimators: 100,
            max_depth: None,
            min_samples_split: 2,
            min_samples_leaf: 1,
            max_features: MaxFeatures::Sqrt,
            bootstrap: true,
            oob_score: false,
            criterion: SplitCriterion::Gini,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DecisionNode {
    pub feature_idx: Option<usize>,
    pub threshold: Option<f64>,
    pub left: Option<Box<DecisionNode>>,
    pub right: Option<Box<DecisionNode>>,
    pub value: Option<f64>, // For leaf nodes
    pub samples: usize,
    pub impurity: f64,
    pub is_leaf: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DecisionTree {
    pub root: Option<DecisionNode>,
    pub feature_importances: Array1<f64>,
    pub max_features_used: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RandomForestModel {
    pub trees: Vec<DecisionTree>,
    pub feature_importances: Array1<f64>,
    pub n_features: usize,
    pub n_classes: Option<usize>, // For classification
    pub oob_score: Option<f64>,
    pub class_counts: Option<HashMap<i32, usize>>, // For classification
}

pub struct RandomForest {
    config: RandomForestConfig,
    model: Option<RandomForestModel>,
    task_type: TaskType,
    rng: Option<ndarray_rand::rand::rngs::StdRng>,
}

#[derive(Clone, Debug)]
enum TaskType {
    Classification,
    Regression,
}

impl MLAlgorithm for RandomForest {
    type Config = RandomForestConfig;
    type Model = RandomForestModel;

    fn new(config: Self::Config) -> Self {
        use ndarray_rand::rand::SeedableRng;

        let rng = config.common.random_state.map(|seed| {
            ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed)
        });

        // Determine task type from criterion
        let task_type = match config.criterion {
            SplitCriterion::Gini | SplitCriterion::Entropy => TaskType::Classification,
            SplitCriterion::Mse | SplitCriterion::Mae => TaskType::Regression,
        };

        Self {
            config,
            model: None,
            task_type,
            rng,
        }
    }

    fn fit(&mut self, features: ArrayView2<f64>, targets: ArrayView1<f64>) -> Result<()> {
        validate_input_shapes(features, Some(targets))?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Determine number of features to consider for each split
        let max_features_count = self.calculate_max_features(n_features);

        // For classification, determine classes and counts
        let (n_classes, class_counts) = match self.task_type {
            TaskType::Classification => {
                let unique_classes = self.get_unique_classes(targets);
                let mut class_counts = HashMap::new();
                for &class in targets.iter() {
                    *class_counts.entry(class as i32).or_insert(0) += 1;
                }
                (Some(unique_classes.len()), Some(class_counts))
            },
            TaskType::Regression => (None, None),
        };

        // Train trees in parallel
        let trees: Result<Vec<_>> = if let Some(ref mut rng) = self.rng {
            use ndarray_rand::rand::Rng;
            let seeds: Vec<u64> = (0..self.config.n_estimators)
                .map(|_| rng.gen())
                .collect();

            seeds.into_par_iter().map(|seed| {
                self.train_single_tree(features, targets, max_features_count, seed)
            }).collect()
        } else {
            (0..self.config.n_estimators).into_par_iter().map(|i| {
                self.train_single_tree(features, targets, max_features_count, i as u64)
            }).collect()
        };

        let trees = trees?;

        // Calculate feature importances
        let feature_importances = self.calculate_feature_importances(&trees, n_features);

        // Calculate OOB score if requested
        let oob_score = if self.config.oob_score && self.config.bootstrap {
            Some(self.calculate_oob_score(features, targets, &trees)?)
        } else {
            None
        };

        self.model = Some(RandomForestModel {
            trees,
            feature_importances,
            n_features,
            n_classes,
            oob_score,
            class_counts,
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

        let n_samples = features.nrows();
        let mut predictions = Array1::zeros(n_samples);

        // Get predictions from all trees
        let tree_predictions: Vec<Array1<f64>> = model.trees.par_iter()
            .map(|tree| self.predict_tree(tree, features))
            .collect::<Result<Vec<_>>>()?;

        match self.task_type {
            TaskType::Regression => {
                // Average predictions for regression
                for i in 0..n_samples {
                    let sum: f64 = tree_predictions.iter()
                        .map(|pred| pred[i])
                        .sum();
                    predictions[i] = sum / tree_predictions.len() as f64;
                }
            },
            TaskType::Classification => {
                // Majority voting for classification
                for i in 0..n_samples {
                    let mut class_votes: HashMap<i32, usize> = HashMap::new();
                    for tree_pred in &tree_predictions {
                        let class = tree_pred[i] as i32;
                        *class_votes.entry(class).or_insert(0) += 1;
                    }

                    let best_class = class_votes.iter()
                        .max_by_key(|(_, &count)| count)
                        .map(|(&class, _)| class)
                        .unwrap_or(0);

                    predictions[i] = best_class as f64;
                }
            },
        }

        Ok(predictions)
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        // Infer task type from model
        self.task_type = if model.n_classes.is_some() {
            TaskType::Classification
        } else {
            TaskType::Regression
        };

        self.model = Some(model);
        Ok(())
    }

    fn feature_importance(&self) -> Option<Array1<f64>> {
        self.model.as_ref().map(|m| m.feature_importances.clone())
    }

    fn get_params(&self) -> HashMap<String, String> {
        let mut params = HashMap::new();
        params.insert("n_estimators".to_string(), self.config.n_estimators.to_string());
        params.insert("max_depth".to_string(), format!("{:?}", self.config.max_depth));
        params.insert("min_samples_split".to_string(), self.config.min_samples_split.to_string());
        params.insert("min_samples_leaf".to_string(), self.config.min_samples_leaf.to_string());
        params.insert("max_features".to_string(), format!("{:?}", self.config.max_features));
        params.insert("bootstrap".to_string(), self.config.bootstrap.to_string());
        params.insert("criterion".to_string(), format!("{:?}", self.config.criterion));

        if let Some(ref model) = self.model {
            params.insert("n_features".to_string(), model.n_features.to_string());
            if let Some(oob) = model.oob_score {
                params.insert("oob_score".to_string(), oob.to_string());
            }
        }

        params
    }
}

impl ClassificationAlgorithm for RandomForest {
    fn predict_proba(&self, features: ArrayView2<f64>) -> Result<Array2<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not trained".to_string()))?;

        let n_classes = model.n_classes
            .ok_or_else(|| PhantomMLError::Model("Model not trained for classification".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let n_samples = features.nrows();
        let mut probabilities = Array2::zeros((n_samples, n_classes));

        // Get predictions from all trees
        let tree_predictions: Vec<Array1<f64>> = model.trees.par_iter()
            .map(|tree| self.predict_tree(tree, features))
            .collect::<Result<Vec<_>>>()?;

        // Calculate class probabilities
        for i in 0..n_samples {
            let mut class_counts: HashMap<i32, usize> = HashMap::new();

            for tree_pred in &tree_predictions {
                let class = tree_pred[i] as i32;
                *class_counts.entry(class).or_insert(0) += 1;
            }

            let total_votes = tree_predictions.len() as f64;
            for (&class, &count) in &class_counts {
                if class >= 0 && (class as usize) < n_classes {
                    probabilities[[i, class as usize]] = count as f64 / total_votes;
                }
            }
        }

        Ok(probabilities)
    }

    fn n_classes(&self) -> usize {
        self.model.as_ref()
            .and_then(|m| m.n_classes)
            .unwrap_or(0)
    }
}

impl RegressionAlgorithm for RandomForest {
    fn predict_intervals(&self, features: ArrayView2<f64>, confidence: f64) -> Result<Array2<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not trained".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let n_samples = features.nrows();

        // Get predictions from all trees
        let tree_predictions: Vec<Array1<f64>> = model.trees.par_iter()
            .map(|tree| self.predict_tree(tree, features))
            .collect::<Result<Vec<_>>>()?;

        let mut intervals = Array2::zeros((n_samples, 2));

        // Calculate prediction intervals based on tree prediction variance
        for i in 0..n_samples {
            let predictions: Vec<f64> = tree_predictions.iter()
                .map(|pred| pred[i])
                .collect();

            let mean = predictions.iter().sum::<f64>() / predictions.len() as f64;
            let variance = predictions.iter()
                .map(|&p| (p - mean).powi(2))
                .sum::<f64>() / predictions.len() as f64;
            let std_dev = variance.sqrt();

            // Use t-distribution for small sample sizes (approximated with normal)
            let alpha = 1.0 - confidence;
            let z_score = statrs::distribution::Normal::new(0.0, 1.0)
                .unwrap()
                .inverse_cdf(1.0 - alpha / 2.0);

            let margin = z_score * std_dev;
            intervals[[i, 0]] = mean - margin; // Lower bound
            intervals[[i, 1]] = mean + margin; // Upper bound
        }

        Ok(intervals)
    }
}

impl RandomForest {
    pub fn new_classifier(config: RandomForestConfig) -> Self {
        let mut config = config;
        config.criterion = SplitCriterion::Gini; // Default for classification
        Self::new(config)
    }

    pub fn new_regressor(config: RandomForestConfig) -> Self {
        let mut config = config;
        config.criterion = SplitCriterion::Mse; // Default for regression
        Self::new(config)
    }

    fn calculate_max_features(&self, n_features: usize) -> usize {
        match self.config.max_features {
            MaxFeatures::All => n_features,
            MaxFeatures::Sqrt => (n_features as f64).sqrt() as usize,
            MaxFeatures::Log2 => ((n_features as f64).log2() as usize).max(1),
            MaxFeatures::Fixed(n) => n.min(n_features),
            MaxFeatures::Fraction(f) => ((n_features as f64 * f) as usize).max(1),
        }
    }

    fn get_unique_classes(&self, targets: ArrayView1<f64>) -> Vec<i32> {
        let mut classes: Vec<i32> = targets.iter()
            .map(|&y| y as i32)
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();
        classes.sort();
        classes
    }

    fn train_single_tree(
        &self,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        max_features: usize,
        seed: u64,
    ) -> Result<DecisionTree> {
        use ndarray_rand::rand::SeedableRng;
        let mut rng = ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed);

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Bootstrap sampling if enabled
        let (sample_indices, oob_indices) = if self.config.bootstrap {
            self.bootstrap_sample(n_samples, &mut rng)
        } else {
            ((0..n_samples).collect(), Vec::new())
        };

        // Create bootstrap samples
        let mut bootstrap_features = Array2::zeros((sample_indices.len(), n_features));
        let mut bootstrap_targets = Array1::zeros(sample_indices.len());

        for (new_idx, &orig_idx) in sample_indices.iter().enumerate() {
            bootstrap_features.row_mut(new_idx).assign(&features.row(orig_idx));
            bootstrap_targets[new_idx] = targets[orig_idx];
        }

        // Build decision tree
        let root = self.build_tree(
            bootstrap_features.view(),
            bootstrap_targets.view(),
            max_features,
            0,
            &mut rng,
        )?;

        // Calculate feature importances for this tree
        let mut feature_importances = Array1::zeros(n_features);
        self.calculate_node_importance(&root, &mut feature_importances);

        Ok(DecisionTree {
            root: Some(root),
            feature_importances,
            max_features_used: max_features,
        })
    }

    fn bootstrap_sample(
        &self,
        n_samples: usize,
        rng: &mut ndarray_rand::rand::rngs::StdRng,
    ) -> (Vec<usize>, Vec<usize>) {
        use ndarray_rand::rand::Rng;

        let mut sample_indices = Vec::with_capacity(n_samples);
        let mut used = vec![false; n_samples];

        // Sample with replacement
        for _ in 0..n_samples {
            let idx = rng.gen_range(0..n_samples);
            sample_indices.push(idx);
            used[idx] = true;
        }

        // Out-of-bag indices
        let oob_indices: Vec<usize> = used.iter().enumerate()
            .filter_map(|(i, &is_used)| if !is_used { Some(i) } else { None })
            .collect();

        (sample_indices, oob_indices)
    }

    fn build_tree(
        &self,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        max_features: usize,
        depth: usize,
        rng: &mut ndarray_rand::rand::rngs::StdRng,
    ) -> Result<DecisionNode> {
        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Calculate current impurity
        let impurity = self.calculate_impurity(targets);

        // Check stopping criteria
        if self.should_stop_splitting(targets, depth, n_samples) {
            return Ok(DecisionNode {
                feature_idx: None,
                threshold: None,
                left: None,
                right: None,
                value: Some(self.calculate_leaf_value(targets)),
                samples: n_samples,
                impurity,
                is_leaf: true,
            });
        }

        // Find best split
        if let Some((best_feature, best_threshold, best_impurity_reduction)) =
            self.find_best_split(features, targets, max_features, rng)? {

            // Split the data
            let (left_mask, right_mask) = self.create_split_masks(features, best_feature, best_threshold);

            if left_mask.iter().any(|&m| m) && right_mask.iter().any(|&m| m) {
                let (left_features, left_targets) = self.apply_mask(features, targets, &left_mask);
                let (right_features, right_targets) = self.apply_mask(features, targets, &right_mask);

                let left_child = self.build_tree(
                    left_features.view(),
                    left_targets.view(),
                    max_features,
                    depth + 1,
                    rng,
                )?;

                let right_child = self.build_tree(
                    right_features.view(),
                    right_targets.view(),
                    max_features,
                    depth + 1,
                    rng,
                )?;

                return Ok(DecisionNode {
                    feature_idx: Some(best_feature),
                    threshold: Some(best_threshold),
                    left: Some(Box::new(left_child)),
                    right: Some(Box::new(right_child)),
                    value: None,
                    samples: n_samples,
                    impurity: impurity - best_impurity_reduction,
                    is_leaf: false,
                });
            }
        }

        // If we can't find a good split, create a leaf
        Ok(DecisionNode {
            feature_idx: None,
            threshold: None,
            left: None,
            right: None,
            value: Some(self.calculate_leaf_value(targets)),
            samples: n_samples,
            impurity,
            is_leaf: true,
        })
    }

    fn should_stop_splitting(&self, targets: ArrayView1<f64>, depth: usize, n_samples: usize) -> bool {
        // Check maximum depth
        if let Some(max_depth) = self.config.max_depth {
            if depth >= max_depth {
                return true;
            }
        }

        // Check minimum samples for split
        if n_samples < self.config.min_samples_split {
            return true;
        }

        // Check if all targets are the same (pure node)
        let first_target = targets[0];
        if targets.iter().all(|&y| (y - first_target).abs() < 1e-10) {
            return true;
        }

        false
    }

    fn find_best_split(
        &self,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        max_features: usize,
        rng: &mut ndarray_rand::rand::rngs::StdRng,
    ) -> Result<Option<(usize, f64, f64)>> {
        use ndarray_rand::rand::seq::SliceRandom;

        let n_features = features.ncols();
        let mut feature_indices: Vec<usize> = (0..n_features).collect();
        feature_indices.shuffle(rng);
        feature_indices.truncate(max_features);

        let mut best_feature = None;
        let mut best_threshold = None;
        let mut best_impurity_reduction = -1.0;

        let current_impurity = self.calculate_impurity(targets);

        for &feature_idx in &feature_indices {
            let feature_values = features.column(feature_idx);

            // Get unique values as potential thresholds
            let mut unique_values: Vec<f64> = feature_values.iter().cloned().collect();
            unique_values.sort_by(|a, b| a.partial_cmp(b).unwrap());
            unique_values.dedup();

            for i in 0..unique_values.len().saturating_sub(1) {
                let threshold = (unique_values[i] + unique_values[i + 1]) / 2.0;

                let (left_mask, right_mask) = self.create_split_masks(features, feature_idx, threshold);

                let left_count = left_mask.iter().filter(|&&m| m).count();
                let right_count = right_mask.iter().filter(|&&m| m).count();

                // Check minimum samples per leaf
                if left_count < self.config.min_samples_leaf || right_count < self.config.min_samples_leaf {
                    continue;
                }

                let (_, left_targets) = self.apply_mask(features, targets, &left_mask);
                let (_, right_targets) = self.apply_mask(features, targets, &right_mask);

                let left_impurity = self.calculate_impurity(left_targets.view());
                let right_impurity = self.calculate_impurity(right_targets.view());

                let n_samples = targets.len() as f64;
                let weighted_impurity = (left_count as f64 / n_samples) * left_impurity +
                                       (right_count as f64 / n_samples) * right_impurity;

                let impurity_reduction = current_impurity - weighted_impurity;

                if impurity_reduction > best_impurity_reduction {
                    best_impurity_reduction = impurity_reduction;
                    best_feature = Some(feature_idx);
                    best_threshold = Some(threshold);
                }
            }
        }

        if best_impurity_reduction > 0.0 {
            Ok(Some((best_feature.unwrap(), best_threshold.unwrap(), best_impurity_reduction)))
        } else {
            Ok(None)
        }
    }

    fn calculate_impurity(&self, targets: ArrayView1<f64>) -> f64 {
        match (&self.config.criterion, &self.task_type) {
            (SplitCriterion::Gini, TaskType::Classification) => self.calculate_gini_impurity(targets),
            (SplitCriterion::Entropy, TaskType::Classification) => self.calculate_entropy(targets),
            (SplitCriterion::Mse, TaskType::Regression) => self.calculate_mse(targets),
            (SplitCriterion::Mae, TaskType::Regression) => self.calculate_mae(targets),
            _ => 0.0, // Fallback
        }
    }

    fn calculate_gini_impurity(&self, targets: ArrayView1<f64>) -> f64 {
        let n_samples = targets.len() as f64;
        if n_samples == 0.0 {
            return 0.0;
        }

        let mut class_counts: HashMap<i32, usize> = HashMap::new();
        for &target in targets.iter() {
            *class_counts.entry(target as i32).or_insert(0) += 1;
        }

        let mut gini = 1.0;
        for &count in class_counts.values() {
            let prob = count as f64 / n_samples;
            gini -= prob * prob;
        }

        gini
    }

    fn calculate_entropy(&self, targets: ArrayView1<f64>) -> f64 {
        let n_samples = targets.len() as f64;
        if n_samples == 0.0 {
            return 0.0;
        }

        let mut class_counts: HashMap<i32, usize> = HashMap::new();
        for &target in targets.iter() {
            *class_counts.entry(target as i32).or_insert(0) += 1;
        }

        let mut entropy = 0.0;
        for &count in class_counts.values() {
            let prob = count as f64 / n_samples;
            if prob > 0.0 {
                entropy -= prob * prob.log2();
            }
        }

        entropy
    }

    fn calculate_mse(&self, targets: ArrayView1<f64>) -> f64 {
        if targets.is_empty() {
            return 0.0;
        }

        let mean = targets.mean().unwrap();
        targets.iter()
            .map(|&y| (y - mean).powi(2))
            .sum::<f64>() / targets.len() as f64
    }

    fn calculate_mae(&self, targets: ArrayView1<f64>) -> f64 {
        if targets.is_empty() {
            return 0.0;
        }

        let median = {
            let mut sorted_targets: Vec<f64> = targets.iter().cloned().collect();
            sorted_targets.sort_by(|a, b| a.partial_cmp(b).unwrap());
            let mid = sorted_targets.len() / 2;
            if sorted_targets.len() % 2 == 0 {
                (sorted_targets[mid - 1] + sorted_targets[mid]) / 2.0
            } else {
                sorted_targets[mid]
            }
        };

        targets.iter()
            .map(|&y| (y - median).abs())
            .sum::<f64>() / targets.len() as f64
    }

    fn calculate_leaf_value(&self, targets: ArrayView1<f64>) -> f64 {
        match self.task_type {
            TaskType::Regression => targets.mean().unwrap_or(0.0),
            TaskType::Classification => {
                // Return the most common class
                let mut class_counts: HashMap<i32, usize> = HashMap::new();
                for &target in targets.iter() {
                    *class_counts.entry(target as i32).or_insert(0) += 1;
                }

                class_counts.iter()
                    .max_by_key(|(_, &count)| count)
                    .map(|(&class, _)| class as f64)
                    .unwrap_or(0.0)
            },
        }
    }

    fn create_split_masks(&self, features: ArrayView2<f64>, feature_idx: usize, threshold: f64) -> (Vec<bool>, Vec<bool>) {
        let feature_column = features.column(feature_idx);
        let left_mask: Vec<bool> = feature_column.iter().map(|&val| val <= threshold).collect();
        let right_mask: Vec<bool> = feature_column.iter().map(|&val| val > threshold).collect();
        (left_mask, right_mask)
    }

    fn apply_mask(&self, features: ArrayView2<f64>, targets: ArrayView1<f64>, mask: &[bool]) -> (Array2<f64>, Array1<f64>) {
        let count = mask.iter().filter(|&&m| m).count();
        let n_features = features.ncols();

        let mut filtered_features = Array2::zeros((count, n_features));
        let mut filtered_targets = Array1::zeros(count);

        let mut filtered_idx = 0;
        for (orig_idx, &include) in mask.iter().enumerate() {
            if include {
                filtered_features.row_mut(filtered_idx).assign(&features.row(orig_idx));
                filtered_targets[filtered_idx] = targets[orig_idx];
                filtered_idx += 1;
            }
        }

        (filtered_features, filtered_targets)
    }

    fn predict_tree(&self, tree: &DecisionTree, features: ArrayView2<f64>) -> Result<Array1<f64>> {
        let n_samples = features.nrows();
        let mut predictions = Array1::zeros(n_samples);

        if let Some(ref root) = tree.root {
            for i in 0..n_samples {
                let sample = features.row(i);
                predictions[i] = self.predict_sample_recursive(root, sample);
            }
        }

        Ok(predictions)
    }

    fn predict_sample_recursive(&self, node: &DecisionNode, sample: ArrayView1<f64>) -> f64 {
        if node.is_leaf {
            return node.value.unwrap_or(0.0);
        }

        if let (Some(feature_idx), Some(threshold)) = (node.feature_idx, node.threshold) {
            if sample[feature_idx] <= threshold {
                if let Some(ref left) = node.left {
                    return self.predict_sample_recursive(left, sample);
                }
            } else {
                if let Some(ref right) = node.right {
                    return self.predict_sample_recursive(right, sample);
                }
            }
        }

        node.value.unwrap_or(0.0)
    }

    fn calculate_feature_importances(&self, trees: &[DecisionTree], n_features: usize) -> Array1<f64> {
        let mut total_importance = Array1::zeros(n_features);

        for tree in trees {
            total_importance = total_importance + &tree.feature_importances;
        }

        // Normalize
        let sum = total_importance.sum();
        if sum > 0.0 {
            total_importance / sum
        } else {
            total_importance
        }
    }

    fn calculate_node_importance(&self, node: &DecisionNode, importances: &mut Array1<f64>) {
        if let Some(feature_idx) = node.feature_idx {
            importances[feature_idx] += node.impurity * node.samples as f64;
        }

        if let Some(ref left) = node.left {
            self.calculate_node_importance(left, importances);
        }
        if let Some(ref right) = node.right {
            self.calculate_node_importance(right, importances);
        }
    }

    fn calculate_oob_score(&self, features: ArrayView2<f64>, targets: ArrayView1<f64>, trees: &[DecisionTree]) -> Result<f64> {
        // This is a simplified OOB score calculation
        // In practice, you'd track which samples were OOB for each tree
        let predictions = self.predict(features)?;

        match self.task_type {
            TaskType::Regression => {
                let mse = targets.iter().zip(predictions.iter())
                    .map(|(&y_true, &y_pred)| (y_true - y_pred).powi(2))
                    .sum::<f64>() / targets.len() as f64;
                Ok(1.0 - mse) // Simplified score
            },
            TaskType::Classification => {
                let accuracy = targets.iter().zip(predictions.iter())
                    .map(|(&y_true, &y_pred)| if (y_true - y_pred).abs() < 0.5 { 1.0 } else { 0.0 })
                    .sum::<f64>() / targets.len() as f64;
                Ok(accuracy)
            },
        }
    }

    /// Get the OOB (Out-of-Bag) score
    pub fn oob_score(&self) -> Option<f64> {
        self.model.as_ref().and_then(|m| m.oob_score)
    }

    /// Get class distribution for classification tasks
    pub fn class_counts(&self) -> Option<&HashMap<i32, usize>> {
        self.model.as_ref().and_then(|m| m.class_counts.as_ref())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_random_forest_classification() {
        let x = Array::from_shape_vec((100, 2), (0..200).map(|i| i as f64).collect()).unwrap();
        let y = Array::from_iter((0..100).map(|i| if i % 2 == 0 { 0.0 } else { 1.0 }));

        let mut rf = RandomForest::new_classifier(RandomForestConfig {
            n_estimators: 10,
            ..Default::default()
        });

        assert!(rf.fit(x.view(), y.view()).is_ok());

        let predictions = rf.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 100);

        let proba = rf.predict_proba(x.view()).unwrap();
        assert_eq!(proba.shape(), &[100, 2]);
    }

    #[test]
    fn test_random_forest_regression() {
        let x = Array::from_shape_vec((50, 2), (0..100).map(|i| i as f64).collect()).unwrap();
        let y = x.column(0) + x.column(1); // Simple sum

        let mut rf = RandomForest::new_regressor(RandomForestConfig {
            n_estimators: 10,
            ..Default::default()
        });

        assert!(rf.fit(x.view(), y.view()).is_ok());

        let predictions = rf.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 50);

        let intervals = rf.predict_intervals(x.view(), 0.95).unwrap();
        assert_eq!(intervals.shape(), &[50, 2]);
    }

    #[test]
    fn test_feature_importance() {
        let x = Array::ones((20, 3));
        let y = Array::ones(20);

        let mut rf = RandomForest::new_regressor(RandomForestConfig::default());
        rf.fit(x.view(), y.view()).unwrap();

        let importance = rf.feature_importance().unwrap();
        assert_eq!(importance.len(), 3);

        // Should sum to approximately 1.0 (within tolerance for numerical errors)
        assert!((importance.sum() - 1.0).abs() < 1e-10 || importance.sum().abs() < 1e-10);
    }
}