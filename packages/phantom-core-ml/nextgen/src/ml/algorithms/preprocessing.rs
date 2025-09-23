//! Data Preprocessing Pipeline
//!
//! Production-ready data preprocessing utilities including normalization,
//! feature scaling, missing value handling, and feature engineering.

use crate::error::{PhantomMLError, Result};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

/// Main preprocessing pipeline
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PreprocessingPipeline {
    pub steps: Vec<PreprocessingStep>,
    pub fitted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PreprocessingStep {
    StandardScaler(StandardScalerParams),
    MinMaxScaler(MinMaxScalerParams),
    RobustScaler(RobustScalerParams),
    Normalizer(NormalizerParams),
    MissingValueImputer(ImputerParams),
    OutlierRemover(OutlierRemoverParams),
    FeatureSelector(FeatureSelectorParams),
    PolynomialFeatures(PolynomialFeaturesParams),
    OneHotEncoder(OneHotEncoderParams),
}

impl PreprocessingPipeline {
    pub fn new() -> Self {
        Self {
            steps: Vec::new(),
            fitted: false,
        }
    }

    pub fn add_step(mut self, step: PreprocessingStep) -> Self {
        self.steps.push(step);
        self
    }

    pub fn fit_transform(&mut self, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let mut transformed_data = data.to_owned();

        for step in &mut self.steps {
            transformed_data = match step {
                PreprocessingStep::StandardScaler(ref mut params) => {
                    StandardScaler::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::MinMaxScaler(ref mut params) => {
                    MinMaxScaler::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::RobustScaler(ref mut params) => {
                    RobustScaler::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::Normalizer(ref mut params) => {
                    Normalizer::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::MissingValueImputer(ref mut params) => {
                    MissingValueImputer::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::OutlierRemover(ref mut params) => {
                    OutlierRemover::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::FeatureSelector(ref mut params) => {
                    FeatureSelector::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::PolynomialFeatures(ref mut params) => {
                    PolynomialFeatures::fit_transform(params, transformed_data.view())?
                },
                PreprocessingStep::OneHotEncoder(ref mut params) => {
                    OneHotEncoder::fit_transform(params, transformed_data.view())?
                },
            };
        }

        self.fitted = true;
        Ok(transformed_data)
    }

    pub fn transform(&self, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !self.fitted {
            return Err(PhantomMLError::Model("Pipeline not fitted".to_string()));
        }

        let mut transformed_data = data.to_owned();

        for step in &self.steps {
            transformed_data = match step {
                PreprocessingStep::StandardScaler(params) => {
                    StandardScaler::transform(params, transformed_data.view())?
                },
                PreprocessingStep::MinMaxScaler(params) => {
                    MinMaxScaler::transform(params, transformed_data.view())?
                },
                PreprocessingStep::RobustScaler(params) => {
                    RobustScaler::transform(params, transformed_data.view())?
                },
                PreprocessingStep::Normalizer(params) => {
                    Normalizer::transform(params, transformed_data.view())?
                },
                PreprocessingStep::MissingValueImputer(params) => {
                    MissingValueImputer::transform(params, transformed_data.view())?
                },
                PreprocessingStep::OutlierRemover(params) => {
                    OutlierRemover::transform(params, transformed_data.view())?
                },
                PreprocessingStep::FeatureSelector(params) => {
                    FeatureSelector::transform(params, transformed_data.view())?
                },
                PreprocessingStep::PolynomialFeatures(params) => {
                    PolynomialFeatures::transform(params, transformed_data.view())?
                },
                PreprocessingStep::OneHotEncoder(params) => {
                    OneHotEncoder::transform(params, transformed_data.view())?
                },
            };
        }

        Ok(transformed_data)
    }
}

// Standard Scaler (Z-score normalization)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StandardScalerParams {
    pub means: Option<Array1<f64>>,
    pub stds: Option<Array1<f64>>,
    pub with_mean: bool,
    pub with_std: bool,
    pub fitted: bool,
}

impl Default for StandardScalerParams {
    fn default() -> Self {
        Self {
            means: None,
            stds: None,
            with_mean: true,
            with_std: true,
            fitted: false,
        }
    }
}

pub struct StandardScaler;

impl StandardScaler {
    pub fn fit_transform(params: &mut StandardScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let n_features = data.ncols();

        let means = if params.with_mean {
            Some(data.mean_axis(Axis(0)).unwrap())
        } else {
            Some(Array1::zeros(n_features))
        };

        let stds = if params.with_std {
            let stds = data.std_axis(Axis(0), 0.0);
            Some(stds.mapv(|s| if s.abs() < 1e-10 { 1.0 } else { s }))
        } else {
            Some(Array1::ones(n_features))
        };

        params.means = means.clone();
        params.stds = stds.clone();
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &StandardScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("StandardScaler not fitted".to_string()));
        }

        let means = params.means.as_ref().unwrap();
        let stds = params.stds.as_ref().unwrap();

        if data.ncols() != means.len() {
            return Err(PhantomMLError::DataProcessing(
                format!("Expected {} features, got {}", means.len(), data.ncols())
            ));
        }

        let transformed = (data.to_owned() - means) / stds;
        Ok(transformed)
    }
}

// Min-Max Scaler
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MinMaxScalerParams {
    pub mins: Option<Array1<f64>>,
    pub maxs: Option<Array1<f64>>,
    pub feature_range: (f64, f64),
    pub fitted: bool,
}

impl Default for MinMaxScalerParams {
    fn default() -> Self {
        Self {
            mins: None,
            maxs: None,
            feature_range: (0.0, 1.0),
            fitted: false,
        }
    }
}

pub struct MinMaxScaler;

impl MinMaxScaler {
    pub fn fit_transform(params: &mut MinMaxScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let mins = data.fold_axis(Axis(0), f64::INFINITY, |&acc, &x| acc.min(x));
        let maxs = data.fold_axis(Axis(0), f64::NEG_INFINITY, |&acc, &x| acc.max(x));

        params.mins = Some(mins);
        params.maxs = Some(maxs);
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &MinMaxScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("MinMaxScaler not fitted".to_string()));
        }

        let mins = params.mins.as_ref().unwrap();
        let maxs = params.maxs.as_ref().unwrap();
        let (min_range, max_range) = params.feature_range;

        if data.ncols() != mins.len() {
            return Err(PhantomMLError::DataProcessing(
                format!("Expected {} features, got {}", mins.len(), data.ncols())
            ));
        }

        let ranges = maxs - mins;
        let safe_ranges = ranges.mapv(|r| if r.abs() < 1e-10 { 1.0 } else { r });

        let scaled = (data.to_owned() - mins) / &safe_ranges;
        let transformed = scaled * (max_range - min_range) + min_range;

        Ok(transformed)
    }
}

// Robust Scaler (uses median and IQR)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RobustScalerParams {
    pub medians: Option<Array1<f64>>,
    pub iqrs: Option<Array1<f64>>,
    pub fitted: bool,
}

impl Default for RobustScalerParams {
    fn default() -> Self {
        Self {
            medians: None,
            iqrs: None,
            fitted: false,
        }
    }
}

pub struct RobustScaler;

impl RobustScaler {
    pub fn fit_transform(params: &mut RobustScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let n_features = data.ncols();
        let mut medians = Array1::zeros(n_features);
        let mut iqrs = Array1::zeros(n_features);

        for (i, column) in data.axis_iter(Axis(1)).enumerate() {
            let mut sorted: Vec<f64> = column.iter().cloned().collect();
            sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

            let n = sorted.len();
            medians[i] = if n % 2 == 0 {
                (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0
            } else {
                sorted[n / 2]
            };

            let q1_idx = n / 4;
            let q3_idx = 3 * n / 4;
            let q1 = sorted[q1_idx];
            let q3 = sorted[q3_idx.min(n - 1)];
            iqrs[i] = if (q3 - q1).abs() < 1e-10 { 1.0 } else { q3 - q1 };
        }

        params.medians = Some(medians);
        params.iqrs = Some(iqrs);
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &RobustScalerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("RobustScaler not fitted".to_string()));
        }

        let medians = params.medians.as_ref().unwrap();
        let iqrs = params.iqrs.as_ref().unwrap();

        if data.ncols() != medians.len() {
            return Err(PhantomMLError::DataProcessing(
                format!("Expected {} features, got {}", medians.len(), data.ncols())
            ));
        }

        let transformed = (data.to_owned() - medians) / iqrs;
        Ok(transformed)
    }
}

// Normalizer (L1, L2, max norm)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NormalizerParams {
    pub norm: NormType,
    pub fitted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum NormType {
    L1,
    L2,
    Max,
}

impl Default for NormalizerParams {
    fn default() -> Self {
        Self {
            norm: NormType::L2,
            fitted: false,
        }
    }
}

pub struct Normalizer;

impl Normalizer {
    pub fn fit_transform(params: &mut NormalizerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        params.fitted = true;
        Self::transform(params, data)
    }

    pub fn transform(params: &NormalizerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("Normalizer not fitted".to_string()));
        }

        let mut normalized = data.to_owned();

        for mut row in normalized.axis_iter_mut(Axis(0)) {
            let norm = match params.norm {
                NormType::L1 => row.iter().map(|&x| x.abs()).sum::<f64>(),
                NormType::L2 => row.iter().map(|&x| x * x).sum::<f64>().sqrt(),
                NormType::Max => row.fold(0.0, |acc, &x| acc.max(x.abs())),
            };

            if norm > 1e-10 {
                row.mapv_inplace(|x| x / norm);
            }
        }

        Ok(normalized)
    }
}

