//! Time Series Forecasting Models
//!
//! Production-ready implementation of time series forecasting algorithms including
//! ARIMA, exponential smoothing, and neural network-based approaches.

use crate::error::{PhantomMLError, Result};
use crate::ml::algorithms::{CommonConfig, validate_input_shapes};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use rayon::prelude::*;

/// Trait for time series forecasting models
pub trait TimeSeriesModel: Send + Sync {
    type Config: Clone + Send + Sync;
    type Model: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>;

    fn new(config: Self::Config) -> Self;
    fn fit(&mut self, time_series: ArrayView1<f64>) -> Result<()>;
    fn predict(&self, steps: usize) -> Result<Array1<f64>>;
    fn forecast_with_confidence(&self, steps: usize, confidence: f64) -> Result<(Array1<f64>, Array1<f64>, Array1<f64>)>;
    fn model(&self) -> Option<&Self::Model>;
    fn load_model(&mut self, model: Self::Model) -> Result<()>;
}

// ARIMA Model (AutoRegressive Integrated Moving Average)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ARIMAConfig {
    pub common: CommonConfig,
    pub p: usize,  // AR order
    pub d: usize,  // Differencing order
    pub q: usize,  // MA order
    pub seasonal_p: usize,    // Seasonal AR order
    pub seasonal_d: usize,    // Seasonal differencing order
    pub seasonal_q: usize,    // Seasonal MA order
    pub seasonal_period: usize, // Season length (e.g., 12 for monthly data)
    pub max_iter: usize,
    pub tolerance: f64,
}

impl Default for ARIMAConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            p: 1,
            d: 1,
            q: 1,
            seasonal_p: 0,
            seasonal_d: 0,
            seasonal_q: 0,
            seasonal_period: 12,
            max_iter: 100,
            tolerance: 1e-6,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ARIMAModel {
    pub ar_params: Array1<f64>,
    pub ma_params: Array1<f64>,
    pub seasonal_ar_params: Array1<f64>,
    pub seasonal_ma_params: Array1<f64>,
    pub sigma2: f64, // Variance of residuals
    pub original_series: Array1<f64>,
    pub differenced_series: Array1<f64>,
    pub residuals: Array1<f64>,
    pub config: ARIMAConfig,
}

pub struct ARIMA {
    config: ARIMAConfig,
    model: Option<ARIMAModel>,
}

impl TimeSeriesModel for ARIMA {
    type Config = ARIMAConfig;
    type Model = ARIMAModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit(&mut self, time_series: ArrayView1<f64>) -> Result<()> {
        if time_series.len() < self.config.p + self.config.d + self.config.q + 10 {
            return Err(PhantomMLError::DataProcessing(
                "Time series too short for ARIMA model".to_string()
            ));
        }

        // Apply differencing
        let differenced = self.apply_differencing(time_series)?;

        // Estimate parameters using method of moments (simplified)
        let ar_params = self.estimate_ar_parameters(&differenced)?;
        let ma_params = self.estimate_ma_parameters(&differenced, &ar_params)?;

        // Seasonal parameters (simplified - set to zero for now)
        let seasonal_ar_params = Array1::zeros(self.config.seasonal_p);
        let seasonal_ma_params = Array1::zeros(self.config.seasonal_q);

        // Calculate residuals and variance
        let residuals = self.calculate_residuals(&differenced, &ar_params, &ma_params)?;
        let sigma2 = residuals.iter().map(|&r| r * r).sum::<f64>() / residuals.len() as f64;

        self.model = Some(ARIMAModel {
            ar_params,
            ma_params,
            seasonal_ar_params,
            seasonal_ma_params,
            sigma2,
            original_series: time_series.to_owned(),
            differenced_series: differenced,
            residuals,
            config: self.config.clone(),
        });

        Ok(())
    }

