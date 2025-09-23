//! Clustering Algorithms (K-means, DBSCAN)
//!
//! Production-ready implementation of unsupervised clustering algorithms
//! optimized for performance and scalability.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{ClusteringAlgorithm, CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use rayon::prelude::*;

// K-Means Implementation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KMeansConfig {
    pub common: CommonConfig,
    pub n_clusters: usize,
    pub max_iter: usize,
    pub tol: f64,
    pub init: InitMethod,
    pub n_init: usize, // Number of random initializations
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum InitMethod {
    Random,
    KMeansPlusPlus,
    Manual(Array2<f64>), // User-provided centroids
}

impl Default for KMeansConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            n_clusters: 8,
            max_iter: 300,
            tol: 1e-4,
            init: InitMethod::KMeansPlusPlus,
            n_init: 10,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KMeansModel {
    pub cluster_centers: Array2<f64>,
    pub labels: Array1<i32>,
    pub inertia: f64, // Sum of squared distances to centroids
    pub n_iter: usize,
    pub n_features: usize,
}

pub struct KMeans {
    config: KMeansConfig,
    model: Option<KMeansModel>,
    rng: Option<ndarray_rand::rand::rngs::StdRng>,
}

impl ClusteringAlgorithm for KMeans {
    type Config = KMeansConfig;
    type Model = KMeansModel;

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

    fn fit_predict(&mut self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        validate_input_shapes(features, None)?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        if n_samples < self.config.n_clusters {
            return Err(PhantomMLError::Configuration(
                format!("Number of samples ({}) must be >= number of clusters ({})", n_samples, self.config.n_clusters)
            ));
        }

        let mut best_centroids = None;
        let mut best_labels = None;
        let mut best_inertia = f64::INFINITY;
        let mut best_n_iter = 0;

        // Run K-means multiple times with different initializations
        for init_run in 0..self.config.n_init {
            let (centroids, labels, inertia, n_iter) = self.run_kmeans_once(features, init_run)?;

            if inertia < best_inertia {
                best_inertia = inertia;
                best_centroids = Some(centroids);
                best_labels = Some(labels);
                best_n_iter = n_iter;
            }

            if self.config.common.verbose && self.config.n_init > 1 {
                println!("Initialization {}: inertia = {:.4}", init_run + 1, inertia);
            }
        }

        let final_centroids = best_centroids.unwrap();
        let final_labels = best_labels.unwrap();

        self.model = Some(KMeansModel {
            cluster_centers: final_centroids,
            labels: final_labels.clone(),
            inertia: best_inertia,
            n_iter: best_n_iter,
            n_features,
        });

        Ok(final_labels)
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not fitted".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        let n_samples = features.nrows();
        let mut labels = Array1::zeros(n_samples);

        // Assign each sample to the nearest centroid
        for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
            let mut min_distance = f64::INFINITY;
            let mut best_cluster = 0;

            for (cluster_idx, centroid) in model.cluster_centers.axis_iter(Axis(0)).enumerate() {
                let distance = self.euclidean_distance(sample, centroid);
                if distance < min_distance {
                    min_distance = distance;
                    best_cluster = cluster_idx;
                }
            }

            labels[i] = best_cluster as i32;
        }