// Missing Value Imputer
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImputerParams {
    pub strategy: ImputeStrategy,
    pub fill_values: Option<Array1<f64>>,
    pub fitted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ImputeStrategy {
    Mean,
    Median,
    Mode,
    Constant(f64),
    Forward, // Forward fill
    Backward, // Backward fill
}

impl Default for ImputerParams {
    fn default() -> Self {
        Self {
            strategy: ImputeStrategy::Mean,
            fill_values: None,
            fitted: false,
        }
    }
}

pub struct MissingValueImputer;

impl MissingValueImputer {
    pub fn fit_transform(params: &mut ImputerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let n_features = data.ncols();
        let mut fill_values = Array1::zeros(n_features);

        for (i, column) in data.axis_iter(Axis(1)).enumerate() {
            let valid_values: Vec<f64> = column.iter()
                .filter(|&&x| x.is_finite())
                .cloned()
                .collect();

            if valid_values.is_empty() {
                fill_values[i] = 0.0;
                continue;
            }

            fill_values[i] = match params.strategy {
                ImputeStrategy::Mean => {
                    valid_values.iter().sum::<f64>() / valid_values.len() as f64
                },
                ImputeStrategy::Median => {
                    let mut sorted = valid_values.clone();
                    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
                    let n = sorted.len();
                    if n % 2 == 0 {
                        (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0
                    } else {
                        sorted[n / 2]
                    }
                },
                ImputeStrategy::Mode => {
                    // For continuous data, use the most frequent value (simplified)
                    let mut counts: HashMap<i64, usize> = HashMap::new();
                    for &val in &valid_values {
                        let rounded = (val * 1000.0) as i64; // Round to 3 decimal places
                        *counts.entry(rounded).or_insert(0) += 1;
                    }
                    let mode = counts.iter()
                        .max_by_key(|(_, &count)| count)
                        .map(|(&val, _)| val as f64 / 1000.0)
                        .unwrap_or(0.0);
                    mode
                },
                ImputeStrategy::Constant(val) => val,
                ImputeStrategy::Forward | ImputeStrategy::Backward => {
                    // For fit phase, use mean as fallback
                    valid_values.iter().sum::<f64>() / valid_values.len() as f64
                },
            };
        }

        params.fill_values = Some(fill_values);
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &ImputerParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("Imputer not fitted".to_string()));
        }

        let fill_values = params.fill_values.as_ref().unwrap();
        let mut imputed = data.to_owned();

        match params.strategy {
            ImputeStrategy::Forward => {
                // Forward fill within each column
                for (col_idx, mut column) in imputed.axis_iter_mut(Axis(1)).enumerate() {
                    let mut last_valid = fill_values[col_idx];
                    for val in column.iter_mut() {
                        if val.is_finite() {
                            last_valid = *val;
                        } else {
                            *val = last_valid;
                        }
                    }
                }
            },
            ImputeStrategy::Backward => {
                // Backward fill within each column
                for (col_idx, mut column) in imputed.axis_iter_mut(Axis(1)).enumerate() {
                    let mut last_valid = fill_values[col_idx];
                    for val in column.iter_mut().rev() {
                        if val.is_finite() {
                            last_valid = *val;
                        } else {
                            *val = last_valid;
                        }
                    }
                }
            },
            _ => {
                // Fill with computed values
                for (col_idx, mut column) in imputed.axis_iter_mut(Axis(1)).enumerate() {
                    for val in column.iter_mut() {
                        if !val.is_finite() {
                            *val = fill_values[col_idx];
                        }
                    }
                }
            }
        }

        Ok(imputed)
    }
}

