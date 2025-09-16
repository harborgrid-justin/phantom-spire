//! Model Evaluation Metrics
//!
//! Comprehensive evaluation metrics for classification, regression, and clustering tasks.
//! All metrics are optimized for production use with proper error handling.

use crate::error::{PhantomMLError, Result};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Classification metrics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ClassificationMetrics {
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub roc_auc: Option<f64>,
    pub confusion_matrix: Array2<usize>,
    pub classification_report: HashMap<String, ClassificationReport>,
    pub macro_avg: ClassificationReport,
    pub weighted_avg: ClassificationReport,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ClassificationReport {
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub support: usize,
}

/// Regression metrics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RegressionMetrics {
    pub mae: f64,           // Mean Absolute Error
    pub mse: f64,           // Mean Squared Error
    pub rmse: f64,          // Root Mean Squared Error
    pub r2_score: f64,      // R-squared
    pub adjusted_r2: f64,   // Adjusted R-squared
    pub mape: f64,          // Mean Absolute Percentage Error
    pub explained_variance: f64,
    pub max_error: f64,
    pub median_absolute_error: f64,
}

/// Clustering metrics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ClusteringMetrics {
    pub silhouette_score: f64,
    pub calinski_harabasz_score: f64,
    pub davies_bouldin_score: f64,
    pub inertia: Option<f64>, // For K-means
    pub adjusted_rand_score: Option<f64>, // If true labels available
    pub normalized_mutual_info: Option<f64>, // If true labels available
}

/// Evaluation utilities
pub struct Evaluator;

impl Evaluator {
    /// Calculate comprehensive classification metrics
    pub fn classification_metrics(
        y_true: ArrayView1<f64>,
        y_pred: ArrayView1<f64>,
        y_proba: Option<ArrayView2<f64>>,
        labels: Option<Vec<String>>,
    ) -> Result<ClassificationMetrics> {
        if y_true.len() != y_pred.len() {
            return Err(PhantomMLError::DataProcessing(
                "y_true and y_pred must have the same length".to_string()
            ));
        }

        if y_true.is_empty() {
            return Err(PhantomMLError::DataProcessing(
                "Cannot compute metrics for empty arrays".to_string()
            ));
        }

        // Get unique classes
        let mut classes: Vec<i32> = y_true.iter()
            .chain(y_pred.iter())
            .map(|&x| x as i32)
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();
        classes.sort();

        let n_classes = classes.len();

        // Build confusion matrix
        let confusion_matrix = Self::confusion_matrix(y_true, y_pred, &classes)?;

        // Calculate basic metrics
        let accuracy = Self::accuracy(y_true, y_pred);

        // Calculate per-class metrics
        let mut class_reports = HashMap::new();
        let mut macro_precision = 0.0;
        let mut macro_recall = 0.0;
        let mut macro_f1 = 0.0;
        let mut total_support = 0;
        let mut weighted_precision = 0.0;
        let mut weighted_recall = 0.0;
        let mut weighted_f1 = 0.0;

        for (i, &class) in classes.iter().enumerate() {
            let tp = confusion_matrix[[i, i]];
            let fp: usize = (0..n_classes).filter(|&j| j != i).map(|j| confusion_matrix[[j, i]]).sum();
            let fn_: usize = (0..n_classes).filter(|&j| j != i).map(|j| confusion_matrix[[i, j]]).sum();
            let support = tp + fn_;

            let precision = if tp + fp > 0 {
                tp as f64 / (tp + fp) as f64
            } else {
                0.0
            };

            let recall = if tp + fn_ > 0 {
                tp as f64 / (tp + fn_) as f64
            } else {
                0.0
            };

            let f1 = if precision + recall > 0.0 {
                2.0 * precision * recall / (precision + recall)
            } else {
                0.0
            };

            let class_name = labels.as_ref()
                .and_then(|l| l.get(i))
                .map(|s| s.clone())
                .unwrap_or_else(|| format!("class_{}", class));

            class_reports.insert(class_name, ClassificationReport {
                precision,
                recall,
                f1_score: f1,
                support,
            });

            // Accumulate for macro averages
            macro_precision += precision;
            macro_recall += recall;
            macro_f1 += f1;

            // Accumulate for weighted averages
            weighted_precision += precision * support as f64;
            weighted_recall += recall * support as f64;
            weighted_f1 += f1 * support as f64;
            total_support += support;
        }

        // Calculate averages
        let n_classes_f64 = n_classes as f64;
        macro_precision /= n_classes_f64;
        macro_recall /= n_classes_f64;
        macro_f1 /= n_classes_f64;

        if total_support > 0 {
            weighted_precision /= total_support as f64;
            weighted_recall /= total_support as f64;
            weighted_f1 /= total_support as f64;
        }

        // Calculate overall precision, recall, f1 (weighted by support)
        let overall_precision = weighted_precision;
        let overall_recall = weighted_recall;
        let overall_f1 = if overall_precision + overall_recall > 0.0 {
            2.0 * overall_precision * overall_recall / (overall_precision + overall_recall)
        } else {
            0.0
        };

        // Calculate ROC AUC if probabilities are provided
        let roc_auc = if let Some(proba) = y_proba {
            Self::roc_auc_score(y_true, proba).ok()
        } else {
            None
        };

        Ok(ClassificationMetrics {
            accuracy,
            precision: overall_precision,
            recall: overall_recall,
            f1_score: overall_f1,
            roc_auc,
            confusion_matrix,
            classification_report: class_reports,
            macro_avg: ClassificationReport {
                precision: macro_precision,
                recall: macro_recall,
                f1_score: macro_f1,
                support: total_support,
            },
            weighted_avg: ClassificationReport {
                precision: weighted_precision,
                recall: weighted_recall,
                f1_score: weighted_f1,
                support: total_support,
            },
        })
    }