    fn predict(&self, steps: usize) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("ARIMA model not fitted".to_string()))?;

        let mut forecasts = Array1::zeros(steps);
        let mut extended_series = model.differenced_series.clone();
        let mut extended_residuals = model.residuals.clone();

        for i in 0..steps {
            let forecast = self.forecast_one_step(&extended_series, &extended_residuals, model)?;
            forecasts[i] = forecast;

            // Extend series with forecast
            extended_series = Array1::from_iter(extended_series.iter().cloned().chain(std::iter::once(forecast)));
            extended_residuals = Array1::from_iter(extended_residuals.iter().cloned().chain(std::iter::once(0.0))); // Assume zero residual
        }

        // Reverse differencing to get original scale
        let undifferenced_forecasts = self.reverse_differencing(&forecasts, &model.original_series)?;

        Ok(undifferenced_forecasts)
    }

    fn forecast_with_confidence(&self, steps: usize, confidence: f64) -> Result<(Array1<f64>, Array1<f64>, Array1<f64>)> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("ARIMA model not fitted".to_string()))?;

        let forecasts = self.predict(steps)?;

        // Calculate confidence intervals (simplified approach)
        let std_error = model.sigma2.sqrt();
        let z_score = match confidence {
            0.95 => 1.96,
            0.99 => 2.58,
            0.90 => 1.64,
            _ => 2.0,
        };

        let mut lower_bound = Array1::zeros(steps);
        let mut upper_bound = Array1::zeros(steps);

        for i in 0..steps {
            let margin = z_score * std_error * ((i + 1) as f64).sqrt(); // Expanding uncertainty
            lower_bound[i] = forecasts[i] - margin;
            upper_bound[i] = forecasts[i] + margin;
        }

        Ok((forecasts, lower_bound, upper_bound))
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.config = model.config.clone();
        self.model = Some(model);
        Ok(())
    }
}

impl ARIMA {
    fn apply_differencing(&self, series: ArrayView1<f64>) -> Result<Array1<f64>> {
        let mut diff_series = series.to_owned();

        // Regular differencing
        for _ in 0..self.config.d {
            diff_series = self.difference_once(&diff_series);
        }

        // Seasonal differencing (simplified)
        for _ in 0..self.config.seasonal_d {
            if diff_series.len() > self.config.seasonal_period {
                diff_series = self.seasonal_difference(&diff_series, self.config.seasonal_period);
            }
        }

        Ok(diff_series)
    }

    fn difference_once(&self, series: &Array1<f64>) -> Array1<f64> {
        if series.len() <= 1 {
            return Array1::zeros(0);
        }

        let mut diff = Array1::zeros(series.len() - 1);
        for i in 1..series.len() {
            diff[i - 1] = series[i] - series[i - 1];
        }
        diff
    }

    fn seasonal_difference(&self, series: &Array1<f64>, period: usize) -> Array1<f64> {
        if series.len() <= period {
            return Array1::zeros(0);
        }

        let mut diff = Array1::zeros(series.len() - period);
        for i in period..series.len() {
            diff[i - period] = series[i] - series[i - period];
        }
        diff
    }

    fn estimate_ar_parameters(&self, series: &Array1<f64>) -> Result<Array1<f64>> {
        if self.config.p == 0 {
            return Ok(Array1::zeros(0));
        }

        // Yule-Walker equations (simplified implementation)
        let n = series.len();
        if n < self.config.p + 1 {
            return Err(PhantomMLError::DataProcessing(
                "Not enough data for AR parameter estimation".to_string()
            ));
        }

        let mut autocorr = Array1::zeros(self.config.p + 1);

        // Calculate sample autocorrelations
        let mean = series.mean().unwrap();
        let variance = series.iter().map(|&x| (x - mean).powi(2)).sum::<f64>() / n as f64;

        for lag in 0..=self.config.p {
            let mut sum = 0.0;
            let valid_pairs = n - lag;

            for i in 0..(valid_pairs) {
                sum += (series[i] - mean) * (series[i + lag] - mean);
            }

            autocorr[lag] = sum / (valid_pairs as f64 * variance);
        }

        // Solve Yule-Walker equations (simplified - use first-order approximation)
        let mut ar_params = Array1::zeros(self.config.p);
        if self.config.p == 1 {
            ar_params[0] = autocorr[1];
        } else {
            // For higher orders, use a simple approximation
            for i in 0..self.config.p {
                ar_params[i] = autocorr[i + 1] / autocorr[0];
            }
        }

        Ok(ar_params)
    }

    fn estimate_ma_parameters(&self, series: &Array1<f64>, ar_params: &Array1<f64>) -> Result<Array1<f64>> {
        if self.config.q == 0 {
            return Ok(Array1::zeros(0));
        }

        // Simplified MA parameter estimation
        // In practice, you'd use maximum likelihood estimation
        let mut ma_params = Array1::zeros(self.config.q);

        // Calculate residuals from AR model
        let residuals = self.calculate_ar_residuals(series, ar_params)?;

        // Use sample autocorrelation of residuals for MA parameters (simplified)
        let n = residuals.len();
        let mean = residuals.mean().unwrap();
        let variance = residuals.iter().map(|&x| (x - mean).powi(2)).sum::<f64>() / n as f64;

        for i in 0..self.config.q.min(residuals.len() - 1) {
            let mut sum = 0.0;
            let valid_pairs = n - i - 1;

            for j in 0..valid_pairs {
                sum += (residuals[j] - mean) * (residuals[j + i + 1] - mean);
            }

            if variance > 1e-10 && valid_pairs > 0 {
                ma_params[i] = -(sum / (valid_pairs as f64 * variance));
            }
        }

        Ok(ma_params)
    }

