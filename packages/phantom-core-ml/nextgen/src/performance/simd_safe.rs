//! Runtime-safe SIMD operations with feature detection
//! Prevents crashes on unsupported hardware

use std::sync::Once;
use std::sync::atomic::{AtomicBool, Ordering};

static INIT: Once = Once::new();
static HAS_AVX2: AtomicBool = AtomicBool::new(false);
static HAS_SSE2: AtomicBool = AtomicBool::new(false);

/// Initialize SIMD feature detection
pub fn init_simd_features() {
    INIT.call_once(|| {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") {
                HAS_AVX2.store(true, Ordering::Relaxed);
            }
            if is_x86_feature_detected!("sse2") {
                HAS_SSE2.store(true, Ordering::Relaxed);
            }
        }
    });
}

/// Safe vector addition with runtime SIMD detection
pub fn add_vectors_f32_safe(a: &[f32], b: &[f32], result: &mut [f32]) {
    assert_eq!(a.len(), b.len());
    assert_eq!(a.len(), result.len());

    init_simd_features();

    #[cfg(target_arch = "x86_64")]
    {
        if HAS_AVX2.load(Ordering::Relaxed) {
            unsafe { add_vectors_f32_avx2(a, b, result) };
            return;
        }

        if HAS_SSE2.load(Ordering::Relaxed) {
            unsafe { add_vectors_f32_sse2(a, b, result) };
            return;
        }
    }

    // Fallback to scalar implementation
    add_vectors_f32_scalar(a, b, result);
}

/// Safe dot product with runtime SIMD detection
pub fn dot_product_f32_safe(a: &[f32], b: &[f32]) -> f32 {
    assert_eq!(a.len(), b.len());

    init_simd_features();

    #[cfg(target_arch = "x86_64")]
    {
        if HAS_AVX2.load(Ordering::Relaxed) {
            return unsafe { dot_product_f32_avx2(a, b) };
        }

        if HAS_SSE2.load(Ordering::Relaxed) {
            return unsafe { dot_product_f32_sse2(a, b) };
        }
    }

    // Fallback to scalar implementation
    dot_product_f32_scalar(a, b)
}

/// Scalar fallback implementation
fn add_vectors_f32_scalar(a: &[f32], b: &[f32], result: &mut [f32]) {
    for ((a_val, b_val), r) in a.iter().zip(b.iter()).zip(result.iter_mut()) {
        *r = a_val + b_val;
    }
}

/// Scalar fallback implementation
fn dot_product_f32_scalar(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b.iter()).map(|(a_val, b_val)| a_val * b_val).sum()
}

#[cfg(target_arch = "x86_64")]
use std::arch::x86_64::*;

/// AVX2 implementation (only called if feature is detected)
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "avx2")]
unsafe fn add_vectors_f32_avx2(a: &[f32], b: &[f32], result: &mut [f32]) {
    let chunks = a.len() / 8;
    for i in 0..chunks {
        let offset = i * 8;
        let va = _mm256_loadu_ps(a.as_ptr().add(offset));
        let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
        let vr = _mm256_add_ps(va, vb);
        _mm256_storeu_ps(result.as_mut_ptr().add(offset), vr);
    }

    // Handle remaining elements
    for i in (chunks * 8)..a.len() {
        result[i] = a[i] + b[i];
    }
}

/// SSE2 implementation (broader compatibility)
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "sse2")]
unsafe fn add_vectors_f32_sse2(a: &[f32], b: &[f32], result: &mut [f32]) {
    let chunks = a.len() / 4;
    for i in 0..chunks {
        let offset = i * 4;
        let va = _mm_loadu_ps(a.as_ptr().add(offset));
        let vb = _mm_loadu_ps(b.as_ptr().add(offset));
        let vr = _mm_add_ps(va, vb);
        _mm_storeu_ps(result.as_mut_ptr().add(offset), vr);
    }

    // Handle remaining elements
    for i in (chunks * 4)..a.len() {
        result[i] = a[i] + b[i];
    }
}

/// AVX2 dot product implementation
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "avx2")]
unsafe fn dot_product_f32_avx2(a: &[f32], b: &[f32]) -> f32 {
    let mut sum = _mm256_setzero_ps();
    let chunks = a.len() / 8;

    for i in 0..chunks {
        let offset = i * 8;
        let va = _mm256_loadu_ps(a.as_ptr().add(offset));
        let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
        let prod = _mm256_mul_ps(va, vb);
        sum = _mm256_add_ps(sum, prod);
    }

    // Horizontal sum
    let sum_high = _mm256_extractf128_ps(sum, 1);
    let sum_low = _mm256_castps256_ps128(sum);
    let sum128 = _mm_add_ps(sum_high, sum_low);
    let sum64 = _mm_add_ps(sum128, _mm_movehl_ps(sum128, sum128));
    let sum32 = _mm_add_ss(sum64, _mm_shuffle_ps(sum64, sum64, 0x55));

    let mut result = _mm_cvtss_f32(sum32);

    // Handle remaining elements
    for i in (chunks * 8)..a.len() {
        result += a[i] * b[i];
    }

    result
}

/// SSE2 dot product implementation
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "sse2")]
unsafe fn dot_product_f32_sse2(a: &[f32], b: &[f32]) -> f32 {
    let mut sum = _mm_setzero_ps();
    let chunks = a.len() / 4;

    for i in 0..chunks {
        let offset = i * 4;
        let va = _mm_loadu_ps(a.as_ptr().add(offset));
        let vb = _mm_loadu_ps(b.as_ptr().add(offset));
        let prod = _mm_mul_ps(va, vb);
        sum = _mm_add_ps(sum, prod);
    }

    // Horizontal sum
    let sum64 = _mm_add_ps(sum, _mm_movehl_ps(sum, sum));
    let sum32 = _mm_add_ss(sum64, _mm_shuffle_ps(sum64, sum64, 0x55));

    let mut result = _mm_cvtss_f32(sum32);

    // Handle remaining elements
    for i in (chunks * 4)..a.len() {
        result += a[i] * b[i];
    }

    result
}