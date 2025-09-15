extern crate napi_build;

use std::env;
use std::path::PathBuf;

fn main() {
    // Standard NAPI-RS setup
    napi_build::setup();

    // Advanced build optimizations
    configure_build_optimizations();

    // Set up conditional compilation flags
    configure_feature_flags();

    // Configure linking and dependencies
    configure_linking();

    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=Cargo.toml");
    println!("cargo:rerun-if-changed=src/");
}

fn configure_build_optimizations() {
    // Enable link-time optimization for release builds
    if env::var("PROFILE").unwrap_or_default() == "release" {
        println!("cargo:rustc-link-arg=-s"); // Strip symbols

        // Platform-specific optimizations
        #[cfg(target_os = "windows")]
        {
            println!("cargo:rustc-link-arg=/OPT:REF");
            println!("cargo:rustc-link-arg=/OPT:ICF");
        }

        #[cfg(target_os = "linux")]
        {
            println!("cargo:rustc-link-arg=-Wl,--gc-sections");
            println!("cargo:rustc-link-arg=-Wl,--strip-all");
        }

        #[cfg(target_os = "macos")]
        {
            println!("cargo:rustc-link-arg=-Wl,-dead_strip");
            println!("cargo:rustc-link-arg=-Wl,-x");
        }
    }
}

fn configure_feature_flags() {
    // Set build-time feature flags based on environment
    if env::var("CARGO_FEATURE_ENTERPRISE").is_ok() {
        println!("cargo:rustc-cfg=enterprise_build");
    }

    if env::var("CARGO_FEATURE_NAPI_OPTIMIZED").is_ok() {
        println!("cargo:rustc-cfg=napi_optimized");
    }

    // Performance-specific flags
    if env::var("CARGO_FEATURE_SIMD").is_ok() {
        println!("cargo:rustc-cfg=use_simd");
    }
}

fn configure_linking() {
    // Configure math libraries for ML operations
    configure_math_libraries();
}

fn configure_math_libraries() {
    // Intel MKL support
    if env::var("MKLROOT").is_ok() {
        println!("cargo:rustc-link-search=native={}/lib", env::var("MKLROOT").unwrap());
        println!("cargo:rustc-link-lib=mkl_rt");
        println!("cargo:rustc-cfg=has_mkl");
    }
}