// Outlier Remover
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OutlierRemoverParams {
    pub method: OutlierMethod,
    pub threshold: f64,
    pub fitted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum OutlierMethod {
    ZScore,
    IQR,
    IsolationForest,
}

impl Default for OutlierRemoverParams {
    fn default() -> Self {
        Self {
            method: OutlierMethod::IQR,
            threshold: 1.5,
            fitted: false,
        }
    }
}

pub struct OutlierRemover;

impl OutlierRemover {
    pub fn fit_transform(params: &mut OutlierRemoverParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        params.fitted = true;
        Self::transform(params, data)
    }

    pub fn transform(params: &OutlierRemoverParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("OutlierRemover not fitted".to_string()));
        }

        let outlier_mask = match params.method {
            OutlierMethod::ZScore => Self::detect_outliers_zscore(data, params.threshold),
            OutlierMethod::IQR => Self::detect_outliers_iqr(data, params.threshold),
            OutlierMethod::IsolationForest => Self::detect_outliers_isolation_forest(data)?,
        };

        // Filter out outliers
        let clean_data = Self::filter_outliers(data, &outlier_mask);
        Ok(clean_data)
    }

    fn detect_outliers_zscore(data: ArrayView2<f64>, threshold: f64) -> Vec<bool> {
        let means = data.mean_axis(Axis(0)).unwrap();
        let stds = data.std_axis(Axis(0), 0.0);

        let mut is_outlier = vec![false; data.nrows()];

        for (row_idx, row) in data.axis_iter(Axis(0)).enumerate() {
            for (col_idx, &value) in row.iter().enumerate() {
                if stds[col_idx] > 1e-10 {
                    let z_score = ((value - means[col_idx]) / stds[col_idx]).abs();
                    if z_score > threshold {
                        is_outlier[row_idx] = true;
                        break;
                    }
                }
            }
        }

        is_outlier
    }

    fn detect_outliers_iqr(data: ArrayView2<f64>, threshold: f64) -> Vec<bool> {
        let mut is_outlier = vec![false; data.nrows()];

        for (col_idx, column) in data.axis_iter(Axis(1)).enumerate() {
            let mut sorted: Vec<f64> = column.iter().cloned().collect();
            sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

            let n = sorted.len();
            let q1_idx = n / 4;
            let q3_idx = 3 * n / 4;
            let q1 = sorted[q1_idx];
            let q3 = sorted[q3_idx.min(n - 1)];
            let iqr = q3 - q1;

            let lower_bound = q1 - threshold * iqr;
            let upper_bound = q3 + threshold * iqr;

            for (row_idx, &value) in column.iter().enumerate() {
                if value < lower_bound || value > upper_bound {
                    is_outlier[row_idx] = true;
                }
            }
        }

        is_outlier
    }

    fn detect_outliers_isolation_forest(data: ArrayView2<f64>) -> Result<Vec<bool>> {
        // Simplified isolation forest outlier detection
        // In practice, you'd use the full isolation forest implementation
        let outlier_mask = Self::detect_outliers_zscore(data, 2.0);
        Ok(outlier_mask)
    }

    fn filter_outliers(data: ArrayView2<f64>, outlier_mask: &[bool]) -> Array2<f64> {
        let clean_count = outlier_mask.iter().filter(|&&is_outlier| !is_outlier).count();
        let mut clean_data = Array2::zeros((clean_count, data.ncols()));

        let mut clean_idx = 0;
        for (row_idx, row) in data.axis_iter(Axis(0)).enumerate() {
            if !outlier_mask[row_idx] {
                clean_data.row_mut(clean_idx).assign(&row);
                clean_idx += 1;
            }
        }

        clean_data
    }
}