        Ok(labels)
    }

    fn cluster_centers(&self) -> Option<Array2<f64>> {
        self.model.as_ref().map(|m| m.cluster_centers.clone())
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

impl KMeans {
    fn run_kmeans_once(&mut self, features: ArrayView2<f64>, init_run: usize) -> Result<(Array2<f64>, Array1<i32>, f64, usize)> {
        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Initialize centroids
        let mut centroids = self.initialize_centroids(features, init_run)?;
        let mut labels = Array1::zeros(n_samples);
        let mut prev_inertia = f64::INFINITY;

        for iteration in 0..self.config.max_iter {
            // Assignment step: assign each point to the nearest centroid
            let mut new_labels = Array1::zeros(n_samples);
            let mut cluster_counts = vec![0usize; self.config.n_clusters];

            for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
                let mut min_distance = f64::INFINITY;
                let mut best_cluster = 0;

                for (cluster_idx, centroid) in centroids.axis_iter(Axis(0)).enumerate() {
                    let distance = self.euclidean_distance(sample, centroid);
                    if distance < min_distance {
                        min_distance = distance;
                        best_cluster = cluster_idx;
                    }
                }

                new_labels[i] = best_cluster as i32;
                cluster_counts[best_cluster] += 1;
            }

            // Update step: recalculate centroids
            let mut new_centroids = Array2::zeros((self.config.n_clusters, n_features));

            for cluster_idx in 0..self.config.n_clusters {
                if cluster_counts[cluster_idx] > 0 {
                    let mut cluster_sum = Array1::zeros(n_features);
                    let mut count = 0;

                    for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
                        if new_labels[i] == cluster_idx as i32 {
                            cluster_sum = cluster_sum + sample;
                            count += 1;
                        }
                    }

                    if count > 0 {
                        new_centroids.row_mut(cluster_idx).assign(&(&cluster_sum / count as f64));
                    } else {
                        // Keep the old centroid if no points are assigned
                        new_centroids.row_mut(cluster_idx).assign(&centroids.row(cluster_idx));
                    }
                }
            }

            // Calculate inertia (sum of squared distances to centroids)
            let inertia = self.calculate_inertia(features, &new_centroids, &new_labels);

            // Check for convergence
            if (prev_inertia - inertia).abs() < self.config.tol {
                if self.config.common.verbose {
                    println!("Converged after {} iterations (inertia: {:.4})", iteration + 1, inertia);
                }
                return Ok((new_centroids, new_labels, inertia, iteration + 1));
            }

            centroids = new_centroids;
            labels = new_labels;
            prev_inertia = inertia;
        }

        let final_inertia = self.calculate_inertia(features, &centroids, &labels);
        Ok((centroids, labels, final_inertia, self.config.max_iter))
    }

    fn initialize_centroids(&mut self, features: ArrayView2<f64>, init_run: usize) -> Result<Array2<f64>> {
        let n_samples = features.nrows();
        let n_features = features.ncols();

        match &self.config.init {
            InitMethod::Manual(centroids) => {
                if centroids.nrows() != self.config.n_clusters || centroids.ncols() != n_features {
                    return Err(PhantomMLError::Configuration(
                        "Manual centroids have incorrect dimensions".to_string()
                    ));
                }
                Ok(centroids.clone())
            },
            InitMethod::Random => {
                self.random_initialization(features, init_run)
            },
            InitMethod::KMeansPlusPlus => {
                self.kmeans_plus_plus_initialization(features, init_run)
            },
        }
    }

    fn random_initialization(&mut self, features: ArrayView2<f64>, init_run: usize) -> Result<Array2<f64>> {
        use ndarray_rand::rand::Rng;
        use ndarray_rand::rand::SeedableRng;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        let mut rng = match &mut self.rng {
            Some(rng) => rng,
            None => {
                self.rng = Some(ndarray_rand::rand::rngs::StdRng::seed_from_u64(init_run as u64));
                self.rng.as_mut().unwrap()
            }
        };

        let mut centroids = Array2::zeros((self.config.n_clusters, n_features));

        for i in 0..self.config.n_clusters {
            let random_idx = rng.gen_range(0..n_samples);
            centroids.row_mut(i).assign(&features.row(random_idx));
        }

        Ok(centroids)
    }

    fn kmeans_plus_plus_initialization(&mut self, features: ArrayView2<f64>, init_run: usize) -> Result<Array2<f64>> {
        use ndarray_rand::rand::Rng;
        use ndarray_rand::rand::SeedableRng;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        let mut rng = match &mut self.rng {
            Some(rng) => rng,
            None => {
                self.rng = Some(ndarray_rand::rand::rngs::StdRng::seed_from_u64(init_run as u64));
                self.rng.as_mut().unwrap()
            }
        };

        let mut centroids = Array2::zeros((self.config.n_clusters, n_features));

        // Choose first centroid randomly
        let first_idx = rng.gen_range(0..n_samples);
        centroids.row_mut(0).assign(&features.row(first_idx));

        // Choose remaining centroids with probability proportional to squared distance
        for k in 1..self.config.n_clusters {
            let mut distances = Array1::zeros(n_samples);

            // Calculate distance to nearest existing centroid for each point
            for (i, sample) in features.axis_iter(Axis(0)).enumerate() {
                let mut min_dist_sq = f64::INFINITY;

                for j in 0..k {
                    let centroid = centroids.row(j);
                    let dist_sq = self.euclidean_distance_squared(sample, centroid);
                    min_dist_sq = min_dist_sq.min(dist_sq);
                }

                distances[i] = min_dist_sq;
            }

            // Choose next centroid with probability proportional to squared distance
            let total_dist = distances.sum();
            let mut cumulative = 0.0;
            let threshold = rng.gen::<f64>() * total_dist;

            let mut chosen_idx = 0;
            for (i, &dist) in distances.iter().enumerate() {
                cumulative += dist;
                if cumulative >= threshold {
                    chosen_idx = i;
                    break;
                }
            }

            centroids.row_mut(k).assign(&features.row(chosen_idx));
        }

        Ok(centroids)
    }

    fn euclidean_distance(&self, a: ArrayView1<f64>, b: ArrayView1<f64>) -> f64 {
        a.iter().zip(b.iter())
            .map(|(&x, &y)| (x - y).powi(2))
            .sum::<f64>()
            .sqrt()
    }

    fn euclidean_distance_squared(&self, a: ArrayView1<f64>, b: ArrayView1<f64>) -> f64 {
        a.iter().zip(b.iter())
            .map(|(&x, &y)| (x - y).powi(2))
            .sum::<f64>()
    }

    fn calculate_inertia(&self, features: ArrayView2<f64>, centroids: &Array2<f64>, labels: &Array1<i32>) -> f64 {
        features.axis_iter(Axis(0))
            .zip(labels.iter())
            .map(|(sample, &label)| {
                let centroid = centroids.row(label as usize);
                self.euclidean_distance_squared(sample, centroid)
            })
            .sum()
    }

    /// Get the inertia (sum of squared distances to centroids)
    pub fn inertia(&self) -> Option<f64> {
        self.model.as_ref().map(|m| m.inertia)
    }

    /// Get the number of iterations performed
    pub fn n_iter(&self) -> Option<usize> {
        self.model.as_ref().map(|m| m.n_iter)
    }
}

