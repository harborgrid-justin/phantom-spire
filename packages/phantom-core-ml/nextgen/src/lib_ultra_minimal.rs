//! Ultra minimal NAPI module - just exports
#![deny(clippy::all)]

use napi_derive::napi;

#[napi]
pub fn hello() -> &'static str {
    "hello"
}