// Feature Selector
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FeatureSelectorParams {
    pub method: SelectionMethod,
    pub k: usize,
    pub selected_features: Option<Vec<usize>>,
    pub fitted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SelectionMethod {
    VarianceThreshold(f64),
    KBest,
    Percentile(f64),
    Manual(Vec<usize>),
}

impl Default for FeatureSelectorParams {
    fn default() -> Self {
        Self {
            method: SelectionMethod::VarianceThreshold(0.0),
            k: 10,
            selected_features: None,
            fitted: false,
        }
    }
}

pub struct FeatureSelector;

impl FeatureSelector {
    pub fn fit_transform(params: &mut FeatureSelectorParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let selected_features = match &params.method {
            SelectionMethod::VarianceThreshold(threshold) => {
                let variances = data.var_axis(Axis(0), 0.0);
                (0..variances.len())
                    .filter(|&i| variances[i] > *threshold)
                    .collect()
            },
            SelectionMethod::KBest => {
                let variances = data.var_axis(Axis(0), 0.0);
                let mut feature_scores: Vec<(usize, f64)> = variances.iter()
                    .enumerate()
                    .map(|(i, &var)| (i, var))
                    .collect();

                feature_scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
                feature_scores.truncate(params.k);
                feature_scores.into_iter().map(|(i, _)| i).collect()
            },
            SelectionMethod::Percentile(percentile) => {
                let variances = data.var_axis(Axis(0), 0.0);
                let mut sorted_variances: Vec<f64> = variances.iter().cloned().collect();
                sorted_variances.sort_by(|a, b| a.partial_cmp(b).unwrap());

                let threshold_idx = (sorted_variances.len() as f64 * percentile / 100.0) as usize;
                let threshold = sorted_variances[threshold_idx.min(sorted_variances.len() - 1)];

                (0..variances.len())
                    .filter(|&i| variances[i] >= threshold)
                    .collect()
            },
            SelectionMethod::Manual(features) => features.clone(),
        };

        params.selected_features = Some(selected_features);
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &FeatureSelectorParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("FeatureSelector not fitted".to_string()));
        }

        let selected_features = params.selected_features.as_ref().unwrap();

        if selected_features.is_empty() {
            return Err(PhantomMLError::DataProcessing(
                "No features selected".to_string()
            ));
        }

        let mut selected_data = Array2::zeros((data.nrows(), selected_features.len()));

        for (new_col_idx, &orig_col_idx) in selected_features.iter().enumerate() {
            if orig_col_idx < data.ncols() {
                selected_data.column_mut(new_col_idx)
                    .assign(&data.column(orig_col_idx));
            }
        }

        Ok(selected_data)
    }
}

