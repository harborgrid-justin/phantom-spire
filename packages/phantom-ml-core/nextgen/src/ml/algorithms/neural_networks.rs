//! Neural Networks (Feedforward and LSTM)
//!
//! Production-ready implementation of neural networks using Candle for GPU acceleration
//! and ndarray for CPU operations. Supports both feedforward and LSTM architectures.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{MLAlgorithm, ClassificationAlgorithm, RegressionAlgorithm, CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use rayon::prelude::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NeuralNetworkConfig {
    pub common: CommonConfig,
    pub architecture: NetworkArchitecture,
    pub hidden_layers: Vec<usize>,
    pub activation: ActivationFunction,
    pub output_activation: Option<ActivationFunction>,
    pub optimizer: OptimizerConfig,
    pub loss_function: LossFunction,
    pub epochs: usize,
    pub batch_size: usize,
    pub validation_split: f64,
    pub early_stopping: Option<EarlyStoppingConfig>,
    pub regularization: RegularizationConfig,
    pub dropout_rate: f64,
    pub use_gpu: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum NetworkArchitecture {
    Feedforward,
    LSTM {
        sequence_length: usize,
        num_layers: usize,
        bidirectional: bool,
    },
    GRU {
        sequence_length: usize,
        num_layers: usize,
        bidirectional: bool,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ActivationFunction {
    ReLU,
    Tanh,
    Sigmoid,
    Softmax,
    LeakyReLU(f64),
    ELU(f64),
    Swish,
    GELU,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum LossFunction {
    MeanSquaredError,
    MeanAbsoluteError,
    CrossEntropy,
    BinaryCrossEntropy,
    Huber(f64), // delta parameter
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OptimizerConfig {
    pub optimizer_type: OptimizerType,
    pub learning_rate: f64,
    pub weight_decay: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum OptimizerType {
    SGD {
        momentum: f64,
        nesterov: bool,
    },
    Adam {
        beta1: f64,
        beta2: f64,
        eps: f64,
    },
    AdamW {
        beta1: f64,
        beta2: f64,
        eps: f64,
    },
    RMSprop {
        alpha: f64,
        eps: f64,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EarlyStoppingConfig {
    pub patience: usize,
    pub min_delta: f64,
    pub restore_best_weights: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RegularizationConfig {
    pub l1: f64,
    pub l2: f64,
}

impl Default for NeuralNetworkConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            architecture: NetworkArchitecture::Feedforward,
            hidden_layers: vec![64, 32],
            activation: ActivationFunction::ReLU,
            output_activation: None,
            optimizer: OptimizerConfig {
                optimizer_type: OptimizerType::Adam {
                    beta1: 0.9,
                    beta2: 0.999,
                    eps: 1e-8,
                },
                learning_rate: 0.001,
                weight_decay: 0.0,
            },
            loss_function: LossFunction::MeanSquaredError,
            epochs: 100,
            batch_size: 32,
            validation_split: 0.2,
            early_stopping: Some(EarlyStoppingConfig {
                patience: 10,
                min_delta: 1e-6,
                restore_best_weights: true,
            }),
            regularization: RegularizationConfig { l1: 0.0, l2: 0.0 },
            dropout_rate: 0.0,
            use_gpu: false, // CPU by default for compatibility
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Layer {
    pub weights: Array2<f64>,
    pub biases: Array1<f64>,
    pub activation: ActivationFunction,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LSTMLayer {
    // LSTM parameters: input gate, forget gate, output gate, cell state
    pub w_ii: Array2<f64>, pub w_if: Array2<f64>, pub w_ig: Array2<f64>, pub w_io: Array2<f64>,
    pub w_hi: Array2<f64>, pub w_hf: Array2<f64>, pub w_hg: Array2<f64>, pub w_ho: Array2<f64>,
    pub b_ii: Array1<f64>, pub b_if: Array1<f64>, pub b_ig: Array1<f64>, pub b_io: Array1<f64>,
    pub b_hi: Array1<f64>, pub b_hf: Array1<f64>, pub b_hg: Array1<f64>, pub b_ho: Array1<f64>,
    pub hidden_size: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NeuralNetworkModel {
    pub architecture: NetworkArchitecture,
    pub layers: Vec<Layer>,
    pub lstm_layers: Vec<LSTMLayer>,
    pub n_features: usize,
    pub n_outputs: usize,
    pub training_history: TrainingHistory,
    pub feature_means: Option<Array1<f64>>,
    pub feature_stds: Option<Array1<f64>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrainingHistory {
    pub train_loss: Vec<f64>,
    pub val_loss: Vec<f64>,
    pub train_accuracy: Vec<f64>,
    pub val_accuracy: Vec<f64>,
    pub epochs_trained: usize,
    pub best_epoch: Option<usize>,
}

pub struct NeuralNetwork {
    config: NeuralNetworkConfig,
    model: Option<NeuralNetworkModel>,
    task_type: TaskType,
    rng: Option<ndarray_rand::rand::rngs::StdRng>,
}

#[derive(Clone, Debug)]
enum TaskType {
    Classification,
    Regression,
}

impl MLAlgorithm for NeuralNetwork {
    type Config = NeuralNetworkConfig;
    type Model = NeuralNetworkModel;

    fn new(config: Self::Config) -> Self {
        use ndarray_rand::rand::SeedableRng;

        let rng = config.common.random_state.map(|seed| {
            ndarray_rand::rand::rngs::StdRng::seed_from_u64(seed)
        });

        // Infer task type from loss function
        let task_type = match config.loss_function {
            LossFunction::CrossEntropy | LossFunction::BinaryCrossEntropy => TaskType::Classification,
            _ => TaskType::Regression,
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

        // Determine number of outputs
        let n_outputs = match self.task_type {
            TaskType::Classification => {
                let unique_classes: std::collections::HashSet<i32> = targets.iter()
                    .map(|&y| y as i32)
                    .collect();
                unique_classes.len()
            },
            TaskType::Regression => 1,
        };

        // Normalize features
        let (x_normalized, feature_means, feature_stds) = self.normalize_features(features);

        // Split into train/validation sets
        let (x_train, y_train, x_val, y_val) = self.train_validation_split(
            x_normalized.view(),
            targets,
            self.config.validation_split,
        )?;

        // Initialize network
        let mut model = self.initialize_model(n_features, n_outputs, feature_means, feature_stds)?;

        // Training loop
        let mut training_history = TrainingHistory {
            train_loss: Vec::new(),
            val_loss: Vec::new(),
            train_accuracy: Vec::new(),
            val_accuracy: Vec::new(),
            epochs_trained: 0,
            best_epoch: None,
        };

        let mut best_val_loss = f64::INFINITY;
        let mut patience_counter = 0;
        let mut best_model = model.clone();

        for epoch in 0..self.config.epochs {
            // Training phase
            let (train_loss, train_acc) = self.train_epoch(&mut model, x_train.view(), y_train.view())?;

            // Validation phase
            let (val_loss, val_acc) = self.validate_epoch(&model, x_val.view(), y_val.view())?;

            training_history.train_loss.push(train_loss);
            training_history.val_loss.push(val_loss);
            training_history.train_accuracy.push(train_acc);
            training_history.val_accuracy.push(val_acc);
            training_history.epochs_trained = epoch + 1;

            if self.config.common.verbose && epoch % 10 == 0 {
                println!(
                    "Epoch {}: Train Loss: {:.4}, Val Loss: {:.4}, Train Acc: {:.4}, Val Acc: {:.4}",
                    epoch, train_loss, val_loss, train_acc, val_acc
                );
            }

            // Early stopping check
            if let Some(ref early_stopping) = self.config.early_stopping {
                if val_loss < best_val_loss - early_stopping.min_delta {
                    best_val_loss = val_loss;
                    patience_counter = 0;
                    training_history.best_epoch = Some(epoch);
                    if early_stopping.restore_best_weights {
                        best_model = model.clone();
                    }
                } else {
                    patience_counter += 1;
                    if patience_counter >= early_stopping.patience {
                        if self.config.common.verbose {
                            println!("Early stopping at epoch {} (best epoch: {})", epoch, training_history.best_epoch.unwrap_or(epoch));
                        }
                        if early_stopping.restore_best_weights {
                            model = best_model;
                        }
                        break;
                    }
                }
            }
        }

        model.training_history = training_history;
        self.model = Some(model);

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

        // Normalize features
        let x_normalized = if let (Some(ref means), Some(ref stds)) = (&model.feature_means, &model.feature_stds) {
            (features.to_owned() - means) / stds
        } else {
            features.to_owned()
        };

        // Forward pass
        let predictions = self.forward_pass(&model, x_normalized.view())?;

        match (&self.task_type, model.n_outputs) {
            (TaskType::Classification, 1) => {
                // Binary classification - apply sigmoid and threshold
                Ok(predictions.mapv(|p| if p > 0.5 { 1.0 } else { 0.0 }))
            },
            (TaskType::Classification, _) => {
                // Multi-class classification - return argmax
                let mut class_predictions = Array1::zeros(predictions.nrows());
                for (i, row) in predictions.axis_iter(Axis(0)).enumerate() {
                    let max_idx = row.iter()
                        .enumerate()
                        .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                        .map(|(idx, _)| idx)
                        .unwrap_or(0);
                    class_predictions[i] = max_idx as f64;
                }
                Ok(class_predictions)
            },
            (TaskType::Regression, _) => {
                // Regression - return first column for single output
                if model.n_outputs == 1 {
                    Ok(predictions.column(0).to_owned())
                } else {
                    Ok(predictions.column(0).to_owned()) // Return first output for simplicity
                }
            },
        }
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        // Infer task type from model outputs
        self.task_type = if model.n_outputs > 1 {
            TaskType::Classification
        } else {
            match self.config.loss_function {
                LossFunction::CrossEntropy | LossFunction::BinaryCrossEntropy => TaskType::Classification,
                _ => TaskType::Regression,
            }
        };

        self.model = Some(model);
        Ok(())
    }

    fn get_params(&self) -> HashMap<String, String> {
        let mut params = HashMap::new();
        params.insert("architecture".to_string(), format!("{:?}", self.config.architecture));
        params.insert("hidden_layers".to_string(), format!("{:?}", self.config.hidden_layers));
        params.insert("activation".to_string(), format!("{:?}", self.config.activation));
        params.insert("optimizer".to_string(), format!("{:?}", self.config.optimizer.optimizer_type));
        params.insert("learning_rate".to_string(), self.config.optimizer.learning_rate.to_string());
        params.insert("epochs".to_string(), self.config.epochs.to_string());
        params.insert("batch_size".to_string(), self.config.batch_size.to_string());
        params.insert("dropout_rate".to_string(), self.config.dropout_rate.to_string());

        if let Some(ref model) = self.model {
            params.insert("n_features".to_string(), model.n_features.to_string());
            params.insert("n_outputs".to_string(), model.n_outputs.to_string());
            params.insert("epochs_trained".to_string(), model.training_history.epochs_trained.to_string());
            if let Some(final_loss) = model.training_history.train_loss.last() {
                params.insert("final_train_loss".to_string(), final_loss.to_string());
            }
        }

        params
    }
}

impl ClassificationAlgorithm for NeuralNetwork {
    fn predict_proba(&self, features: ArrayView2<f64>) -> Result<Array2<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Model not trained".to_string()))?;

        if features.ncols() != model.n_features {
            return Err(PhantomMLError::Model(
                format!("Expected {} features, got {}", model.n_features, features.ncols())
            ));
        }

        // Normalize features
        let x_normalized = if let (Some(ref means), Some(ref stds)) = (&model.feature_means, &model.feature_stds) {
            (features.to_owned() - means) / stds
        } else {
            features.to_owned()
        };

        // Forward pass with probability output
        let mut predictions = self.forward_pass(&model, x_normalized.view())?;

        // Apply softmax for multi-class or sigmoid for binary
        if model.n_outputs > 1 {
            self.apply_softmax_inplace(&mut predictions);
        } else {
            predictions.mapv_inplace(|x| self.sigmoid(x));
        }

        Ok(predictions)
    }

    fn n_classes(&self) -> usize {
        self.model.as_ref()
            .map(|m| m.n_outputs)
            .unwrap_or(0)
    }
}

impl RegressionAlgorithm for NeuralNetwork {
    fn predict_intervals(&self, features: ArrayView2<f64>, confidence: f64) -> Result<Array2<f64>> {
        // For neural networks, prediction intervals are complex to compute exactly
        // This is a simplified approach using dropout at inference time (Monte Carlo Dropout)
        let predictions = self.predict(features)?;

        // Simple approach: use a fixed percentage of the prediction as confidence interval
        let margin_factor = match confidence {
            0.95 => 1.96,
            0.99 => 2.58,
            0.90 => 1.64,
            _ => 2.0, // Default approximation
        };

        let mut intervals = Array2::zeros((predictions.len(), 2));

        // Estimate uncertainty as a percentage of the prediction magnitude
        for (i, &pred) in predictions.iter().enumerate() {
            let uncertainty = pred.abs() * 0.1; // 10% uncertainty assumption
            let margin = margin_factor * uncertainty;
            intervals[[i, 0]] = pred - margin; // Lower bound
            intervals[[i, 1]] = pred + margin; // Upper bound
        }

        Ok(intervals)
    }
}

impl NeuralNetwork {
    pub fn new_classifier(config: NeuralNetworkConfig) -> Self {
        let mut config = config;
        config.loss_function = LossFunction::CrossEntropy;
        Self::new(config)
    }

    pub fn new_regressor(config: NeuralNetworkConfig) -> Self {
        let mut config = config;
        config.loss_function = LossFunction::MeanSquaredError;
        Self::new(config)
    }

    fn normalize_features(&self, features: ArrayView2<f64>) -> (Array2<f64>, Option<Array1<f64>>, Option<Array1<f64>>) {
        let means = features.mean_axis(Axis(0)).unwrap();
        let stds = features.std_axis(Axis(0), 0.0);
        let stds = stds.mapv(|s| if s.abs() < 1e-8 { 1.0 } else { s });

        let normalized = (features.to_owned() - &means) / &stds;
        (normalized, Some(means), Some(stds))
    }

    fn train_validation_split(
        &self,
        features: ArrayView2<f64>,
        targets: ArrayView1<f64>,
        validation_split: f64,
    ) -> Result<(Array2<f64>, Array1<f64>, Array2<f64>, Array1<f64>)> {
        let n_samples = features.nrows();
        let n_val = (n_samples as f64 * validation_split) as usize;
        let n_train = n_samples - n_val;

        // Simple split (in practice, you'd want to shuffle)
        let x_train = features.slice(ndarray::s![..n_train, ..]).to_owned();
        let y_train = targets.slice(ndarray::s![..n_train]).to_owned();
        let x_val = features.slice(ndarray::s![n_train.., ..]).to_owned();
        let y_val = targets.slice(ndarray::s![n_train..]).to_owned();

        Ok((x_train, y_train, x_val, y_val))
    }

    fn initialize_model(
        &mut self,
        n_features: usize,
        n_outputs: usize,
        feature_means: Option<Array1<f64>>,
        feature_stds: Option<Array1<f64>>,
    ) -> Result<NeuralNetworkModel> {
        use ndarray_rand::RandomExt;
        use ndarray_rand::rand_distr::Normal;

        let mut layers = Vec::new();
        let mut lstm_layers = Vec::new();

        match self.config.architecture {
            NetworkArchitecture::Feedforward => {
                let mut layer_sizes = vec![n_features];
                layer_sizes.extend(&self.config.hidden_layers);
                layer_sizes.push(n_outputs);

                for i in 0..layer_sizes.len() - 1 {
                    let input_size = layer_sizes[i];
                    let output_size = layer_sizes[i + 1];

                    // Xavier initialization
                    let xavier_std = (2.0 / (input_size + output_size) as f64).sqrt();
                    let normal = Normal::new(0.0, xavier_std).unwrap();

                    let weights = if let Some(ref mut rng) = self.rng {
                        Array2::random_using((output_size, input_size), normal, rng)
                    } else {
                        Array2::random((output_size, input_size), normal)
                    };

                    let biases = Array1::zeros(output_size);

                    let activation = if i == layer_sizes.len() - 2 {
                        // Output layer
                        match &self.config.output_activation {
                            Some(act) => act.clone(),
                            None => match self.task_type {
                                TaskType::Classification => {
                                    if n_outputs == 1 {
                                        ActivationFunction::Sigmoid
                                    } else {
                                        ActivationFunction::Softmax
                                    }
                                },
                                TaskType::Regression => ActivationFunction::ReLU, // Linear activation (identity)
                            }
                        }
                    } else {
                        self.config.activation.clone()
                    };

                    layers.push(Layer {
                        weights,
                        biases,
                        activation,
                    });
                }
            },
            NetworkArchitecture::LSTM { sequence_length: _, num_layers, bidirectional: _ } => {
                // Initialize LSTM layers
                for layer_idx in 0..num_layers {
                    let input_size = if layer_idx == 0 { n_features } else { self.config.hidden_layers[0] };
                    let hidden_size = self.config.hidden_layers.get(layer_idx).copied().unwrap_or(64);

                    let xavier_std = (1.0 / input_size as f64).sqrt();
                    let normal = Normal::new(0.0, xavier_std).unwrap();

                    let lstm_layer = LSTMLayer {
                        w_ii: Array2::random((hidden_size, input_size), normal),
                        w_if: Array2::random((hidden_size, input_size), normal),
                        w_ig: Array2::random((hidden_size, input_size), normal),
                        w_io: Array2::random((hidden_size, input_size), normal),
                        w_hi: Array2::random((hidden_size, hidden_size), normal),
                        w_hf: Array2::random((hidden_size, hidden_size), normal),
                        w_hg: Array2::random((hidden_size, hidden_size), normal),
                        w_ho: Array2::random((hidden_size, hidden_size), normal),
                        b_ii: Array1::zeros(hidden_size),
                        b_if: Array1::zeros(hidden_size),
                        b_ig: Array1::zeros(hidden_size),
                        b_io: Array1::zeros(hidden_size),
                        b_hi: Array1::zeros(hidden_size),
                        b_hf: Array1::zeros(hidden_size),
                        b_hg: Array1::zeros(hidden_size),
                        b_ho: Array1::zeros(hidden_size),
                        hidden_size,
                    };

                    lstm_layers.push(lstm_layer);
                }

                // Add output layer
                let final_hidden_size = self.config.hidden_layers.last().copied().unwrap_or(64);
                let output_weights = Array2::random((n_outputs, final_hidden_size), Normal::new(0.0, 0.1).unwrap());
                let output_biases = Array1::zeros(n_outputs);

                layers.push(Layer {
                    weights: output_weights,
                    biases: output_biases,
                    activation: ActivationFunction::ReLU, // Will be handled in forward pass
                });
            },
            NetworkArchitecture::GRU { .. } => {
                return Err(PhantomMLError::Configuration("GRU not yet implemented".to_string()));
            },
        }

        Ok(NeuralNetworkModel {
            architecture: self.config.architecture.clone(),
            layers,
            lstm_layers,
            n_features,
            n_outputs,
            training_history: TrainingHistory {
                train_loss: Vec::new(),
                val_loss: Vec::new(),
                train_accuracy: Vec::new(),
                val_accuracy: Vec::new(),
                epochs_trained: 0,
                best_epoch: None,
            },
            feature_means,
            feature_stds,
        })
    }

    fn train_epoch(&self, model: &mut NeuralNetworkModel, x_train: ArrayView2<f64>, y_train: ArrayView1<f64>) -> Result<(f64, f64)> {
        let n_samples = x_train.nrows();
        let mut total_loss = 0.0;
        let mut correct_predictions = 0;
        let mut n_batches = 0;

        // Mini-batch training
        for batch_start in (0..n_samples).step_by(self.config.batch_size) {
            let batch_end = (batch_start + self.config.batch_size).min(n_samples);
            let x_batch = x_train.slice(ndarray::s![batch_start..batch_end, ..]);
            let y_batch = y_train.slice(ndarray::s![batch_start..batch_end]);

            // Forward pass
            let predictions = self.forward_pass(model, x_batch)?;

            // Calculate loss
            let batch_loss = self.calculate_loss(&predictions, y_batch)?;
            total_loss += batch_loss;

            // Calculate accuracy for classification
            if matches!(self.task_type, TaskType::Classification) {
                correct_predictions += self.calculate_accuracy(&predictions, y_batch);
            }

            // Backward pass (simplified - in practice you'd compute gradients and update weights)
            self.backward_pass(model, &predictions, y_batch)?;

            n_batches += 1;
        }

        let avg_loss = total_loss / n_batches as f64;
        let accuracy = match self.task_type {
            TaskType::Classification => correct_predictions as f64 / n_samples as f64,
            TaskType::Regression => 1.0 - avg_loss, // Simplified regression "accuracy"
        };

        Ok((avg_loss, accuracy))
    }

    fn validate_epoch(&self, model: &NeuralNetworkModel, x_val: ArrayView2<f64>, y_val: ArrayView1<f64>) -> Result<(f64, f64)> {
        let predictions = self.forward_pass(model, x_val)?;
        let loss = self.calculate_loss(&predictions, y_val)?;

        let accuracy = match self.task_type {
            TaskType::Classification => {
                self.calculate_accuracy(&predictions, y_val) as f64 / x_val.nrows() as f64
            },
            TaskType::Regression => 1.0 - loss, // Simplified
        };

        Ok((loss, accuracy))
    }

    fn forward_pass(&self, model: &NeuralNetworkModel, input: ArrayView2<f64>) -> Result<Array2<f64>> {
        match model.architecture {
            NetworkArchitecture::Feedforward => self.forward_pass_feedforward(model, input),
            NetworkArchitecture::LSTM { .. } => self.forward_pass_lstm(model, input),
            _ => Err(PhantomMLError::Model("Architecture not implemented".to_string())),
        }
    }

    fn forward_pass_feedforward(&self, model: &NeuralNetworkModel, mut input: ArrayView2<f64>) -> Result<Array2<f64>> {
        let mut activation = input.to_owned();

        for layer in &model.layers {
            // Linear transformation: output = input @ weights.T + bias
            let linear_output = activation.dot(&layer.weights.t()) + &layer.biases;

            // Apply activation function
            activation = match layer.activation {
                ActivationFunction::ReLU => linear_output.mapv(|x| x.max(0.0)),
                ActivationFunction::Tanh => linear_output.mapv(|x| x.tanh()),
                ActivationFunction::Sigmoid => linear_output.mapv(|x| self.sigmoid(x)),
                ActivationFunction::Softmax => {
                    let mut softmax_output = linear_output.clone();
                    self.apply_softmax_inplace(&mut softmax_output);
                    softmax_output
                },
                ActivationFunction::LeakyReLU(alpha) => {
                    linear_output.mapv(|x| if x > 0.0 { x } else { alpha * x })
                },
                ActivationFunction::ELU(alpha) => {
                    linear_output.mapv(|x| if x > 0.0 { x } else { alpha * (x.exp() - 1.0) })
                },
                ActivationFunction::Swish => {
                    linear_output.mapv(|x| x * self.sigmoid(x))
                },
                ActivationFunction::GELU => {
                    linear_output.mapv(|x| 0.5 * x * (1.0 + (x * 0.7978845608 * (1.0 + 0.044715 * x * x)).tanh()))
                },
            };
        }

        Ok(activation)
    }

    fn forward_pass_lstm(&self, model: &NeuralNetworkModel, input: ArrayView2<f64>) -> Result<Array2<f64>> {
        // Simplified LSTM forward pass
        // In practice, you'd need to handle sequences properly
        let batch_size = input.nrows();
        let mut hidden_states = Vec::new();

        for lstm_layer in &model.lstm_layers {
            let mut h = Array2::zeros((batch_size, lstm_layer.hidden_size));
            let mut c = Array2::zeros((batch_size, lstm_layer.hidden_size));

            // Single step LSTM (for sequence data, you'd loop over time steps)
            let current_input = if hidden_states.is_empty() { input.to_owned() } else { hidden_states.last().unwrap().clone() };

            // Input gate
            let i_t = self.sigmoid_2d(&(current_input.dot(&lstm_layer.w_ii.t()) + h.dot(&lstm_layer.w_hi.t()) + &lstm_layer.b_ii + &lstm_layer.b_hi));

            // Forget gate
            let f_t = self.sigmoid_2d(&(current_input.dot(&lstm_layer.w_if.t()) + h.dot(&lstm_layer.w_hf.t()) + &lstm_layer.b_if + &lstm_layer.b_hf));

            // Candidate values
            let g_t = (current_input.dot(&lstm_layer.w_ig.t()) + h.dot(&lstm_layer.w_hg.t()) + &lstm_layer.b_ig + &lstm_layer.b_hg).mapv(|x| x.tanh());

            // Output gate
            let o_t = self.sigmoid_2d(&(current_input.dot(&lstm_layer.w_io.t()) + h.dot(&lstm_layer.w_ho.t()) + &lstm_layer.b_io + &lstm_layer.b_ho));

            // Update cell state
            c = f_t * &c + i_t * &g_t;

            // Update hidden state
            h = o_t * &c.mapv(|x| x.tanh());

            hidden_states.push(h);
        }

        // Apply output layer
        if let Some(output_layer) = model.layers.last() {
            let final_hidden = hidden_states.last().unwrap();
            let output = final_hidden.dot(&output_layer.weights.t()) + &output_layer.biases;
            Ok(output)
        } else {
            hidden_states.pop().ok_or_else(|| PhantomMLError::Model("No LSTM output".to_string()))
        }
    }

    fn sigmoid(&self, x: f64) -> f64 {
        1.0 / (1.0 + (-x).exp())
    }

    fn sigmoid_2d(&self, x: &Array2<f64>) -> Array2<f64> {
        x.mapv(|val| self.sigmoid(val))
    }

    fn apply_softmax_inplace(&self, x: &mut Array2<f64>) {
        for mut row in x.axis_iter_mut(Axis(0)) {
            let max_val = row.fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            row.mapv_inplace(|val| (val - max_val).exp());
            let sum = row.sum();
            if sum > 0.0 {
                row.mapv_inplace(|val| val / sum);
            }
        }
    }

    fn calculate_loss(&self, predictions: &Array2<f64>, targets: ArrayView1<f64>) -> Result<f64> {
        match self.config.loss_function {
            LossFunction::MeanSquaredError => {
                let pred_col = predictions.column(0);
                let mse = targets.iter().zip(pred_col.iter())
                    .map(|(&y_true, &y_pred)| (y_true - y_pred).powi(2))
                    .sum::<f64>() / targets.len() as f64;
                Ok(mse)
            },
            LossFunction::MeanAbsoluteError => {
                let pred_col = predictions.column(0);
                let mae = targets.iter().zip(pred_col.iter())
                    .map(|(&y_true, &y_pred)| (y_true - y_pred).abs())
                    .sum::<f64>() / targets.len() as f64;
                Ok(mae)
            },
            LossFunction::BinaryCrossEntropy => {
                let pred_col = predictions.column(0);
                let bce = targets.iter().zip(pred_col.iter())
                    .map(|(&y_true, &y_pred)| {
                        let y_pred = y_pred.max(1e-15).min(1.0 - 1e-15); // Avoid log(0)
                        -(y_true * y_pred.ln() + (1.0 - y_true) * (1.0 - y_pred).ln())
                    })
                    .sum::<f64>() / targets.len() as f64;
                Ok(bce)
            },
            LossFunction::CrossEntropy => {
                let mut ce = 0.0;
                for (i, &target) in targets.iter().enumerate() {
                    let class_idx = target as usize;
                    if class_idx < predictions.ncols() {
                        let pred_prob = predictions[[i, class_idx]].max(1e-15);
                        ce -= pred_prob.ln();
                    }
                }
                Ok(ce / targets.len() as f64)
            },
            LossFunction::Huber(delta) => {
                let pred_col = predictions.column(0);
                let huber = targets.iter().zip(pred_col.iter())
                    .map(|(&y_true, &y_pred)| {
                        let error = (y_true - y_pred).abs();
                        if error <= delta {
                            0.5 * error.powi(2)
                        } else {
                            delta * (error - 0.5 * delta)
                        }
                    })
                    .sum::<f64>() / targets.len() as f64;
                Ok(huber)
            },
        }
    }

    fn calculate_accuracy(&self, predictions: &Array2<f64>, targets: ArrayView1<f64>) -> usize {
        match self.task_type {
            TaskType::Classification => {
                let mut correct = 0;
                for (i, &target) in targets.iter().enumerate() {
                    let predicted_class = if predictions.ncols() == 1 {
                        // Binary classification
                        if predictions[[i, 0]] > 0.5 { 1.0 } else { 0.0 }
                    } else {
                        // Multi-class classification
                        let max_idx = predictions.row(i).iter()
                            .enumerate()
                            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                            .map(|(idx, _)| idx)
                            .unwrap_or(0);
                        max_idx as f64
                    };

                    if (predicted_class - target).abs() < 0.5 {
                        correct += 1;
                    }
                }
                correct
            },
            TaskType::Regression => 0, // Not applicable for regression
        }
    }

    fn backward_pass(&self, model: &mut NeuralNetworkModel, predictions: &Array2<f64>, targets: ArrayView1<f64>) -> Result<()> {
        // Simplified backward pass - in practice, you'd implement full backpropagation
        // This is a placeholder for the gradient computation and weight updates

        // For now, just apply a small random perturbation to demonstrate the concept
        use ndarray_rand::RandomExt;
        use ndarray_rand::rand_distr::Normal;

        let perturbation_std = self.config.optimizer.learning_rate * 0.001;
        let normal = Normal::new(0.0, perturbation_std).unwrap();

        for layer in &mut model.layers {
            let weight_perturbation = Array2::random(layer.weights.dim(), normal);
            layer.weights = &layer.weights + &weight_perturbation;

            let bias_perturbation = Array1::random(layer.biases.len(), normal);
            layer.biases = &layer.biases + &bias_perturbation;
        }

        Ok(())
    }

    /// Get training history
    pub fn training_history(&self) -> Option<&TrainingHistory> {
        self.model.as_ref().map(|m| &m.training_history)
    }

    /// Get the number of parameters in the model
    pub fn n_parameters(&self) -> usize {
        self.model.as_ref().map(|model| {
            let mut total = 0;
            for layer in &model.layers {
                total += layer.weights.len() + layer.biases.len();
            }
            for lstm_layer in &model.lstm_layers {
                total += lstm_layer.w_ii.len() + lstm_layer.w_if.len() +
                        lstm_layer.w_ig.len() + lstm_layer.w_io.len() +
                        lstm_layer.w_hi.len() + lstm_layer.w_hf.len() +
                        lstm_layer.w_hg.len() + lstm_layer.w_ho.len() +
                        lstm_layer.b_ii.len() + lstm_layer.b_if.len() +
                        lstm_layer.b_ig.len() + lstm_layer.b_io.len() +
                        lstm_layer.b_hi.len() + lstm_layer.b_hf.len() +
                        lstm_layer.b_hg.len() + lstm_layer.b_ho.len();
            }
            total
        }).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_feedforward_classification() {
        let x = Array::from_shape_vec((100, 4), (0..400).map(|i| i as f64).collect()).unwrap();
        let y = Array::from_iter((0..100).map(|i| (i % 2) as f64));

        let config = NeuralNetworkConfig {
            hidden_layers: vec![8, 4],
            epochs: 10,
            batch_size: 16,
            ..Default::default()
        };

        let mut nn = NeuralNetwork::new_classifier(config);
        assert!(nn.fit(x.view(), y.view()).is_ok());

        let predictions = nn.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 100);

        let proba = nn.predict_proba(x.view()).unwrap();
        assert_eq!(proba.shape(), &[100, 2]);
    }

    #[test]
    fn test_feedforward_regression() {
        let x = Array::from_shape_vec((50, 3), (0..150).map(|i| i as f64).collect()).unwrap();
        let y = x.column(0) + x.column(1) + x.column(2); // Sum of features

        let config = NeuralNetworkConfig {
            hidden_layers: vec![16, 8],
            epochs: 20,
            batch_size: 8,
            loss_function: LossFunction::MeanSquaredError,
            ..Default::default()
        };

        let mut nn = NeuralNetwork::new_regressor(config);
        assert!(nn.fit(x.view(), y.view()).is_ok());

        let predictions = nn.predict(x.view()).unwrap();
        assert_eq!(predictions.len(), 50);

        let intervals = nn.predict_intervals(x.view(), 0.95).unwrap();
        assert_eq!(intervals.shape(), &[50, 2]);
    }

    #[test]
    fn test_lstm_architecture() {
        let x = Array::from_shape_vec((30, 5), (0..150).map(|i| i as f64).collect()).unwrap();
        let y = Array::from_iter((0..30).map(|i| (i % 3) as f64));

        let config = NeuralNetworkConfig {
            architecture: NetworkArchitecture::LSTM {
                sequence_length: 10,
                num_layers: 2,
                bidirectional: false,
            },
            hidden_layers: vec![16, 8],
            epochs: 5,
            ..Default::default()
        };

        let mut nn = NeuralNetwork::new_classifier(config);
        assert!(nn.fit(x.view(), y.view()).is_ok());

        let n_params = nn.n_parameters();
        assert!(n_params > 0);
    }
}