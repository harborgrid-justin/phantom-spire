//! src/dataframe.rs
// This module will contain the implementation of the DataFrame, powered by Polars.

use napi::Result;
use napi_derive::napi;
use polars::prelude::*;
use std::path::Path;

/// A DataFrame for in-memory data manipulation, built on top of Polars.
#[napi]
pub struct DataFrame {
    pub(crate) df: PolarsDataFrame,
}

#[napi]
impl DataFrame {
    /// Creates a new DataFrame from a list of Series.
    #[napi(constructor)]
    pub fn new(series: Vec<&PolarsSeries>) -> Result<Self> {
        let series_vec: Vec<PolarsSeries> = series.iter().map(|s| (*s).clone()).collect();
        let df = PolarsDataFrame::new(series_vec)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))?;
        Ok(DataFrame { df })
    }

    /// Creates a DataFrame from a CSV file.
    ///
    /// #[napi]
    /// pub fn from_csv(path: String) -> Result<Self> {
    ///     let p = Path::new(&path);
    ///     let df = CsvReader::from_path(p)
    ///         .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))?
    ///         .finish()
    ///         .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))?;
    ///     Ok(DataFrame { df })
    /// }
    #[napi]
    pub fn from_csv(path: String) -> Result<Self> {
        let p = Path::new(&path);
        let df = CsvReader::from_path(p)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))?
            .finish()
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))?;
        Ok(DataFrame { df })
    }


    /// Returns the column names of the DataFrame.
    #[napi(getter)]
    pub fn columns(&self) -> Vec<String> {
        self.df.get_column_names().into_iter().map(|s| s.to_string()).collect()
    }

    /// Returns the first `n` rows of the DataFrame as a string.
    #[napi]
    pub fn head(&self, n: i64) -> String {
        let num_rows = n as usize;
        let head_df = self.df.head(Some(num_rows));
        head_df.to_string()
    }

    /// Returns a string representation of the DataFrame.
    #[napi]
    pub fn to_string(&self) -> String {
        self.df.to_string()
    }

    /// Returns the dimensions of the DataFrame (rows, columns).
    #[napi(getter)]
    pub fn shape(&self) -> Vec<i64> {
        let (rows, cols) = self.df.shape();
        vec![rows as i64, cols as i64]
    }
}

/// A Series represents a single column in a DataFrame.
#[napi]
pub struct PolarsSeries {
    pub(crate) series: Series,
}

#[napi]
impl PolarsSeries {
    /// Creates a new Series of strings.
    #[napi(constructor)]
    pub fn new_str(name: String, data: Vec<String>) -> Self {
        PolarsSeries {
            series: Series::new(&name, data),
        }
    }

    /// Creates a new Series of f64 numbers.
    #[napi]
    pub fn new_f64(name: String, data: Vec<f64>) -> Self {
        PolarsSeries {
            series: Series::new(&name, data),
        }
    }

    /// Creates a new Series of i64 numbers.
    #[napi]
    pub fn new_i64(name: String, data: Vec<i64>) -> Self {
        PolarsSeries {
            series: Series::new(&name, data),
        }
    }

    /// Creates a new Series of booleans.
    #[napi]
    pub fn new_bool(name: String, data: Vec<bool>) -> Self {
        PolarsSeries {
            series: Series::new(&name, data),
        }
    }

    /// Returns the name of the Series.
    #[napi(getter)]
    pub fn name(&self) -> String {
        self.series.name().to_string()
    }

    /// Returns a string representation of the Series.
    #[napi]
    pub fn to_string(&self) -> String {
        self.series.to_string()
    }
}

// We need to implement Clone for PolarsSeries so we can use it in the DataFrame constructor.
impl Clone for PolarsSeries {
    fn clone(&self) -> Self {
        PolarsSeries {
            series: self.series.clone(),
        }
    }
}

// Alias Polars' DataFrame and Series for clarity within this module.
type PolarsDataFrame = polars::frame::DataFrame;
type PolarsSeries = self::PolarsSeries;