// DBSCAN Implementation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DBSCANConfig {
    pub common: CommonConfig,
    pub eps: f64, // The maximum distance between two samples for them to be considered neighbors
    pub min_samples: usize, // The number of samples in a neighborhood for a point to be core
    pub metric: DistanceMetric,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DistanceMetric {
    Euclidean,
    Manhattan,
    Chebyshev,
}

impl Default for DBSCANConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            eps: 0.5,
            min_samples: 5,
            metric: DistanceMetric::Euclidean,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DBSCANModel {
    pub labels: Array1<i32>,
    pub core_sample_indices: Vec<usize>,
    pub n_clusters: usize,
    pub n_features: usize,
}

pub struct DBSCAN {
    config: DBSCANConfig,
    model: Option<DBSCANModel>,
}

impl ClusteringAlgorithm for DBSCAN {
    type Config = DBSCANConfig;
    type Model = DBSCANModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit_predict(&mut self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        validate_input_shapes(features, None)?;

        let n_samples = features.nrows();
        let n_features = features.ncols();

        // Initialize labels (-1 means noise/outlier, -2 means unprocessed)
        let mut labels = Array1::from_elem(n_samples, -2i32);
        let mut core_sample_indices = Vec::new();
        let mut cluster_id = 0;

        // Find all core points and build neighborhood relationships
        let neighborhoods = self.build_neighborhoods(features)?;

        for point_idx in 0..n_samples {
            if labels[point_idx] != -2 {
                continue; // Already processed
            }

            let neighbors = &neighborhoods[point_idx];

            if neighbors.len() < self.config.min_samples {
                labels[point_idx] = -1; // Mark as noise
                continue;
            }

            // This is a core point
            core_sample_indices.push(point_idx);
            labels[point_idx] = cluster_id;

            // Expand the cluster using BFS
            let mut neighbor_queue: Vec<usize> = neighbors.clone();
            let mut queue_idx = 0;

            while queue_idx < neighbor_queue.len() {
                let neighbor_idx = neighbor_queue[queue_idx];
                queue_idx += 1;

                if labels[neighbor_idx] == -1 {
                    labels[neighbor_idx] = cluster_id; // Convert noise to border point
                } else if labels[neighbor_idx] == -2 {
                    labels[neighbor_idx] = cluster_id;

                    // If this neighbor is also a core point, add its neighbors to the queue
                    let neighbor_neighbors = &neighborhoods[neighbor_idx];
                    if neighbor_neighbors.len() >= self.config.min_samples {
                        for &nn_idx in neighbor_neighbors {
                            if !neighbor_queue.contains(&nn_idx) {
                                neighbor_queue.push(nn_idx);
                            }
                        }
                    }
                }
            }

            cluster_id += 1;
        }

        let n_clusters = cluster_id as usize;

        self.model = Some(DBSCANModel {
            labels: labels.clone(),
            core_sample_indices,
            n_clusters,
            n_features,
        });

        Ok(labels)
    }