    /// Calculate comprehensive regression metrics
    pub fn regression_metrics(
        y_true: ArrayView1<f64>,
        y_pred: ArrayView1<f64>,
        n_features: Option<usize>,
    ) -> Result<RegressionMetrics> {
        if y_true.len() != y_pred.len() {
            return Err(PhantomMLError::DataProcessing(
                "y_true and y_pred must have the same length".to_string()
            ));
        }

        if y_true.is_empty() {
            return Err(PhantomMLError::DataProcessing(
                "Cannot compute metrics for empty arrays".to_string()
            ));
        }

        let n_samples = y_true.len() as f64;

        // Mean Absolute Error
        let mae = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).abs())
            .sum::<f64>() / n_samples;

        // Mean Squared Error
        let mse = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).powi(2))
            .sum::<f64>() / n_samples;

        // Root Mean Squared Error
        let rmse = mse.sqrt();

        // R-squared
        let y_mean = y_true.mean().unwrap();
        let ss_res = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).powi(2))
            .sum::<f64>();
        let ss_tot = y_true.iter()
            .map(|&y_t| (y_t - y_mean).powi(2))
            .sum::<f64>();

        let r2_score = if ss_tot.abs() < 1e-10 {
            0.0
        } else {
            1.0 - (ss_res / ss_tot)
        };

        // Adjusted R-squared
        let adjusted_r2 = if let Some(n_feat) = n_features {
            let n = n_samples;
            let p = n_feat as f64;
            if n > p + 1.0 {
                1.0 - ((1.0 - r2_score) * (n - 1.0) / (n - p - 1.0))
            } else {
                r2_score
            }
        } else {
            r2_score
        };

        // Mean Absolute Percentage Error
        let mape = y_true.iter()
            .zip(y_pred.iter())
            .filter(|(&y_t, _)| y_t.abs() > 1e-10)
            .map(|(&y_t, &y_p)| ((y_t - y_p) / y_t).abs())
            .sum::<f64>() * 100.0 / n_samples;

        // Explained variance
        let y_pred_mean = y_pred.mean().unwrap();
        let var_y = y_true.iter()
            .map(|&y| (y - y_mean).powi(2))
            .sum::<f64>() / n_samples;
        let var_residual = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).powi(2))
            .sum::<f64>() / n_samples;

        let explained_variance = if var_y.abs() < 1e-10 {
            0.0
        } else {
            1.0 - (var_residual / var_y)
        };

        // Max error
        let max_error = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).abs())
            .fold(0.0, |acc, err| acc.max(err));

        // Median Absolute Error
        let mut abs_errors: Vec<f64> = y_true.iter()
            .zip(y_pred.iter())
            .map(|(&y_t, &y_p)| (y_t - y_p).abs())
            .collect();
        abs_errors.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let median_absolute_error = if abs_errors.len() % 2 == 0 {
            let mid = abs_errors.len() / 2;
            (abs_errors[mid - 1] + abs_errors[mid]) / 2.0
        } else {
            abs_errors[abs_errors.len() / 2]
        };

        Ok(RegressionMetrics {
            mae,
            mse,
            rmse,
            r2_score,
            adjusted_r2,
            mape,
            explained_variance,
            max_error,
            median_absolute_error,
        })
    }

    /// Calculate clustering metrics
    pub fn clustering_metrics(
        features: ArrayView2<f64>,
        labels: ArrayView1<i32>,
        cluster_centers: Option<ArrayView2<f64>>,
        true_labels: Option<ArrayView1<i32>>,
    ) -> Result<ClusteringMetrics> {
        if features.nrows() != labels.len() {
            return Err(PhantomMLError::DataProcessing(
                "Number of samples must match number of labels".to_string()
            ));
        }

        let n_samples = features.nrows();
        if n_samples < 2 {
            return Err(PhantomMLError::DataProcessing(
                "Need at least 2 samples for clustering metrics".to_string()
            ));
        }

        // Silhouette Score
        let silhouette_score = Self::silhouette_score(features, labels)?;

        // Calinski-Harabasz Score (Variance Ratio Criterion)
        let calinski_harabasz_score = Self::calinski_harabasz_score(features, labels)?;

        // Davies-Bouldin Score
        let davies_bouldin_score = Self::davies_bouldin_score(features, labels)?;

        // Inertia (for K-means)
        let inertia = if let Some(centers) = cluster_centers {
            Some(Self::inertia(features, labels, centers)?)
        } else {
            None
        };

        // Adjusted Rand Score and Normalized Mutual Information (if true labels provided)
        let (adjusted_rand_score, normalized_mutual_info) = if let Some(true_labs) = true_labels {
            let ari = Self::adjusted_rand_score(labels, true_labs)?;
            let nmi = Self::normalized_mutual_info(labels, true_labs)?;
            (Some(ari), Some(nmi))
        } else {
            (None, None)
        };

        Ok(ClusteringMetrics {
            silhouette_score,
            calinski_harabasz_score,
            davies_bouldin_score,
            inertia,
            adjusted_rand_score,
            normalized_mutual_info,
        })
    }

    // Helper methods for classification metrics

    fn accuracy(y_true: ArrayView1<f64>, y_pred: ArrayView1<f64>) -> f64 {
        let correct = y_true.iter()
            .zip(y_pred.iter())
            .filter(|(&y_t, &y_p)| (y_t - y_p).abs() < 0.5)
            .count();

        correct as f64 / y_true.len() as f64
    }

    fn confusion_matrix(
        y_true: ArrayView1<f64>,
        y_pred: ArrayView1<f64>,
        classes: &[i32],
    ) -> Result<Array2<usize>> {
        let n_classes = classes.len();
        let mut cm = Array2::zeros((n_classes, n_classes));

        for (&y_t, &y_p) in y_true.iter().zip(y_pred.iter()) {
            let true_idx = classes.iter().position(|&c| c == y_t as i32);
            let pred_idx = classes.iter().position(|&c| c == y_p as i32);

            if let (Some(t_idx), Some(p_idx)) = (true_idx, pred_idx) {
                cm[[t_idx, p_idx]] += 1;
            }
        }

        Ok(cm)
    }

    fn roc_auc_score(y_true: ArrayView1<f64>, y_proba: ArrayView2<f64>) -> Result<f64> {
        // Simplified ROC AUC for binary classification
        if y_proba.ncols() != 2 {
            return Err(PhantomMLError::DataProcessing(
                "ROC AUC currently supports only binary classification".to_string()
            ));
        }

        // Get positive class probabilities
        let pos_proba = y_proba.column(1);

        // Create (threshold, tpr, fpr) points
        let mut thresholds: Vec<f64> = pos_proba.iter().cloned().collect();
        thresholds.sort_by(|a, b| b.partial_cmp(a).unwrap()); // Sort in descending order
        thresholds.dedup();

        let mut tpr_fpr_points = Vec::new();

        for &threshold in &thresholds {
            let mut tp = 0;
            let mut fp = 0;
            let mut tn = 0;
            let mut fn_ = 0;

            for (i, &prob) in pos_proba.iter().enumerate() {
                let predicted = if prob >= threshold { 1 } else { 0 };
                let actual = y_true[i] as i32;

                match (actual, predicted) {
                    (1, 1) => tp += 1,
                    (0, 1) => fp += 1,
                    (1, 0) => fn_ += 1,
                    (0, 0) => tn += 1,
                    _ => {}
                }
            }

            let tpr = if tp + fn_ > 0 {
                tp as f64 / (tp + fn_) as f64
            } else {
                0.0
            };

            let fpr = if fp + tn > 0 {
                fp as f64 / (fp + tn) as f64
            } else {
                0.0
            };

            tpr_fpr_points.push((fpr, tpr));
        }

        // Add corner points
        tpr_fpr_points.push((0.0, 0.0));
        tpr_fpr_points.push((1.0, 1.0));

        // Sort by FPR
        tpr_fpr_points.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

        // Calculate AUC using trapezoidal rule
        let mut auc = 0.0;
        for i in 1..tpr_fpr_points.len() {
            let (fpr_prev, tpr_prev) = tpr_fpr_points[i - 1];
            let (fpr_curr, tpr_curr) = tpr_fpr_points[i];
            auc += (fpr_curr - fpr_prev) * (tpr_curr + tpr_prev) / 2.0;
        }

        Ok(auc)
    }

    // Helper methods for clustering metrics

    fn silhouette_score(features: ArrayView2<f64>, labels: ArrayView1<i32>) -> Result<f64> {
        let n_samples = features.nrows();
        let mut silhouette_scores = Vec::new();

        // Get unique labels
        let unique_labels: Vec<i32> = labels.iter()
            .cloned()
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        if unique_labels.len() < 2 {
            return Err(PhantomMLError::DataProcessing(
                "Need at least 2 clusters for silhouette score".to_string()
            ));
        }

        for i in 0..n_samples {
            let sample = features.row(i);
            let cluster = labels[i];

            // Calculate a(i) - average distance to samples in same cluster
            let same_cluster_distances: Vec<f64> = (0..n_samples)
                .filter(|&j| j != i && labels[j] == cluster)
                .map(|j| Self::euclidean_distance(sample, features.row(j)))
                .collect();

            let a_i = if same_cluster_distances.is_empty() {
                0.0
            } else {
                same_cluster_distances.iter().sum::<f64>() / same_cluster_distances.len() as f64
            };

            // Calculate b(i) - minimum average distance to samples in other clusters
            let mut min_avg_distance = f64::INFINITY;

            for &other_cluster in &unique_labels {
                if other_cluster != cluster {
                    let other_cluster_distances: Vec<f64> = (0..n_samples)
                        .filter(|&j| labels[j] == other_cluster)
                        .map(|j| Self::euclidean_distance(sample, features.row(j)))
                        .collect();

                    if !other_cluster_distances.is_empty() {
                        let avg_distance = other_cluster_distances.iter().sum::<f64>() / other_cluster_distances.len() as f64;
                        min_avg_distance = min_avg_distance.min(avg_distance);
                    }
                }
            }

            let b_i = min_avg_distance;

            // Calculate silhouette score for this sample
            let s_i = if a_i.max(b_i) > 1e-10 {
                (b_i - a_i) / a_i.max(b_i)
            } else {
                0.0
            };

            silhouette_scores.push(s_i);
        }

        Ok(silhouette_scores.iter().sum::<f64>() / silhouette_scores.len() as f64)
    }

    fn calinski_harabasz_score(features: ArrayView2<f64>, labels: ArrayView1<i32>) -> Result<f64> {
        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Get unique labels
        let unique_labels: Vec<i32> = labels.iter()
            .cloned()
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let k = unique_labels.len();

        if k < 2 || k >= n_samples {
            return Ok(0.0);
        }

        // Calculate overall centroid
        let overall_centroid = features.mean_axis(ndarray::Axis(0)).unwrap();

        // Calculate between-cluster dispersion
        let mut between_dispersion = 0.0;
        for &cluster in &unique_labels {
            let cluster_samples: Vec<usize> = (0..n_samples)
                .filter(|&i| labels[i] == cluster)
                .collect();

            if cluster_samples.is_empty() {
                continue;
            }

            // Calculate cluster centroid
            let mut cluster_centroid = Array1::zeros(n_features);
            for &sample_idx in &cluster_samples {
                cluster_centroid = cluster_centroid + features.row(sample_idx);
            }
            cluster_centroid /= cluster_samples.len() as f64;

            // Add to between-cluster dispersion
            let distance_sq = cluster_centroid.iter()
                .zip(overall_centroid.iter())
                .map(|(&c, &o)| (c - o).powi(2))
                .sum::<f64>();

            between_dispersion += cluster_samples.len() as f64 * distance_sq;
        }

        // Calculate within-cluster dispersion
        let mut within_dispersion = 0.0;
        for &cluster in &unique_labels {
            let cluster_samples: Vec<usize> = (0..n_samples)
                .filter(|&i| labels[i] == cluster)
                .collect();

            if cluster_samples.len() < 2 {
                continue;
            }

            // Calculate cluster centroid
            let mut cluster_centroid = Array1::zeros(n_features);
            for &sample_idx in &cluster_samples {
                cluster_centroid = cluster_centroid + features.row(sample_idx);
            }
            cluster_centroid /= cluster_samples.len() as f64;

            // Add within-cluster dispersion
            for &sample_idx in &cluster_samples {
                let sample = features.row(sample_idx);
                let distance_sq = sample.iter()
                    .zip(cluster_centroid.iter())
                    .map(|(&s, &c)| (s - c).powi(2))
                    .sum::<f64>();
                within_dispersion += distance_sq;
            }
        }

        // Calculate Calinski-Harabasz score
        if within_dispersion > 1e-10 && k > 1 {
            let ch_score = (between_dispersion / (k - 1) as f64) / (within_dispersion / (n_samples - k) as f64);
            Ok(ch_score)
        } else {
            Ok(0.0)
        }
    }

    fn davies_bouldin_score(features: ArrayView2<f64>, labels: ArrayView1<i32>) -> Result<f64> {
        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Get unique labels
        let unique_labels: Vec<i32> = labels.iter()
            .cloned()
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let k = unique_labels.len();

        if k < 2 {
            return Ok(0.0);
        }

        // Calculate cluster centroids and within-cluster dispersions
        let mut centroids = Vec::new();
        let mut dispersions = Vec::new();

        for &cluster in &unique_labels {
            let cluster_samples: Vec<usize> = (0..n_samples)
                .filter(|&i| labels[i] == cluster)
                .collect();

            if cluster_samples.is_empty() {
                centroids.push(Array1::zeros(n_features));
                dispersions.push(0.0);
                continue;
            }

            // Calculate cluster centroid
            let mut cluster_centroid = Array1::zeros(n_features);
            for &sample_idx in &cluster_samples {
                cluster_centroid = cluster_centroid + features.row(sample_idx);
            }
            cluster_centroid /= cluster_samples.len() as f64;

            // Calculate within-cluster dispersion
            let dispersion = cluster_samples.iter()
                .map(|&sample_idx| {
                    Self::euclidean_distance(features.row(sample_idx), cluster_centroid.view())
                })
                .sum::<f64>() / cluster_samples.len() as f64;

            centroids.push(cluster_centroid);
            dispersions.push(dispersion);
        }

        // Calculate Davies-Bouldin score
        let mut db_score = 0.0;

        for i in 0..k {
            let mut max_ratio = 0.0;

            for j in 0..k {
                if i != j {
                    let centroid_distance = Self::euclidean_distance(centroids[i].view(), centroids[j].view());

                    if centroid_distance > 1e-10 {
                        let ratio = (dispersions[i] + dispersions[j]) / centroid_distance;
                        max_ratio = max_ratio.max(ratio);
                    }
                }
            }

            db_score += max_ratio;
        }

        Ok(db_score / k as f64)
    }

    fn inertia(features: ArrayView2<f64>, labels: ArrayView1<i32>, centers: ArrayView2<f64>) -> Result<f64> {
        let mut total_inertia = 0.0;

        for (i, sample) in features.axis_iter(ndarray::Axis(0)).enumerate() {
            let cluster = labels[i] as usize;
            if cluster < centers.nrows() {
                let center = centers.row(cluster);
                let distance_sq = sample.iter()
                    .zip(center.iter())
                    .map(|(&s, &c)| (s - c).powi(2))
                    .sum::<f64>();
                total_inertia += distance_sq;
            }
        }

        Ok(total_inertia)
    }

    fn adjusted_rand_score(labels_true: ArrayView1<i32>, labels_pred: ArrayView1<i32>) -> Result<f64> {
        let n = labels_true.len();

        // Create contingency table
        let mut contingency: HashMap<(i32, i32), usize> = HashMap::new();

        for (&true_label, &pred_label) in labels_true.iter().zip(labels_pred.iter()) {
            *contingency.entry((true_label, pred_label)).or_insert(0) += 1;
        }

        // Calculate sums
        let mut sum_comb_c = 0.0;
        let mut sum_comb_k = 0.0;
        let mut sum_comb_nij = 0.0;

        // Row sums (true labels)
        let mut row_sums: HashMap<i32, usize> = HashMap::new();
        for (&(true_label, _), &count) in &contingency {
            *row_sums.entry(true_label).or_insert(0) += count;
        }

        // Column sums (predicted labels)
        let mut col_sums: HashMap<i32, usize> = HashMap::new();
        for (&(_, pred_label), &count) in &contingency {
            *col_sums.entry(pred_label).or_insert(0) += count;
        }

        // Calculate combinations
        for &count in row_sums.values() {
            if count >= 2 {
                sum_comb_c += (count * (count - 1)) as f64 / 2.0;
            }
        }

        for &count in col_sums.values() {
            if count >= 2 {
                sum_comb_k += (count * (count - 1)) as f64 / 2.0;
            }
        }

        for &count in contingency.values() {
            if count >= 2 {
                sum_comb_nij += (count * (count - 1)) as f64 / 2.0;
            }
        }

        let n_comb = (n * (n - 1)) as f64 / 2.0;
        let expected_index = sum_comb_c * sum_comb_k / n_comb;
        let max_index = (sum_comb_c + sum_comb_k) / 2.0;

        let ari = if max_index - expected_index > 1e-10 {
            (sum_comb_nij - expected_index) / (max_index - expected_index)
        } else {
            0.0
        };

        Ok(ari)
    }

    fn normalized_mutual_info(labels_true: ArrayView1<i32>, labels_pred: ArrayView1<i32>) -> Result<f64> {
        let n = labels_true.len() as f64;

        // Calculate contingency table
        let mut contingency: HashMap<(i32, i32), f64> = HashMap::new();
        for (&true_label, &pred_label) in labels_true.iter().zip(labels_pred.iter()) {
            *contingency.entry((true_label, pred_label)).or_insert(0.0) += 1.0;
        }

        // Calculate marginal distributions
        let mut p_true: HashMap<i32, f64> = HashMap::new();
        let mut p_pred: HashMap<i32, f64> = HashMap::new();

        for (&(true_label, pred_label), &count) in &contingency {
            *p_true.entry(true_label).or_insert(0.0) += count / n;
            *p_pred.entry(pred_label).or_insert(0.0) += count / n;
        }

        // Calculate mutual information
        let mut mi = 0.0;
        for (&(true_label, pred_label), &p_joint) in &contingency {
            let p_joint = p_joint / n;
            let p_t = p_true[&true_label];
            let p_p = p_pred[&pred_label];

            if p_joint > 1e-10 && p_t > 1e-10 && p_p > 1e-10 {
                mi += p_joint * (p_joint / (p_t * p_p)).ln();
            }
        }

        // Calculate entropies
        let mut h_true = 0.0;
        for &p in p_true.values() {
            if p > 1e-10 {
                h_true -= p * p.ln();
            }
        }

        let mut h_pred = 0.0;
        for &p in p_pred.values() {
            if p > 1e-10 {
                h_pred -= p * p.ln();
            }
        }

        // Normalized mutual information
        let nmi = if h_true > 1e-10 && h_pred > 1e-10 {
            2.0 * mi / (h_true + h_pred)
        } else {
            0.0
        };

        Ok(nmi)
    }

    fn euclidean_distance(a: ArrayView1<f64>, b: ArrayView1<f64>) -> f64 {
        a.iter()
            .zip(b.iter())
            .map(|(&x, &y)| (x - y).powi(2))
            .sum::<f64>()
            .sqrt()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_classification_metrics() {
        let y_true = Array::from_vec(vec![0.0, 0.0, 1.0, 1.0, 2.0, 2.0]);
        let y_pred = Array::from_vec(vec![0.0, 1.0, 1.0, 1.0, 2.0, 0.0]);

        let metrics = Evaluator::classification_metrics(
            y_true.view(),
            y_pred.view(),
            None,
            None,
        ).unwrap();

        assert!(metrics.accuracy > 0.0);
        assert!(metrics.accuracy <= 1.0);
        assert_eq!(metrics.confusion_matrix.shape(), &[3, 3]);
    }

    #[test]
    fn test_regression_metrics() {
        let y_true = Array::from_vec(vec![1.0, 2.0, 3.0, 4.0, 5.0]);
        let y_pred = Array::from_vec(vec![1.1, 1.9, 3.2, 3.8, 5.1]);

        let metrics = Evaluator::regression_metrics(
            y_true.view(),
            y_pred.view(),
            Some(2),
        ).unwrap();

        assert!(metrics.mae >= 0.0);
        assert!(metrics.mse >= 0.0);
        assert!(metrics.rmse >= 0.0);
        assert!(metrics.r2_score <= 1.0);
        assert!(metrics.mae < 1.0); // Should be quite accurate
    }

    #[test]
    fn test_clustering_metrics() {
        // Create simple 2D data with clear clusters
        let features = Array::from_shape_vec((6, 2), vec![
            0.0, 0.0,  // Cluster 0
            0.1, 0.1,  // Cluster 0
            5.0, 5.0,  // Cluster 1
            5.1, 5.1,  // Cluster 1
            10.0, 10.0, // Cluster 2
            10.1, 10.1, // Cluster 2
        ]).unwrap();

        let labels = Array::from_vec(vec![0, 0, 1, 1, 2, 2]);

        let metrics = Evaluator::clustering_metrics(
            features.view(),
            labels.view(),
            None,
            None,
        ).unwrap();

        assert!(metrics.silhouette_score >= -1.0 && metrics.silhouette_score <= 1.0);
        assert!(metrics.silhouette_score > 0.5); // Should be high for well-separated clusters
        assert!(metrics.calinski_harabasz_score > 0.0);
        assert!(metrics.davies_bouldin_score >= 0.0);
    }

    #[test]
    fn test_confusion_matrix() {
        let y_true = Array::from_vec(vec![0.0, 0.0, 1.0, 1.0]);
        let y_pred = Array::from_vec(vec![0.0, 1.0, 1.0, 1.0]);
        let classes = vec![0, 1];

        let cm = Evaluator::confusion_matrix(y_true.view(), y_pred.view(), &classes).unwrap();

        assert_eq!(cm.shape(), &[2, 2]);
        assert_eq!(cm[[0, 0]], 1); // TP for class 0
        assert_eq!(cm[[0, 1]], 1); // FN for class 0
        assert_eq!(cm[[1, 0]], 0); // FP for class 0
        assert_eq!(cm[[1, 1]], 2); // TP for class 1
    }

    #[test]
    fn test_roc_auc() {
        let y_true = Array::from_vec(vec![0.0, 0.0, 1.0, 1.0]);
        let y_proba = Array::from_shape_vec((4, 2), vec![
            0.8, 0.2,  // Predicted class 0, true class 0 ✓
            0.3, 0.7,  // Predicted class 1, true class 0 ✗
            0.4, 0.6,  // Predicted class 1, true class 1 ✓
            0.1, 0.9,  // Predicted class 1, true class 1 ✓
        ]).unwrap();

        let auc = Evaluator::roc_auc_score(y_true.view(), y_proba.view()).unwrap();

        assert!(auc >= 0.0 && auc <= 1.0);
        assert!(auc > 0.5); // Should be better than random
    }
}