    fn calculate_ar_residuals(&self, series: &Array1<f64>, ar_params: &Array1<f64>) -> Result<Array1<f64>> {
        let n = series.len();
        let p = ar_params.len();

        if n <= p {
            return Ok(Array1::zeros(0));
        }

        let mut residuals = Array1::zeros(n - p);

        for t in p..n {
            let mut ar_sum = 0.0;
            for i in 0..p {
                ar_sum += ar_params[i] * series[t - i - 1];
            }
            residuals[t - p] = series[t] - ar_sum;
        }

        Ok(residuals)
    }

    fn calculate_residuals(&self, series: &Array1<f64>, ar_params: &Array1<f64>, ma_params: &Array1<f64>) -> Result<Array1<f64>> {
        let n = series.len();
        let p = ar_params.len();
        let q = ma_params.len();
        let start_idx = p.max(q);

        if n <= start_idx {
            return Ok(Array1::zeros(0));
        }

        let mut residuals = Array1::zeros(n - start_idx);
        let mut ma_residuals = VecDeque::new();

        for t in start_idx..n {
            let mut ar_sum = 0.0;
            for i in 0..p {
                if t >= i + 1 {
                    ar_sum += ar_params[i] * series[t - i - 1];
                }
            }

            let mut ma_sum = 0.0;
            for i in 0..q.min(ma_residuals.len()) {
                ma_sum += ma_params[i] * ma_residuals[ma_residuals.len() - i - 1];
            }

            let residual = series[t] - ar_sum - ma_sum;
            residuals[t - start_idx] = residual;

            ma_residuals.push_back(residual);
            if ma_residuals.len() > q {
                ma_residuals.pop_front();
            }
        }

        Ok(residuals)
    }

    fn forecast_one_step(&self, series: &Array1<f64>, residuals: &Array1<f64>, model: &ARIMAModel) -> Result<f64> {
        let p = model.ar_params.len();
        let q = model.ma_params.len();

        let mut forecast = 0.0;

        // AR component
        for i in 0..p {
            if series.len() > i {
                forecast += model.ar_params[i] * series[series.len() - i - 1];
            }
        }

        // MA component
        for i in 0..q {
            if residuals.len() > i {
                forecast += model.ma_params[i] * residuals[residuals.len() - i - 1];
            }
        }

        Ok(forecast)
    }

    fn reverse_differencing(&self, forecasts: &Array1<f64>, original_series: &Array1<f64>) -> Result<Array1<f64>> {
        let mut undifferenced = forecasts.clone();

        // Reverse seasonal differencing first
        for _ in 0..self.config.seasonal_d {
            undifferenced = self.reverse_seasonal_difference(&undifferenced, original_series, self.config.seasonal_period);
        }

        // Reverse regular differencing
        for _ in 0..self.config.d {
            undifferenced = self.reverse_difference_once(&undifferenced, original_series);
        }

        Ok(undifferenced)
    }

    fn reverse_difference_once(&self, diff: &Array1<f64>, original: &Array1<f64>) -> Array1<f64> {
        let mut result = Array1::zeros(diff.len());

        if !original.is_empty() {
            let last_original = original[original.len() - 1];
            result[0] = diff[0] + last_original;

            for i in 1..diff.len() {
                result[i] = diff[i] + result[i - 1];
            }
        }

        result
    }

    fn reverse_seasonal_difference(&self, diff: &Array1<f64>, original: &Array1<f64>, period: usize) -> Array1<f64> {
        let mut result = Array1::zeros(diff.len());

        for i in 0..diff.len() {
            if original.len() >= period && i < original.len() - period {
                result[i] = diff[i] + original[original.len() - period + i];
            } else {
                result[i] = diff[i];
            }
        }

        result
    }
}