// Polynomial Features
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PolynomialFeaturesParams {
    pub degree: usize,
    pub interaction_only: bool,
    pub include_bias: bool,
    pub fitted: bool,
}

impl Default for PolynomialFeaturesParams {
    fn default() -> Self {
        Self {
            degree: 2,
            interaction_only: false,
            include_bias: true,
            fitted: false,
        }
    }
}

pub struct PolynomialFeatures;

impl PolynomialFeatures {
    pub fn fit_transform(params: &mut PolynomialFeaturesParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        params.fitted = true;
        Self::transform(params, data)
    }

    pub fn transform(params: &PolynomialFeaturesParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("PolynomialFeatures not fitted".to_string()));
        }

        let n_samples = data.nrows();
        let n_features = data.ncols();

        // Calculate number of output features
        let n_output_features = if params.interaction_only {
            Self::count_interaction_features(n_features, params.degree, params.include_bias)
        } else {
            Self::count_polynomial_features(n_features, params.degree, params.include_bias)
        };

        let mut poly_data = Array2::zeros((n_samples, n_output_features));

        for (sample_idx, sample) in data.axis_iter(Axis(0)).enumerate() {
            let poly_features = if params.interaction_only {
                Self::generate_interaction_features(&sample.to_owned(), params.degree, params.include_bias)
            } else {
                Self::generate_polynomial_features(&sample.to_owned(), params.degree, params.include_bias)
            };

            poly_data.row_mut(sample_idx).assign(&poly_features);
        }

        Ok(poly_data)
    }

    fn count_polynomial_features(n_features: usize, degree: usize, include_bias: bool) -> usize {
        // Simplified calculation for polynomial features
        let mut count = 0;
        if include_bias {
            count += 1;
        }

        // Linear terms
        count += n_features;

        // Higher degree terms (simplified)
        for d in 2..=degree {
            count += n_features.pow(d as u32) / d; // Approximation
        }

        count.min(n_features * 10) // Cap to prevent explosion
    }

    fn count_interaction_features(n_features: usize, degree: usize, include_bias: bool) -> usize {
        let mut count = 0;
        if include_bias {
            count += 1;
        }

        count += n_features; // Linear terms

        // Interaction terms
        for d in 2..=degree {
            count += Self::combinations(n_features, d);
        }

        count
    }

    fn combinations(n: usize, r: usize) -> usize {
        if r > n {
            return 0;
        }
        if r == 0 || r == n {
            return 1;
        }

        let mut result = 1;
        for i in 0..r {
            result = result * (n - i) / (i + 1);
        }
        result
    }

    fn generate_polynomial_features(sample: &Array1<f64>, degree: usize, include_bias: bool) -> Array1<f64> {
        let n_features = sample.len();
        let n_output = Self::count_polynomial_features(n_features, degree, include_bias);
        let mut features = Array1::zeros(n_output);

        let mut idx = 0;

        if include_bias {
            features[idx] = 1.0;
            idx += 1;
        }

        // Linear terms
        for &val in sample.iter() {
            features[idx] = val;
            idx += 1;
        }

        // Quadratic and higher terms (simplified)
        if degree >= 2 {
            for i in 0..n_features {
                for j in i..n_features {
                    if idx < n_output {
                        features[idx] = sample[i] * sample[j];
                        idx += 1;
                    }
                }
            }
        }

        features
    }

    fn generate_interaction_features(sample: &Array1<f64>, degree: usize, include_bias: bool) -> Array1<f64> {
        let n_features = sample.len();
        let n_output = Self::count_interaction_features(n_features, degree, include_bias);
        let mut features = Array1::zeros(n_output);

        let mut idx = 0;

        if include_bias {
            features[idx] = 1.0;
            idx += 1;
        }

        // Linear terms
        for &val in sample.iter() {
            features[idx] = val;
            idx += 1;
        }

        // Interaction terms only (no powers of single features)
        if degree >= 2 {
            for i in 0..n_features {
                for j in (i + 1)..n_features {
                    if idx < n_output {
                        features[idx] = sample[i] * sample[j];
                        idx += 1;
                    }
                }
            }
        }

        features
    }
}

