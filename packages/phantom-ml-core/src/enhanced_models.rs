use serde::{Deserialize, Serialize};
use anyhow::Result;
use std::collections::HashMap;

/// Enhanced algorithm support for expanded ML ecosystem
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Algorithm {
    // Traditional ML Algorithms
    RandomForest,
    XGBoost,
    LightGBM,
    CatBoost,
    LogisticRegression,
    LinearRegression,
    RidgeRegression,
    LassoRegression,
    ElasticNet,
    SVM,
    KNN,
    NaiveBayes,
    DecisionTree,
    AdaBoost,
    GradientBoosting,
    ExtraTreesClassifier,
    
    // Deep Learning Algorithms
    NeuralNetwork,
    DeepNeuralNetwork,
    ConvolutionalNN,
    RecurrentNN,
    LSTM,
    GRU,
    Transformer,
    BERT,
    GPT,
    ResNet,
    VGG,
    DenseNet,
    
    // Time Series Algorithms
    ARIMA,
    SARIMA,
    Prophet,
    LSTMTimeSeries,
    TransformerTimeSeries,
    
    // Unsupervised Learning
    KMeans,
    DBSCAN,
    HierarchicalClustering,
    GaussianMixture,
    IsolationForest,
    OneClassSVM,
    LocalOutlierFactor,
    Autoencoder,
    VariationalAutoencoder,
    
    // Reinforcement Learning
    DQN,
    PolicyGradient,
    ActorCritic,
    PPO,
    
    // Ensemble Methods
    VotingClassifier,
    StackingClassifier,
    BaggingClassifier,
    EnsembleClassifier,
    
    // Security-Specific Algorithms
    MalwareDetectionNN,
    NetworkIntrusionDetection,
    ThreatClassifier,
    AnomalyDetectionRF,
    BehavioralAnalysisLSTM,
    LogAnalysisTransformer,
}

/// Deep learning framework support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Framework {
    // Rust-native frameworks
    Candle,
    Burn,
    SmartCore,
    Linfa,
    
    // Python integration (via PyO3)
    PyTorch,
    TensorFlow,
    Keras,
    ScikitLearn,
    XGBoostPython,
    LightGBMPython,
    
    // JavaScript/WASM
    TensorFlowJS,
    
    // Cloud-based
    HuggingFace,
    OpenAI,
    Anthropic,
}