// Exponential Smoothing Models
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExponentialSmoothingConfig {
    pub common: CommonConfig,
    pub method: SmoothingMethod,
    pub alpha: Option<f64>, // Level smoothing parameter
    pub beta: Option<f64>,  // Trend smoothing parameter
    pub gamma: Option<f64>, // Seasonal smoothing parameter
    pub seasonal_periods: usize,
    pub optimize_parameters: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SmoothingMethod {
    Simple,           // Simple exponential smoothing
    Double,           // Holt's method (with trend)
    Triple,           // Holt-Winters method (with trend and seasonality)
    Damped,          // Damped trend methods
}

impl Default for ExponentialSmoothingConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            method: SmoothingMethod::Double,
            alpha: None,
            beta: None,
            gamma: None,
            seasonal_periods: 12,
            optimize_parameters: true,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExponentialSmoothingModel {
    pub alpha: f64,
    pub beta: f64,
    pub gamma: f64,
    pub level: f64,
    pub trend: f64,
    pub seasonal: Array1<f64>,
    pub method: SmoothingMethod,
    pub seasonal_periods: usize,
    pub original_series: Array1<f64>,
    pub fitted_values: Array1<f64>,
    pub residuals: Array1<f64>,
}

pub struct ExponentialSmoothing {
    config: ExponentialSmoothingConfig,
    model: Option<ExponentialSmoothingModel>,
}

impl TimeSeriesModel for ExponentialSmoothing {
    type Config = ExponentialSmoothingConfig;
    type Model = ExponentialSmoothingModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit(&mut self, time_series: ArrayView1<f64>) -> Result<()> {
        if time_series.len() < 2 {
            return Err(PhantomMLError::DataProcessing(
                "Time series too short for exponential smoothing".to_string()
            ));
        }

        // Initialize parameters
        let alpha = self.config.alpha.unwrap_or(0.3);
        let beta = self.config.beta.unwrap_or(0.1);
        let gamma = self.config.gamma.unwrap_or(0.1);

        // Initialize components
        let initial_level = time_series[0];
        let initial_trend = if time_series.len() > 1 {
            time_series[1] - time_series[0]
        } else {
            0.0
        };

        let seasonal = if matches!(self.config.method, SmoothingMethod::Triple) {
            self.initialize_seasonal_components(time_series)?
        } else {
            Array1::zeros(self.config.seasonal_periods)
        };

        // Fit the model
        let (fitted_values, residuals, final_level, final_trend, final_seasonal) =
            self.fit_exponential_smoothing(time_series, alpha, beta, gamma, initial_level, initial_trend, &seasonal)?;

        self.model = Some(ExponentialSmoothingModel {
            alpha,
            beta,
            gamma,
            level: final_level,
            trend: final_trend,
            seasonal: final_seasonal,
            method: self.config.method.clone(),
            seasonal_periods: self.config.seasonal_periods,
            original_series: time_series.to_owned(),
            fitted_values,
            residuals,
        });

        Ok(())
    }

    fn predict(&self, steps: usize) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Exponential smoothing model not fitted".to_string()))?;

        let mut forecasts = Array1::zeros(steps);

        for h in 0..steps {
            let forecast = match model.method {
                SmoothingMethod::Simple => {
                    model.level
                },
                SmoothingMethod::Double | SmoothingMethod::Damped => {
                    model.level + (h + 1) as f64 * model.trend
                },
                SmoothingMethod::Triple => {
                    let seasonal_index = h % model.seasonal_periods;
                    model.level + (h + 1) as f64 * model.trend + model.seasonal[seasonal_index]
                },
            };

            forecasts[h] = forecast;
        }

        Ok(forecasts)
    }

    fn forecast_with_confidence(&self, steps: usize, confidence: f64) -> Result<(Array1<f64>, Array1<f64>, Array1<f64>)> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Exponential smoothing model not fitted".to_string()))?;

        let forecasts = self.predict(steps)?;

        // Calculate prediction intervals
        let residual_variance = model.residuals.iter().map(|&r| r * r).sum::<f64>() / model.residuals.len() as f64;
        let std_error = residual_variance.sqrt();

        let z_score = match confidence {
            0.95 => 1.96,
            0.99 => 2.58,
            0.90 => 1.64,
            _ => 2.0,
        };

        let mut lower_bound = Array1::zeros(steps);
        let mut upper_bound = Array1::zeros(steps);

        for h in 0..steps {
            // Prediction interval widens with horizon
            let prediction_variance = match model.method {
                SmoothingMethod::Simple => {
                    residual_variance * (1.0 + model.alpha.powi(2) * h as f64)
                },
                SmoothingMethod::Double => {
                    residual_variance * (1.0 + (model.alpha + model.beta * h as f64).powi(2))
                },
                _ => residual_variance * (1.0 + h as f64 * 0.1),
            };

            let margin = z_score * prediction_variance.sqrt();
            lower_bound[h] = forecasts[h] - margin;
            upper_bound[h] = forecasts[h] + margin;
        }

        Ok((forecasts, lower_bound, upper_bound))
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

impl ExponentialSmoothing {
    fn initialize_seasonal_components(&self, series: ArrayView1<f64>) -> Result<Array1<f64>> {
        let n = series.len();
        let periods = self.config.seasonal_periods;

        if n < 2 * periods {
            return Ok(Array1::zeros(periods));
        }

        // Calculate seasonal indices using ratio-to-moving-average method
        let mut seasonal = Array1::zeros(periods);
        let mut seasonal_counts = vec![0; periods];

        // Calculate centered moving averages
        for i in periods..n - periods {
            let moving_avg = series.slice(ndarray::s![i - periods / 2..i + periods / 2 + 1]).mean().unwrap();

            if moving_avg.abs() > 1e-10 {
                let seasonal_index = i % periods;
                let ratio = series[i] / moving_avg;
                seasonal[seasonal_index] += ratio;
                seasonal_counts[seasonal_index] += 1;
            }
        }

        // Average the seasonal indices
        for i in 0..periods {
            if seasonal_counts[i] > 0 {
                seasonal[i] /= seasonal_counts[i] as f64;
            } else {
                seasonal[i] = 1.0;
            }
        }

        // Normalize seasonal indices
        let seasonal_mean = seasonal.mean().unwrap();
        if seasonal_mean.abs() > 1e-10 {
            seasonal.mapv_inplace(|x| x - seasonal_mean + 1.0);
        }

        Ok(seasonal)
    }

    fn fit_exponential_smoothing(
        &self,
        series: ArrayView1<f64>,
        alpha: f64,
        beta: f64,
        gamma: f64,
        initial_level: f64,
        initial_trend: f64,
        initial_seasonal: &Array1<f64>,
    ) -> Result<(Array1<f64>, Array1<f64>, f64, f64, Array1<f64>)> {
        let n = series.len();
        let mut fitted_values = Array1::zeros(n);
        let mut residuals = Array1::zeros(n);

        let mut level = initial_level;
        let mut trend = initial_trend;
        let mut seasonal = initial_seasonal.clone();

        for t in 0..n {
            // Calculate forecast
            let forecast = match self.config.method {
                SmoothingMethod::Simple => level,
                SmoothingMethod::Double | SmoothingMethod::Damped => level + trend,
                SmoothingMethod::Triple => {
                    let seasonal_index = t % self.config.seasonal_periods;
                    level + trend + seasonal[seasonal_index]
                },
            };

            fitted_values[t] = forecast;
            residuals[t] = series[t] - forecast;

            // Update components
            match self.config.method {
                SmoothingMethod::Simple => {
                    level = alpha * series[t] + (1.0 - alpha) * level;
                },
                SmoothingMethod::Double => {
                    let prev_level = level;
                    level = alpha * series[t] + (1.0 - alpha) * (level + trend);
                    trend = beta * (level - prev_level) + (1.0 - beta) * trend;
                },
                SmoothingMethod::Triple => {
                    let seasonal_index = t % self.config.seasonal_periods;
                    let prev_level = level;
                    let deseasonalized = series[t] - seasonal[seasonal_index];

                    level = alpha * deseasonalized + (1.0 - alpha) * (level + trend);
                    trend = beta * (level - prev_level) + (1.0 - beta) * trend;
                    seasonal[seasonal_index] = gamma * (series[t] - level) + (1.0 - gamma) * seasonal[seasonal_index];
                },
                SmoothingMethod::Damped => {
                    let phi = 0.9; // Damping parameter
                    let prev_level = level;
                    level = alpha * series[t] + (1.0 - alpha) * (level + phi * trend);
                    trend = beta * (level - prev_level) + (1.0 - beta) * phi * trend;
                },
            }
        }

        Ok((fitted_values, residuals, level, trend, seasonal))
    }
}

// Moving Average Models
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MovingAverageConfig {
    pub common: CommonConfig,
    pub window_size: usize,
    pub method: MovingAverageMethod,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MovingAverageMethod {
    Simple,
    Weighted,
    Exponential,
}

impl Default for MovingAverageConfig {
    fn default() -> Self {
        Self {
            common: CommonConfig::default(),
            window_size: 5,
            method: MovingAverageMethod::Simple,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MovingAverageModel {
    pub window_size: usize,
    pub method: MovingAverageMethod,
    pub weights: Option<Array1<f64>>,
    pub last_values: VecDeque<f64>,
    pub original_series: Array1<f64>,
}

pub struct MovingAverage {
    config: MovingAverageConfig,
    model: Option<MovingAverageModel>,
}

impl TimeSeriesModel for MovingAverage {
    type Config = MovingAverageConfig;
    type Model = MovingAverageModel;

    fn new(config: Self::Config) -> Self {
        Self {
            config,
            model: None,
        }
    }

    fn fit(&mut self, time_series: ArrayView1<f64>) -> Result<()> {
        if time_series.len() < self.config.window_size {
            return Err(PhantomMLError::DataProcessing(
                "Time series too short for moving average window".to_string()
            ));
        }

        let weights = match self.config.method {
            MovingAverageMethod::Simple => None,
            MovingAverageMethod::Weighted => {
                // Linear weights (more recent observations get higher weights)
                let w: Vec<f64> = (1..=self.config.window_size)
                    .map(|i| i as f64)
                    .collect();
                let sum: f64 = w.iter().sum();
                Some(Array1::from_vec(w.into_iter().map(|x| x / sum).collect()))
            },
            MovingAverageMethod::Exponential => {
                // Exponential weights
                let alpha = 2.0 / (self.config.window_size + 1) as f64;
                let mut w = Vec::new();
                for i in 0..self.config.window_size {
                    w.push(alpha * (1.0 - alpha).powi(i as i32));
                }
                let sum: f64 = w.iter().sum();
                w.reverse(); // Most recent first
                Some(Array1::from_vec(w.into_iter().map(|x| x / sum).collect()))
            },
        };

        // Store last window_size values
        let start_idx = time_series.len().saturating_sub(self.config.window_size);
        let last_values: VecDeque<f64> = time_series
            .slice(ndarray::s![start_idx..])
            .iter()
            .cloned()
            .collect();

        self.model = Some(MovingAverageModel {
            window_size: self.config.window_size,
            method: self.config.method.clone(),
            weights,
            last_values,
            original_series: time_series.to_owned(),
        });

        Ok(())
    }

    fn predict(&self, steps: usize) -> Result<Array1<f64>> {
        let model = self.model.as_ref()
            .ok_or_else(|| PhantomMLError::Model("Moving average model not fitted".to_string()))?;

        let mut forecasts = Array1::zeros(steps);
        let mut current_values = model.last_values.clone();

        for i in 0..steps {
            let forecast = match &model.method {
                MovingAverageMethod::Simple => {
                    current_values.iter().sum::<f64>() / current_values.len() as f64
                },
                MovingAverageMethod::Weighted | MovingAverageMethod::Exponential => {
                    if let Some(ref weights) = model.weights {
                        current_values.iter()
                            .zip(weights.iter())
                            .map(|(&val, &weight)| val * weight)
                            .sum::<f64>()
                    } else {
                        current_values.iter().sum::<f64>() / current_values.len() as f64
                    }
                },
            };

            forecasts[i] = forecast;

            // Update window with forecast (for multi-step prediction)
            current_values.pop_front();
            current_values.push_back(forecast);
        }

        Ok(forecasts)
    }

    fn forecast_with_confidence(&self, steps: usize, _confidence: f64) -> Result<(Array1<f64>, Array1<f64>, Array1<f64>)> {
        let forecasts = self.predict(steps)?;

        // Moving average confidence intervals are simplified
        // In practice, you'd calculate based on historical variance
        let model = self.model.as_ref().unwrap();
        let variance = {
            let mean = model.original_series.mean().unwrap();
            model.original_series.iter()
                .map(|&x| (x - mean).powi(2))
                .sum::<f64>() / model.original_series.len() as f64
        };

        let std_dev = variance.sqrt();
        let margin = 1.96 * std_dev; // 95% confidence interval

        let lower_bound = forecasts.mapv(|x| x - margin);
        let upper_bound = forecasts.mapv(|x| x + margin);

        Ok((forecasts, lower_bound, upper_bound))
    }

    fn model(&self) -> Option<&Self::Model> {
        self.model.as_ref()
    }

    fn load_model(&mut self, model: Self::Model) -> Result<()> {
        self.model = Some(model);
        Ok(())
    }
}

// Time Series Utilities
pub struct TimeSeriesUtils;

impl TimeSeriesUtils {
    /// Decompose time series into trend, seasonal, and residual components
    pub fn decompose(
        time_series: ArrayView1<f64>,
        period: usize,
        model: DecompositionModel,
    ) -> Result<TimeSeriesDecomposition> {
        if time_series.len() < 2 * period {
            return Err(PhantomMLError::DataProcessing(
                "Time series too short for decomposition".to_string()
            ));
        }

        let trend = Self::extract_trend(time_series, period)?;
        let seasonal = Self::extract_seasonal(time_series, &trend, period, &model)?;
        let residual = Self::calculate_residual(time_series, &trend, &seasonal, &model)?;

        Ok(TimeSeriesDecomposition {
            original: time_series.to_owned(),
            trend,
            seasonal,
            residual,
            period,
            model,
        })
    }

    fn extract_trend(time_series: ArrayView1<f64>, period: usize) -> Result<Array1<f64>> {
        let n = time_series.len();
        let mut trend = Array1::zeros(n);

        // Use centered moving average for trend extraction
        let half_period = period / 2;

        for i in 0..n {
            let start = i.saturating_sub(half_period);
            let end = (i + half_period + 1).min(n);

            let window = time_series.slice(ndarray::s![start..end]);
            trend[i] = window.mean().unwrap();
        }

        Ok(trend)
    }

    fn extract_seasonal(
        time_series: ArrayView1<f64>,
        trend: &Array1<f64>,
        period: usize,
        model: &DecompositionModel,
    ) -> Result<Array1<f64>> {
        let n = time_series.len();
        let mut seasonal = Array1::zeros(n);

        // Calculate detrended series
        let detrended: Array1<f64> = match model {
            DecompositionModel::Additive => time_series.to_owned() - trend,
            DecompositionModel::Multiplicative => {
                time_series.iter()
                    .zip(trend.iter())
                    .map(|(&ts, &tr)| if tr.abs() > 1e-10 { ts / tr } else { ts })
                    .collect()
            },
        };

        // Extract seasonal pattern
        let mut seasonal_pattern = vec![0.0; period];
        let mut counts = vec![0; period];

        for (i, &value) in detrended.iter().enumerate() {
            let season_idx = i % period;
            seasonal_pattern[season_idx] += value;
            counts[season_idx] += 1;
        }

        // Average seasonal components
        for i in 0..period {
            if counts[i] > 0 {
                seasonal_pattern[i] /= counts[i] as f64;
            }
        }

        // Normalize for additive model
        if matches!(model, DecompositionModel::Additive) {
            let seasonal_mean = seasonal_pattern.iter().sum::<f64>() / period as f64;
            for val in &mut seasonal_pattern {
                *val -= seasonal_mean;
            }
        }

        // Assign seasonal values
        for i in 0..n {
            seasonal[i] = seasonal_pattern[i % period];
        }

        Ok(seasonal)
    }

    fn calculate_residual(
        time_series: ArrayView1<f64>,
        trend: &Array1<f64>,
        seasonal: &Array1<f64>,
        model: &DecompositionModel,
    ) -> Result<Array1<f64>> {
        let residual = match model {
            DecompositionModel::Additive => {
                time_series.to_owned() - trend - seasonal
            },
            DecompositionModel::Multiplicative => {
                time_series.iter()
                    .zip(trend.iter())
                    .zip(seasonal.iter())
                    .map(|((&ts, &tr), &se)| {
                        if tr.abs() > 1e-10 && se.abs() > 1e-10 {
                            ts / (tr * se)
                        } else {
                            ts
                        }
                    })
                    .collect()
            },
        };

        Ok(residual)
    }

    /// Detect outliers in time series
    pub fn detect_outliers(time_series: ArrayView1<f64>, method: OutlierDetectionMethod) -> Result<Array1<bool>> {
        match method {
            OutlierDetectionMethod::ZScore(threshold) => {
                let mean = time_series.mean().unwrap();
                let std_dev = time_series.std(0.0);

                let outliers = time_series.mapv(|x| {
                    let z_score = if std_dev > 1e-10 { (x - mean) / std_dev } else { 0.0 };
                    z_score.abs() > threshold
                });

                Ok(outliers)
            },
            OutlierDetectionMethod::IQR(multiplier) => {
                let mut sorted: Vec<f64> = time_series.iter().cloned().collect();
                sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

                let n = sorted.len();
                let q1 = sorted[n / 4];
                let q3 = sorted[3 * n / 4];
                let iqr = q3 - q1;

                let lower_bound = q1 - multiplier * iqr;
                let upper_bound = q3 + multiplier * iqr;

                let outliers = time_series.mapv(|x| x < lower_bound || x > upper_bound);

                Ok(outliers)
            },
        }
    }

    /// Calculate autocorrelation function
    pub fn autocorrelation(time_series: ArrayView1<f64>, max_lags: usize) -> Result<Array1<f64>> {
        let n = time_series.len();
        let mean = time_series.mean().unwrap();

        let mut autocorr = Array1::zeros(max_lags + 1);

        // Calculate variance (lag 0 autocorrelation)
        let variance = time_series.iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f64>() / n as f64;

        autocorr[0] = 1.0; // Autocorrelation at lag 0 is always 1

        for lag in 1..=max_lags {
            if lag >= n {
                break;
            }

            let mut sum = 0.0;
            let valid_pairs = n - lag;

            for i in 0..valid_pairs {
                sum += (time_series[i] - mean) * (time_series[i + lag] - mean);
            }

            if variance > 1e-10 && valid_pairs > 0 {
                autocorr[lag] = sum / (valid_pairs as f64 * variance);
            }
        }

        Ok(autocorr)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TimeSeriesDecomposition {
    pub original: Array1<f64>,
    pub trend: Array1<f64>,
    pub seasonal: Array1<f64>,
    pub residual: Array1<f64>,
    pub period: usize,
    pub model: DecompositionModel,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DecompositionModel {
    Additive,      // y = trend + seasonal + residual
    Multiplicative, // y = trend * seasonal * residual
}

#[derive(Clone, Debug)]
pub enum OutlierDetectionMethod {
    ZScore(f64),    // Z-score threshold
    IQR(f64),       // IQR multiplier
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::Array;

    #[test]
    fn test_arima_model() {
        // Generate simple time series with trend
        let data: Vec<f64> = (0..50).map(|i| i as f64 + (i as f64 * 0.1).sin()).collect();
        let ts = Array::from_vec(data);

        let config = ARIMAConfig {
            p: 1,
            d: 1,
            q: 1,
            ..Default::default()
        };

        let mut arima = ARIMA::new(config);
        assert!(arima.fit(ts.view()).is_ok());

        let forecasts = arima.predict(5).unwrap();
        assert_eq!(forecasts.len(), 5);

        let (forecasts, lower, upper) = arima.forecast_with_confidence(3, 0.95).unwrap();
        assert_eq!(forecasts.len(), 3);
        assert_eq!(lower.len(), 3);
        assert_eq!(upper.len(), 3);

        // Lower bound should be less than upper bound
        for i in 0..3 {
            assert!(lower[i] <= upper[i]);
        }
    }

    #[test]
    fn test_exponential_smoothing() {
        let data: Vec<f64> = (0..20).map(|i| (i as f64).sin() + i as f64 * 0.1).collect();
        let ts = Array::from_vec(data);

        let config = ExponentialSmoothingConfig {
            method: SmoothingMethod::Double,
            ..Default::default()
        };

        let mut es = ExponentialSmoothing::new(config);
        assert!(es.fit(ts.view()).is_ok());

        let forecasts = es.predict(3).unwrap();
        assert_eq!(forecasts.len(), 3);
    }

    #[test]
    fn test_moving_average() {
        let data: Vec<f64> = (1..=10).map(|i| i as f64).collect();
        let ts = Array::from_vec(data);

        let config = MovingAverageConfig {
            window_size: 3,
            method: MovingAverageMethod::Simple,
            ..Default::default()
        };

        let mut ma = MovingAverage::new(config);
        assert!(ma.fit(ts.view()).is_ok());

        let forecasts = ma.predict(2).unwrap();
        assert_eq!(forecasts.len(), 2);

        // For simple moving average of [8, 9, 10], forecast should be 9
        assert!((forecasts[0] - 9.0).abs() < 1e-10);
    }

    #[test]
    fn test_time_series_decomposition() {
        // Create synthetic seasonal data
        let data: Vec<f64> = (0..48).map(|i| {
            let trend = i as f64 * 0.1;
            let seasonal = (i as f64 * 2.0 * std::f64::consts::PI / 12.0).sin();
            let noise = (i as f64 * 0.3).sin() * 0.1;
            trend + seasonal + noise
        }).collect();

        let ts = Array::from_vec(data);

        let decomposition = TimeSeriesUtils::decompose(
            ts.view(),
            12,
            DecompositionModel::Additive
        ).unwrap();

        assert_eq!(decomposition.original.len(), 48);
        assert_eq!(decomposition.trend.len(), 48);
        assert_eq!(decomposition.seasonal.len(), 48);
        assert_eq!(decomposition.residual.len(), 48);
    }

    #[test]
    fn test_autocorrelation() {
        // AR(1) process: x_t = 0.7 * x_{t-1} + noise
        let mut data = vec![0.0];
        for i in 1..100 {
            let noise = ((i as f64).sin() * 0.1);
            data.push(0.7 * data[i - 1] + noise);
        }

        let ts = Array::from_vec(data);
        let autocorr = TimeSeriesUtils::autocorrelation(ts.view(), 10).unwrap();

        assert_eq!(autocorr.len(), 11);
        assert!((autocorr[0] - 1.0).abs() < 1e-10); // Autocorr at lag 0 should be 1
        assert!(autocorr[1] > 0.5); // Should show strong positive correlation at lag 1
    }

    #[test]
    fn test_outlier_detection() {
        let mut data: Vec<f64> = (0..20).map(|i| i as f64).collect();
        data[10] = 100.0; // Add outlier

        let ts = Array::from_vec(data);
        let outliers = TimeSeriesUtils::detect_outliers(ts.view(), OutlierDetectionMethod::ZScore(2.0)).unwrap();

        assert_eq!(outliers.len(), 21);
        assert!(outliers[10]); // Should detect the outlier at index 10
        assert!(!outliers[5]); // Normal points should not be outliers
    }
}