// One-Hot Encoder
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OneHotEncoderParams {
    pub categories: Option<Vec<Vec<i32>>>,
    pub drop: Option<String>, // "first", "if_binary", or None
    pub fitted: bool,
}

impl Default for OneHotEncoderParams {
    fn default() -> Self {
        Self {
            categories: None,
            drop: None,
            fitted: false,
        }
    }
}

pub struct OneHotEncoder;

impl OneHotEncoder {
    pub fn fit_transform(params: &mut OneHotEncoderParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        let mut categories = Vec::new();

        for column in data.axis_iter(Axis(1)) {
            let mut unique_values: Vec<i32> = column.iter()
                .map(|&x| x as i32)
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect();
            unique_values.sort();
            categories.push(unique_values);
        }

        params.categories = Some(categories);
        params.fitted = true;

        Self::transform(params, data)
    }

    pub fn transform(params: &OneHotEncoderParams, data: ArrayView2<f64>) -> Result<Array2<f64>> {
        if !params.fitted {
            return Err(PhantomMLError::Model("OneHotEncoder not fitted".to_string()));
        }

        let categories = params.categories.as_ref().unwrap();

        // Calculate total number of output columns
        let mut total_cols = 0;
        for cat_list in categories {
            let n_categories = cat_list.len();
            let cols_for_feature = match &params.drop {
                Some(drop_method) => match drop_method.as_str() {
                    "first" => n_categories.saturating_sub(1).max(1),
                    "if_binary" => if n_categories == 2 { 1 } else { n_categories },
                    _ => n_categories,
                },
                None => n_categories,
            };
            total_cols += cols_for_feature;
        }

        let mut encoded = Array2::zeros((data.nrows(), total_cols));
        let mut col_offset = 0;

        for (feat_idx, (column, cat_list)) in data.axis_iter(Axis(1)).zip(categories.iter()).enumerate() {
            let n_categories = cat_list.len();
            let cols_for_feature = match &params.drop {
                Some(drop_method) => match drop_method.as_str() {
                    "first" => n_categories.saturating_sub(1).max(1),
                    "if_binary" => if n_categories == 2 { 1 } else { n_categories },
                    _ => n_categories,
                },
                None => n_categories,
            };

            for (row_idx, &value) in column.iter().enumerate() {
                let category = value as i32;
                if let Some(cat_idx) = cat_list.iter().position(|&c| c == category) {
                    let encoded_col = match &params.drop {
                        Some(drop_method) => match drop_method.as_str() {
                            "first" => {
                                if cat_idx > 0 {
                                    Some(col_offset + cat_idx - 1)
                                } else {
                                    None // Dropped category
                                }
                            },
                            "if_binary" => {
                                if n_categories == 2 {
                                    if cat_idx == 1 {
                                        Some(col_offset)
                                    } else {
                                        None
                                    }
                                } else {
                                    Some(col_offset + cat_idx)
                                }
                            },
                            _ => Some(col_offset + cat_idx),
                        },
                        None => Some(col_offset + cat_idx),
                    };

                    if let Some(col) = encoded_col {
                        if col < encoded.ncols() {
                            encoded[[row_idx, col]] = 1.0;
                        }
                    }
                }
            }

            col_offset += cols_for_feature;
        }

        Ok(encoded)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_standard_scaler() {
        let data = Array::from_shape_vec((4, 2), vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]).unwrap();

        let mut params = StandardScalerParams::default();
        let scaled = StandardScaler::fit_transform(&mut params, data.view()).unwrap();

        assert_eq!(scaled.shape(), &[4, 2]);
        assert!(params.fitted);

        // Check that means are approximately zero
        let means = scaled.mean_axis(Axis(0)).unwrap();
        assert!(means.iter().all(|&m| m.abs() < 1e-10));
    }