/// Model architecture configuration for deep learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkArchitecture {
    pub layers: Vec<LayerConfig>,
    pub activation: ActivationFunction,
    pub optimizer: OptimizerConfig,
    pub loss_function: LossFunction,
    pub regularization: Option<RegularizationConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerConfig {
    pub layer_type: LayerType,
    pub units: Option<usize>,
    pub activation: Option<ActivationFunction>,
    pub dropout_rate: Option<f32>,
    pub kernel_size: Option<(usize, usize)>,
    pub filters: Option<usize>,
    pub stride: Option<(usize, usize)>,
    pub padding: Option<PaddingType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LayerType {
    Dense,
    Conv2D,
    Conv1D,
    LSTM,
    GRU,
    Dropout,
    BatchNormalization,
    MaxPooling2D,
    AveragePooling2D,
    Flatten,
    Embedding,
    Attention,
    MultiHeadAttention,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActivationFunction {
    ReLU,
    LeakyReLU,
    ELU,
    SELU,
    Swish,
    GELU,
    Tanh,
    Sigmoid,
    Softmax,
    Linear,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizerConfig {
    pub optimizer_type: OptimizerType,
    pub learning_rate: f64,
    pub beta1: Option<f64>,
    pub beta2: Option<f64>,
    pub epsilon: Option<f64>,
    pub weight_decay: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizerType {
    Adam,
    AdamW,
    SGD,
    RMSprop,
    Adagrad,
    Adadelta,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LossFunction {
    MeanSquaredError,
    MeanAbsoluteError,
    BinaryCrossentropy,
    CategoricalCrossentropy,
    SparseCategoricalCrossentropy,
    Huber,
    Hinge,
    ContrastiveLoss,
    TripletLoss,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegularizationConfig {
    pub l1_lambda: Option<f64>,
    pub l2_lambda: Option<f64>,
    pub dropout_rate: Option<f32>,
    pub early_stopping: Option<EarlyStoppingConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarlyStoppingConfig {
    pub patience: usize,
    pub min_delta: f64,
    pub restore_best_weights: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaddingType {
    Valid,
    Same,
}

/// Enhanced model configuration with deep learning support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnhancedModelConfig {
    pub model_type: ModelType,
    pub algorithm: Algorithm,
    pub framework: Framework,
    pub architecture: Option<NetworkArchitecture>,
    pub hyperparameters: HashMap<String, serde_json::Value>,
    pub feature_config: FeatureConfig,
    pub training_config: TrainingConfig,
    pub deployment_config: Option<DeploymentConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelType {
    Classification,
    Regression,
    Clustering,
    AnomalyDetection,
    TimeSeries,
    NLP,
    ComputerVision,
    ReinforcementLearning,
    GenerativeModel,
    SecurityThreatDetection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureConfig {
    pub input_features: Vec<String>,
    pub engineered_features: Vec<String>,
    pub normalization: bool,
    pub scaling_method: ScalingMethod,
    pub feature_selection: bool,
    pub dimensionality_reduction: Option<DimensionalityReduction>,
    pub text_processing: Option<TextProcessingConfig>,
    pub image_processing: Option<ImageProcessingConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScalingMethod {
    MinMax,
    ZScore,
    Robust,
    UnitVector,
    Quantile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DimensionalityReduction {
    PCA,
    TruncatedSVD,
    ICA,
    LDA,
    TSNE,
    UMAP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextProcessingConfig {
    pub tokenizer: TokenizerType,
    pub max_sequence_length: usize,
    pub vocabulary_size: Option<usize>,
    pub embedding_dim: Option<usize>,
    pub preprocessing: Vec<TextPreprocessing>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TokenizerType {
    WordLevel,
    SubWord,
    BPE,
    SentencePiece,
    BERT,
    GPT,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextPreprocessing {
    Lowercase,
    RemovePunctuation,
    RemoveStopwords,
    Stemming,
    Lemmatization,
    RemoveNumbers,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageProcessingConfig {
    pub input_shape: (usize, usize, usize), // (height, width, channels)
    pub preprocessing: Vec<ImagePreprocessing>,
    pub augmentation: Option<Vec<ImageAugmentation>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImagePreprocessing {
    Normalize,
    Resize,
    CenterCrop,
    Grayscale,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImageAugmentation {
    Rotation,
    Flip,
    Zoom,
    Shift,
    Brightness,
    Contrast,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingConfig {
    pub epochs: u32,
    pub batch_size: u32,
    pub learning_rate: f64,
    pub validation_split: f32,
    pub early_stopping: bool,
    pub cross_validation: bool,
    pub cross_validation_folds: u32,
    pub checkpoint_frequency: Option<u32>,
    pub mixed_precision: bool,
    pub gradient_clipping: Option<f64>,
    pub scheduler: Option<SchedulerConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerConfig {
    pub scheduler_type: SchedulerType,
    pub step_size: Option<u32>,
    pub gamma: Option<f64>,
    pub patience: Option<u32>,
    pub factor: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchedulerType {
    StepLR,
    ExponentialLR,
    ReduceLROnPlateau,
    CosineAnnealingLR,
    OneCycleLR,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentConfig {
    pub target_platform: DeploymentPlatform,
    pub optimization: ModelOptimization,
    pub scaling: AutoScalingConfig,
    pub monitoring: MonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeploymentPlatform {
    Docker,
    Kubernetes,
    Lambda,
    EdgeDevice,
    WASM,
    ONNX,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelOptimization {
    pub quantization: Option<QuantizationType>,
    pub pruning: Option<PruningConfig>,
    pub distillation: Option<DistillationConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuantizationType {
    INT8,
    INT16,
    FP16,
    Dynamic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PruningConfig {
    pub sparsity_level: f32,
    pub structured: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistillationConfig {
    pub teacher_model: String,
    pub temperature: f64,
    pub alpha: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoScalingConfig {
    pub min_replicas: u32,
    pub max_replicas: u32,
    pub target_cpu_utilization: f32,
    pub target_memory_utilization: f32,
    pub scale_up_cooldown: u32,
    pub scale_down_cooldown: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub enable_metrics: bool,
    pub enable_logging: bool,
    pub enable_tracing: bool,
    pub alert_thresholds: AlertThresholds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    pub latency_ms: f64,
    pub error_rate: f64,
    pub cpu_utilization: f64,
    pub memory_utilization: f64,
    pub accuracy_degradation: f64,
}

/// Security-specific model configurations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityModelConfig {
    pub threat_types: Vec<ThreatType>,
    pub data_sources: Vec<SecurityDataSource>,
    pub detection_methods: Vec<DetectionMethod>,
    pub response_actions: Vec<ResponseAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreatType {
    Malware,
    NetworkIntrusion,
    DataExfiltration,
    PhishingAttack,
    DDoSAttack,
    InsiderThreat,
    APTAttack,
    ZeroDayExploit,
    BotnetActivity,
    CryptoMining,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecurityDataSource {
    NetworkTraffic,
    SystemLogs,
    ApplicationLogs,
    FileSystem,
    Registry,
    Memory,
    ProcessMonitoring,
    EmailHeaders,
    WebTraffic,
    DNSQueries,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DetectionMethod {
    SignatureBased,
    AnomalyBased,
    BehavioralAnalysis,
    HeuristicAnalysis,
    MachineLearning,
    RulesBased,
    StatisticalAnalysis,
    PatternMatching,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResponseAction {
    BlockTraffic,
    QuarantineFile,
    IsolateHost,
    GenerateAlert,
    LogIncident,
    UpdateRules,
    NotifyAdmin,
    AutoRemediation,
}

impl Algorithm {
    pub fn get_default_hyperparameters(&self) -> HashMap<String, serde_json::Value> {
        use serde_json::json;
        
        match self {
            Algorithm::RandomForest => {
                let mut params = HashMap::new();
                params.insert("n_estimators".to_string(), json!(100));
                params.insert("max_depth".to_string(), json!(10));
                params.insert("min_samples_split".to_string(), json!(2));
                params.insert("min_samples_leaf".to_string(), json!(1));
                params
            },
            Algorithm::XGBoost => {
                let mut params = HashMap::new();
                params.insert("n_estimators".to_string(), json!(100));
                params.insert("max_depth".to_string(), json!(6));
                params.insert("learning_rate".to_string(), json!(0.1));
                params.insert("subsample".to_string(), json!(1.0));
                params.insert("colsample_bytree".to_string(), json!(1.0));
                params
            },
            Algorithm::NeuralNetwork => {
                let mut params = HashMap::new();
                params.insert("hidden_layers".to_string(), json!([100, 50]));
                params.insert("activation".to_string(), json!("relu"));
                params.insert("learning_rate".to_string(), json!(0.001));
                params.insert("batch_size".to_string(), json!(32));
                params.insert("epochs".to_string(), json!(100));
                params
            },
            Algorithm::LSTM => {
                let mut params = HashMap::new();
                params.insert("hidden_size".to_string(), json!(128));
                params.insert("num_layers".to_string(), json!(2));
                params.insert("dropout".to_string(), json!(0.2));
                params.insert("bidirectional".to_string(), json!(false));
                params.insert("learning_rate".to_string(), json!(0.001));
                params
            },
            Algorithm::Transformer => {
                let mut params = HashMap::new();
                params.insert("d_model".to_string(), json!(512));
                params.insert("nhead".to_string(), json!(8));
                params.insert("num_encoder_layers".to_string(), json!(6));
                params.insert("num_decoder_layers".to_string(), json!(6));
                params.insert("dim_feedforward".to_string(), json!(2048));
                params.insert("dropout".to_string(), json!(0.1));
                params
            },
            _ => HashMap::new(),
        }
    }
    
    pub fn is_deep_learning(&self) -> bool {
        matches!(self,
            Algorithm::NeuralNetwork |
            Algorithm::DeepNeuralNetwork |
            Algorithm::ConvolutionalNN |
            Algorithm::RecurrentNN |
            Algorithm::LSTM |
            Algorithm::GRU |
            Algorithm::Transformer |
            Algorithm::BERT |
            Algorithm::GPT |
            Algorithm::ResNet |
            Algorithm::VGG |
            Algorithm::DenseNet |
            Algorithm::Autoencoder |
            Algorithm::VariationalAutoencoder |
            Algorithm::MalwareDetectionNN |
            Algorithm::BehavioralAnalysisLSTM |
            Algorithm::LogAnalysisTransformer
        )
    }
    
    pub fn supports_framework(&self, framework: &Framework) -> bool {
        match self {
            // Traditional ML algorithms work with Rust-native frameworks
            Algorithm::RandomForest | Algorithm::XGBoost | Algorithm::LightGBM |
            Algorithm::LogisticRegression | Algorithm::SVM | Algorithm::KMeans => {
                matches!(framework, Framework::SmartCore | Framework::Linfa | Framework::XGBoostPython | Framework::ScikitLearn)
            },
            // Deep learning algorithms work with DL frameworks
            Algorithm::NeuralNetwork | Algorithm::LSTM | Algorithm::Transformer |
            Algorithm::ConvolutionalNN | Algorithm::BERT | Algorithm::GPT => {
                matches!(framework, Framework::Candle | Framework::Burn | Framework::PyTorch | Framework::TensorFlow | Framework::HuggingFace)
            },
            _ => true, // Default to supporting all frameworks
        }
    }
    
    pub fn get_required_data_types(&self) -> Vec<DataType> {
        match self {
            Algorithm::ConvolutionalNN | Algorithm::ResNet | Algorithm::VGG | Algorithm::DenseNet => {
                vec![DataType::Image]
            },
            Algorithm::LSTM | Algorithm::GRU | Algorithm::ARIMA | Algorithm::Prophet => {
                vec![DataType::TimeSeries, DataType::Text]
            },
            Algorithm::BERT | Algorithm::GPT | Algorithm::LogAnalysisTransformer => {
                vec![DataType::Text]
            },
            Algorithm::NetworkIntrusionDetection => {
                vec![DataType::NetworkTraffic]
            },
            Algorithm::MalwareDetectionNN => {
                vec![DataType::Binary, DataType::Image]
            },
            _ => vec![DataType::Tabular], // Most algorithms work with tabular data
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataType {
    Tabular,
    Text,
    Image,
    Audio,
    Video,
    TimeSeries,
    Graph,
    Binary,
    NetworkTraffic,
    Logs,
}

impl Framework {
    pub fn is_rust_native(&self) -> bool {
        matches!(self, Framework::Candle | Framework::Burn | Framework::SmartCore | Framework::Linfa)
    }
    
    pub fn requires_python(&self) -> bool {
        matches!(self, 
            Framework::PyTorch | Framework::TensorFlow | Framework::Keras | 
            Framework::ScikitLearn | Framework::XGBoostPython | Framework::LightGBMPython
        )
    }
    
    pub fn supports_gpu(&self) -> bool {
        matches!(self, 
            Framework::Candle | Framework::PyTorch | Framework::TensorFlow | 
            Framework::Keras | Framework::HuggingFace
        )
    }
}