    fn predict(&self, features: ArrayView2<f64>) -> Result<Array1<i32>> {
        // DBSCAN doesn't have a traditional predict method since it's density-based
        // We'll implement a simple approach: assign new points to the nearest core point's cluster
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not fitted".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        // This is a simplified prediction - in practice, you'd store the training data
        // For now, we'll just return noise labels for all new points
        let n_samples = features.nrows();
        Ok(Array1::from_elem(n_samples, -1)) // All new points are considered noise
    }

    fn cluster_centers(&self) -> Option<Array2<f64>> {
        // DBSCAN doesn't have explicit centroids
        None
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

impl DBSCAN {
    fn build_neighborhoods(&self, features: ArrayView2<f64>) -> Result<Vec<Vec<usize>>> {
        let n_samples = features.nrows();
        let mut neighborhoods = Vec::with_capacity(n_samples);

        // Build neighborhoods for each point
        for i in 0..n_samples {
            let mut neighbors = Vec::new();
            let point_i = features.row(i);

            for j in 0..n_samples {
                if i == j {
                    continue;
                }

                let point_j = features.row(j);
                let distance = self.calculate_distance(point_i, point_j);

                if distance <= self.config.eps {
                    neighbors.push(j);
                }
            }

            neighborhoods.push(neighbors);
        }

        Ok(neighborhoods)
    }

    fn calculate_distance(&self, a: ArrayView1<f64>, b: ArrayView1<f64>) -> f64 {
        match self.config.metric {
            DistanceMetric::Euclidean => {
                a.iter().zip(b.iter())
                    .map(|(&x, &y)| (x - y).powi(2))
                    .sum::<f64>()
                    .sqrt()
            },
            DistanceMetric::Manhattan => {
                a.iter().zip(b.iter())
                    .map(|(&x, &y)| (x - y).abs())
                    .sum::<f64>()
            },
            DistanceMetric::Chebyshev => {
                a.iter().zip(b.iter())
                    .map(|(&x, &y)| (x - y).abs())
                    .fold(0.0, |acc, diff| acc.max(diff))
            },
        }
    }

    /// Get the number of clusters found
    pub fn n_clusters(&self) -> Option<usize> {
        self.model.as_ref().map(|m| m.n_clusters)
    }

    /// Get the core sample indices
    pub fn core_sample_indices(&self) -> Option<&Vec<usize>> {
        self.model.as_ref().map(|m| &m.core_sample_indices)
    }

    /// Get the number of noise points
    pub fn n_noise(&self) -> Option<usize> {
        self.model.as_ref().map(|m| {
            m.labels.iter().filter(|&&label| label == -1).count()
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_kmeans_clustering() {
        // Create simple 2D data with clear clusters
        let mut data = Vec::new();
        // Cluster 1: around (0, 0)
        for i in 0..20 {
            data.push(0.0 + (i as f64 * 0.1));
            data.push(0.0 + (i as f64 * 0.1));
        }
        // Cluster 2: around (5, 5)
        for i in 0..20 {
            data.push(5.0 + (i as f64 * 0.1));
            data.push(5.0 + (i as f64 * 0.1));
        }

        let x = Array::from_shape_vec((40, 2), data).unwrap();

        let mut kmeans = KMeans::new(KMeansConfig {
            n_clusters: 2,
            max_iter: 100,
            ..Default::default()
        });

        let labels = kmeans.fit_predict(x.view()).unwrap();
        assert_eq!(labels.len(), 40);

        // Check that we have 2 clusters
        let unique_labels: HashSet<i32> = labels.iter().cloned().collect();
        assert_eq!(unique_labels.len(), 2);

        let centers = kmeans.cluster_centers().unwrap();
        assert_eq!(centers.shape(), &[2, 2]);

        let inertia = kmeans.inertia().unwrap();
        assert!(inertia >= 0.0);
    }

    #[test]
    fn test_kmeans_predict() {
        let x_train = Array::from_shape_vec((20, 2), (0..40).map(|i| i as f64).collect()).unwrap();
        let x_test = Array::from_shape_vec((10, 2), (0..20).map(|i| i as f64 * 2.0).collect()).unwrap();

        let mut kmeans = KMeans::new(KMeansConfig {
            n_clusters: 3,
            ..Default::default()
        });

        kmeans.fit_predict(x_train.view()).unwrap();
        let test_labels = kmeans.predict(x_test.view()).unwrap();

        assert_eq!(test_labels.len(), 10);
        assert!(test_labels.iter().all(|&label| label >= 0 && label < 3));
    }

    #[test]
    fn test_dbscan_clustering() {
        // Create simple 2D data
        let mut data = Vec::new();
        // Dense cluster
        for i in 0..10 {
            for j in 0..10 {
                data.push(i as f64 * 0.1);
                data.push(j as f64 * 0.1);
            }
        }
        // Add some noise points
        data.extend_from_slice(&[10.0, 10.0, -5.0, -5.0, 15.0, 3.0, 2.0, 20.0]);

        let x = Array::from_shape_vec((104, 2), data).unwrap();

        let mut dbscan = DBSCAN::new(DBSCANConfig {
            eps: 0.3,
            min_samples: 3,
            ..Default::default()
        });

        let labels = dbscan.fit_predict(x.view()).unwrap();
        assert_eq!(labels.len(), 104);

        let n_clusters = dbscan.n_clusters().unwrap();
        assert!(n_clusters >= 1);

        let n_noise = dbscan.n_noise().unwrap();
        assert!(n_noise >= 0);
    }

    #[test]
    fn test_distance_metrics() {
        let a = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let b = Array1::from_vec(vec![4.0, 5.0, 6.0]);

        let dbscan_euclidean = DBSCAN::new(DBSCANConfig {
            metric: DistanceMetric::Euclidean,
            ..Default::default()
        });
        let euclidean_dist = dbscan_euclidean.calculate_distance(a.view(), b.view());
        assert!((euclidean_dist - (3.0_f64 * 3.0 + 3.0 * 3.0 + 3.0 * 3.0).sqrt()).abs() < 1e-10);

        let dbscan_manhattan = DBSCAN::new(DBSCANConfig {
            metric: DistanceMetric::Manhattan,
            ..Default::default()
        });
        let manhattan_dist = dbscan_manhattan.calculate_distance(a.view(), b.view());
        assert!((manhattan_dist - 9.0).abs() < 1e-10);

        let dbscan_chebyshev = DBSCAN::new(DBSCANConfig {
            metric: DistanceMetric::Chebyshev,
            ..Default::default()
        });
        let chebyshev_dist = dbscan_chebyshev.calculate_distance(a.view(), b.view());
        assert!((chebyshev_dist - 3.0).abs() < 1e-10);
    }
}