    #[test]
    fn test_min_max_scaler() {
        let data = Array::from_shape_vec((3, 2), vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0]).unwrap();

        let mut params = MinMaxScalerParams::default();
        let scaled = MinMaxScaler::fit_transform(&mut params, data.view()).unwrap();

        assert_eq!(scaled.shape(), &[3, 2]);

        // Check that values are in [0, 1] range
        assert!(scaled.iter().all(|&x| x >= 0.0 && x <= 1.0));
    }

    #[test]
    fn test_missing_value_imputer() {
        let mut data = Array::from_shape_vec((4, 2), vec![1.0, 2.0, f64::NAN, 4.0, 5.0, f64::NAN, 7.0, 8.0]).unwrap();

        let mut params = ImputerParams::default();
        let imputed = MissingValueImputer::fit_transform(&mut params, data.view()).unwrap();

        assert_eq!(imputed.shape(), &[4, 2]);
        assert!(imputed.iter().all(|&x| x.is_finite()));
    }

    #[test]
    fn test_polynomial_features() {
        let data = Array::from_shape_vec((2, 2), vec![1.0, 2.0, 3.0, 4.0]).unwrap();

        let mut params = PolynomialFeaturesParams {
            degree: 2,
            include_bias: true,
            ..Default::default()
        };
        let poly = PolynomialFeatures::fit_transform(&mut params, data.view()).unwrap();

        assert_eq!(poly.nrows(), 2);
        assert!(poly.ncols() >= 3); // At least bias + 2 features + some interactions

        // First column should be bias (all 1s)
        assert!(poly.column(0).iter().all(|&x| (x - 1.0).abs() < 1e-10));
    }

    #[test]
    fn test_preprocessing_pipeline() {
        let data = Array::from_shape_vec((4, 3), vec![
            1.0, 2.0, 3.0,
            4.0, 5.0, 6.0,
            7.0, 8.0, 9.0,
            10.0, 11.0, 12.0
        ]).unwrap();

        let mut pipeline = PreprocessingPipeline::new()
            .add_step(PreprocessingStep::StandardScaler(StandardScalerParams::default()))
            .add_step(PreprocessingStep::PolynomialFeatures(PolynomialFeaturesParams {
                degree: 2,
                include_bias: false,
                interaction_only: true,
                ..Default::default()
            }));

        let transformed = pipeline.fit_transform(data.view()).unwrap();

        assert_eq!(transformed.nrows(), 4);
        assert!(transformed.ncols() > 3); // Should have more features after polynomial expansion

        // Test transform on new data
        let new_data = Array::from_shape_vec((2, 3), vec![2.0, 3.0, 4.0, 5.0, 6.0, 7.0]).unwrap();
        let new_transformed = pipeline.transform(new_data.view()).unwrap();

        assert_eq!(new_transformed.nrows(), 2);
        assert_eq!(new_transformed.ncols(), transformed.ncols());
    }
}