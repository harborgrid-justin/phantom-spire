//! Memory-aligned SIMD operations for production safety
//! Prevents alignment faults and ensures optimal performance
//! Modernized for NAPI-RS v3.x and enhanced safety

use std::alloc::{alloc, dealloc, Layout};
use std::ptr::NonNull;
use std::mem::size_of;
use std::slice;
use serde::{Deserialize, Serialize};

/// Alignment requirements for different SIMD instruction sets
pub const ALIGNMENT_SSE: usize = 16;   // 128-bit
pub const ALIGNMENT_AVX: usize = 32;   // 256-bit
pub const ALIGNMENT_AVX512: usize = 64; // 512-bit

/// Maximum alignment for all SIMD instruction sets
pub const MAX_SIMD_ALIGNMENT: usize = ALIGNMENT_AVX512;

/// Memory-aligned buffer for SIMD operations
pub struct AlignedBuffer<T> {
    ptr: NonNull<T>,
    len: usize,
    capacity: usize,
    alignment: usize,
}

impl<T> AlignedBuffer<T>
where
    T: Copy + Default,
{
    /// Create a new aligned buffer with specified alignment
    pub fn new(capacity: usize, alignment: usize) -> Result<Self, AlignedMemoryError> {
        if capacity == 0 {
            return Err(AlignedMemoryError::ZeroCapacity);
        }

        if !alignment.is_power_of_two() {
            return Err(AlignedMemoryError::InvalidAlignment);
        }

        if alignment > MAX_SIMD_ALIGNMENT {
            return Err(AlignedMemoryError::UnsupportedAlignment);
        }

        let size = capacity * size_of::<T>();
        let layout = Layout::from_size_align(size, alignment)
            .map_err(|_| AlignedMemoryError::LayoutError)?;

        let ptr = unsafe {
            let raw_ptr = alloc(layout);
            if raw_ptr.is_null() {
                return Err(AlignedMemoryError::AllocationFailed);
            }
            NonNull::new_unchecked(raw_ptr as *mut T)
        };

        Ok(Self {
            ptr,
            len: 0,
            capacity,
            alignment,
        })
    }

    /// Create buffer with AVX2 alignment (256-bit)
    pub fn new_avx2(capacity: usize) -> Result<Self, AlignedMemoryError> {
        Self::new(capacity, ALIGNMENT_AVX)
    }

    /// Create buffer with SSE alignment (128-bit)
    pub fn new_sse(capacity: usize) -> Result<Self, AlignedMemoryError> {
        Self::new(capacity, ALIGNMENT_SSE)
    }

    /// Create buffer with AVX512 alignment (512-bit)
    pub fn new_avx512(capacity: usize) -> Result<Self, AlignedMemoryError> {
        Self::new(capacity, ALIGNMENT_AVX512)
    }

    /// Get raw pointer (guaranteed aligned)
    pub fn as_ptr(&self) -> *const T {
        self.ptr.as_ptr()
    }

    /// Get mutable raw pointer (guaranteed aligned)
    pub fn as_mut_ptr(&mut self) -> *mut T {
        self.ptr.as_ptr()
    }

    /// Get slice view
    pub fn as_slice(&self) -> &[T] {
        unsafe { slice::from_raw_parts(self.ptr.as_ptr(), self.len) }
    }

    /// Get mutable slice view
    pub fn as_mut_slice(&mut self) -> &mut [T] {
        unsafe { slice::from_raw_parts_mut(self.ptr.as_ptr(), self.len) }
    }

    /// Push element (resize if necessary)
    pub fn push(&mut self, value: T) -> Result<(), AlignedMemoryError> {
        if self.len >= self.capacity {
            self.resize(self.capacity * 2)?;
        }

        unsafe {
            self.ptr.as_ptr().add(self.len).write(value);
        }
        self.len += 1;
        Ok(())
    }

    /// Extend from slice with alignment check
    pub fn extend_from_slice(&mut self, slice: &[T]) -> Result<(), AlignedMemoryError> {
        let required_capacity = self.len + slice.len();
        if required_capacity > self.capacity {
            let new_capacity = required_capacity.next_power_of_two();
            self.resize(new_capacity)?;
        }

        unsafe {
            let dst = self.ptr.as_ptr().add(self.len);
            std::ptr::copy_nonoverlapping(slice.as_ptr(), dst, slice.len());
        }
        self.len += slice.len();
        Ok(())
    }

    /// Extend from iterator
    pub fn extend_from_iter<I>(&mut self, iter: I) -> Result<(), AlignedMemoryError>
    where
        I: Iterator<Item = T>,
    {
        for item in iter {
            self.push(item)?;
        }
        Ok(())
    }

    /// Resize buffer maintaining alignment
    fn resize(&mut self, new_capacity: usize) -> Result<(), AlignedMemoryError> {
        if new_capacity <= self.capacity {
            return Ok(());
        }

        let new_size = new_capacity * size_of::<T>();
        let new_layout = Layout::from_size_align(new_size, self.alignment)
            .map_err(|_| AlignedMemoryError::LayoutError)?;

        let new_ptr = unsafe {
            let raw_ptr = alloc(new_layout);
            if raw_ptr.is_null() {
                return Err(AlignedMemoryError::AllocationFailed);
            }
            NonNull::new_unchecked(raw_ptr as *mut T)
        };

        // Copy existing data
        unsafe {
            std::ptr::copy_nonoverlapping(
                self.ptr.as_ptr(),
                new_ptr.as_ptr(),
                self.len
            );

            // Deallocate old memory
            let old_size = self.capacity * size_of::<T>();
            let old_layout = Layout::from_size_align_unchecked(old_size, self.alignment);
            dealloc(self.ptr.as_ptr() as *mut u8, old_layout);
        }

        self.ptr = new_ptr;
        self.capacity = new_capacity;
        Ok(())
    }

    /// Clear buffer
    pub fn clear(&mut self) {
        self.len = 0;
    }

    /// Get length
    pub fn len(&self) -> usize {
        self.len
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.capacity
    }

    /// Get alignment
    pub fn alignment(&self) -> usize {
        self.alignment
    }

    /// Check alignment of internal pointer
    pub fn is_aligned(&self) -> bool {
        (self.ptr.as_ptr() as usize) % self.alignment == 0
    }

    /// Verify SIMD alignment
    pub fn verify_simd_alignment(&self, instruction_set: SIMDInstructionSet) -> bool {
        let required_alignment = match instruction_set {
            SIMDInstructionSet::SSE => ALIGNMENT_SSE,
            SIMDInstructionSet::AVX => ALIGNMENT_AVX,
            SIMDInstructionSet::AVX2 => ALIGNMENT_AVX,
            SIMDInstructionSet::AVX512 => ALIGNMENT_AVX512,
        };

        self.alignment >= required_alignment && self.is_aligned()
    }

    /// Get memory usage in bytes
    pub fn memory_usage(&self) -> usize {
        self.capacity * size_of::<T>()
    }

    /// Get memory efficiency (used/allocated)
    pub fn memory_efficiency(&self) -> f64 {
        if self.capacity == 0 {
            0.0
        } else {
            self.len as f64 / self.capacity as f64
        }
    }
}

impl<T> Drop for AlignedBuffer<T> {
    fn drop(&mut self) {
        unsafe {
            let size = self.capacity * size_of::<T>();
            let layout = Layout::from_size_align_unchecked(size, self.alignment);
            dealloc(self.ptr.as_ptr() as *mut u8, layout);
        }
    }
}

// AlignedBuffer is safe to send between threads
unsafe impl<T: Send> Send for AlignedBuffer<T> {}
unsafe impl<T: Sync> Sync for AlignedBuffer<T> {}

/// SIMD instruction set types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SIMDInstructionSet {
    SSE,
    AVX,
    AVX2,
    AVX512,
}

impl std::fmt::Display for SIMDInstructionSet {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SIMDInstructionSet::SSE => write!(f, "SSE"),
            SIMDInstructionSet::AVX => write!(f, "AVX"),
            SIMDInstructionSet::AVX2 => write!(f, "AVX2"),
            SIMDInstructionSet::AVX512 => write!(f, "AVX512"),
        }
    }
}

/// Aligned memory errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlignedMemoryError {
    ZeroCapacity,
    InvalidAlignment,
    UnsupportedAlignment,
    LayoutError,
    AllocationFailed,
    SizeMismatch,
}

impl std::fmt::Display for AlignedMemoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AlignedMemoryError::ZeroCapacity => write!(f, "Zero capacity not allowed"),
            AlignedMemoryError::InvalidAlignment => write!(f, "Alignment must be power of 2"),
            AlignedMemoryError::UnsupportedAlignment => write!(f, "Unsupported alignment size"),
            AlignedMemoryError::LayoutError => write!(f, "Memory layout error"),
            AlignedMemoryError::AllocationFailed => write!(f, "Memory allocation failed"),
            AlignedMemoryError::SizeMismatch => write!(f, "Vector size mismatch"),
        }
    }
}

impl std::error::Error for AlignedMemoryError {}

/// Safe SIMD operations with guaranteed alignment
pub struct SafeSIMDOperations;

impl SafeSIMDOperations {
    /// Add vectors with automatic alignment and fallback
    pub fn add_vectors_f32(
        a: &[f32],
        b: &[f32],
        result: &mut [f32],
    ) -> Result<(), AlignedMemoryError> {
        if a.len() != b.len() || a.len() != result.len() {
            return Err(AlignedMemoryError::SizeMismatch);
        }

        if a.is_empty() {
            return Ok(());
        }

        // Check alignment
        let a_aligned = Self::is_simd_aligned(a.as_ptr());
        let b_aligned = Self::is_simd_aligned(b.as_ptr());
        let result_aligned = Self::is_simd_aligned(result.as_ptr());

        if a_aligned && b_aligned && result_aligned {
            // Use optimized SIMD path
            Self::add_vectors_f32_simd_aligned(a, b, result);
        } else {
            // Use aligned buffers
            let mut a_buf = AlignedBuffer::new_avx2(a.len())?;
            let mut b_buf = AlignedBuffer::new_avx2(b.len())?;
            let mut result_buf = AlignedBuffer::new_avx2(result.len())?;

            a_buf.extend_from_slice(a)?;
            b_buf.extend_from_slice(b)?;
            result_buf.extend_from_slice(&vec![0.0f32; result.len()])?;

            Self::add_vectors_f32_simd_aligned(
                a_buf.as_slice(),
                b_buf.as_slice(),
                result_buf.as_mut_slice(),
            );

            result.copy_from_slice(result_buf.as_slice());
        }

        Ok(())
    }

    /// Multiply vectors element-wise
    pub fn multiply_vectors_f32(
        a: &[f32],
        b: &[f32],
        result: &mut [f32],
    ) -> Result<(), AlignedMemoryError> {
        if a.len() != b.len() || a.len() != result.len() {
            return Err(AlignedMemoryError::SizeMismatch);
        }

        if a.is_empty() {
            return Ok(());
        }

        // Check alignment
        let a_aligned = Self::is_simd_aligned(a.as_ptr());
        let b_aligned = Self::is_simd_aligned(b.as_ptr());
        let result_aligned = Self::is_simd_aligned(result.as_ptr());

        if a_aligned && b_aligned && result_aligned {
            Self::multiply_vectors_f32_simd_aligned(a, b, result);
        } else {
            // Use aligned buffers
            let mut a_buf = AlignedBuffer::new_avx2(a.len())?;
            let mut b_buf = AlignedBuffer::new_avx2(b.len())?;
            let mut result_buf = AlignedBuffer::new_avx2(result.len())?;

            a_buf.extend_from_slice(a)?;
            b_buf.extend_from_slice(b)?;
            result_buf.extend_from_slice(&vec![0.0f32; result.len()])?;

            Self::multiply_vectors_f32_simd_aligned(
                a_buf.as_slice(),
                b_buf.as_slice(),
                result_buf.as_mut_slice(),
            );

            result.copy_from_slice(result_buf.as_slice());
        }

        Ok(())
    }

    /// Check if pointer is aligned for SIMD operations
    fn is_simd_aligned<T>(ptr: *const T) -> bool {
        (ptr as usize) % ALIGNMENT_AVX == 0
    }

    /// SIMD vector addition (assumes aligned inputs)
    fn add_vectors_f32_simd_aligned(a: &[f32], b: &[f32], result: &mut [f32]) {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") {
                unsafe {
                    Self::add_vectors_f32_avx2(a, b, result);
                    return;
                }
            }

            if is_x86_feature_detected!("sse2") {
                unsafe {
                    Self::add_vectors_f32_sse2(a, b, result);
                    return;
                }
            }
        }

        // Fallback to scalar implementation
        for ((a_val, b_val), r) in a.iter().zip(b.iter()).zip(result.iter_mut()) {
            *r = a_val + b_val;
        }
    }

    /// SIMD vector multiplication (assumes aligned inputs)
    fn multiply_vectors_f32_simd_aligned(a: &[f32], b: &[f32], result: &mut [f32]) {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") {
                unsafe {
                    Self::multiply_vectors_f32_avx2(a, b, result);
                    return;
                }
            }

            if is_x86_feature_detected!("sse2") {
                unsafe {
                    Self::multiply_vectors_f32_sse2(a, b, result);
                    return;
                }
            }
        }

        // Fallback to scalar implementation
        for ((a_val, b_val), r) in a.iter().zip(b.iter()).zip(result.iter_mut()) {
            *r = a_val * b_val;
        }
    }

    /// AVX2 implementation with alignment verification
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "avx2")]
    unsafe fn add_vectors_f32_avx2(a: &[f32], b: &[f32], result: &mut [f32]) {
        use std::arch::x86_64::*;

        // Verify alignment at runtime in debug mode
        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_AVX, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_AVX, 0);
        debug_assert_eq!((result.as_ptr() as usize) % ALIGNMENT_AVX, 0);

        let chunks = a.len() / 8;
        for i in 0..chunks {
            let offset = i * 8;

            // Use aligned loads for better performance
            let va = _mm256_load_ps(a.as_ptr().add(offset));
            let vb = _mm256_load_ps(b.as_ptr().add(offset));
            let vr = _mm256_add_ps(va, vb);

            // Use aligned stores
            _mm256_store_ps(result.as_mut_ptr().add(offset), vr);
        }

        // Handle remaining elements
        for i in (chunks * 8)..a.len() {
            result[i] = a[i] + b[i];
        }
    }

    /// AVX2 multiplication implementation
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "avx2")]
    unsafe fn multiply_vectors_f32_avx2(a: &[f32], b: &[f32], result: &mut [f32]) {
        use std::arch::x86_64::*;

        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_AVX, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_AVX, 0);
        debug_assert_eq!((result.as_ptr() as usize) % ALIGNMENT_AVX, 0);

        let chunks = a.len() / 8;
        for i in 0..chunks {
            let offset = i * 8;

            let va = _mm256_load_ps(a.as_ptr().add(offset));
            let vb = _mm256_load_ps(b.as_ptr().add(offset));
            let vr = _mm256_mul_ps(va, vb);

            _mm256_store_ps(result.as_mut_ptr().add(offset), vr);
        }

        // Handle remaining elements
        for i in (chunks * 8)..a.len() {
            result[i] = a[i] * b[i];
        }
    }

    /// SSE2 implementation with alignment verification
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "sse2")]
    unsafe fn add_vectors_f32_sse2(a: &[f32], b: &[f32], result: &mut [f32]) {
        use std::arch::x86_64::*;

        // Verify alignment at runtime in debug mode
        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_SSE, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_SSE, 0);
        debug_assert_eq!((result.as_ptr() as usize) % ALIGNMENT_SSE, 0);

        let chunks = a.len() / 4;
        for i in 0..chunks {
            let offset = i * 4;

            // Use aligned loads
            let va = _mm_load_ps(a.as_ptr().add(offset));
            let vb = _mm_load_ps(b.as_ptr().add(offset));
            let vr = _mm_add_ps(va, vb);

            // Use aligned stores
            _mm_store_ps(result.as_mut_ptr().add(offset), vr);
        }

        // Handle remaining elements
        for i in (chunks * 4)..a.len() {
            result[i] = a[i] + b[i];
        }
    }

    /// SSE2 multiplication implementation
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "sse2")]
    unsafe fn multiply_vectors_f32_sse2(a: &[f32], b: &[f32], result: &mut [f32]) {
        use std::arch::x86_64::*;

        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_SSE, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_SSE, 0);
        debug_assert_eq!((result.as_ptr() as usize) % ALIGNMENT_SSE, 0);

        let chunks = a.len() / 4;
        for i in 0..chunks {
            let offset = i * 4;

            let va = _mm_load_ps(a.as_ptr().add(offset));
            let vb = _mm_load_ps(b.as_ptr().add(offset));
            let vr = _mm_mul_ps(va, vb);

            _mm_store_ps(result.as_mut_ptr().add(offset), vr);
        }

        // Handle remaining elements
        for i in (chunks * 4)..a.len() {
            result[i] = a[i] * b[i];
        }
    }

    /// Dot product with guaranteed alignment
    pub fn dot_product_f32(a: &[f32], b: &[f32]) -> Result<f32, AlignedMemoryError> {
        if a.len() != b.len() {
            return Err(AlignedMemoryError::SizeMismatch);
        }

        if a.is_empty() {
            return Ok(0.0);
        }

        // Check alignment
        let a_aligned = Self::is_simd_aligned(a.as_ptr());
        let b_aligned = Self::is_simd_aligned(b.as_ptr());

        if a_aligned && b_aligned {
            Ok(Self::dot_product_f32_simd_aligned(a, b))
        } else {
            // Use aligned buffers
            let mut a_buf = AlignedBuffer::new_avx2(a.len())?;
            let mut b_buf = AlignedBuffer::new_avx2(b.len())?;

            a_buf.extend_from_slice(a)?;
            b_buf.extend_from_slice(b)?;

            Ok(Self::dot_product_f32_simd_aligned(a_buf.as_slice(), b_buf.as_slice()))
        }
    }

    /// SIMD dot product (assumes aligned inputs)
    fn dot_product_f32_simd_aligned(a: &[f32], b: &[f32]) -> f32 {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") {
                return unsafe { Self::dot_product_f32_avx2(a, b) };
            }

            if is_x86_feature_detected!("sse2") {
                return unsafe { Self::dot_product_f32_sse2(a, b) };
            }
        }

        // Fallback
        a.iter().zip(b.iter()).map(|(a_val, b_val)| a_val * b_val).sum()
    }

    /// AVX2 dot product with alignment verification
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "avx2")]
    unsafe fn dot_product_f32_avx2(a: &[f32], b: &[f32]) -> f32 {
        use std::arch::x86_64::*;

        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_AVX, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_AVX, 0);

        let mut sum = _mm256_setzero_ps();
        let chunks = a.len() / 8;

        for i in 0..chunks {
            let offset = i * 8;
            let va = _mm256_load_ps(a.as_ptr().add(offset));
            let vb = _mm256_load_ps(b.as_ptr().add(offset));
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

    /// SSE2 dot product with alignment verification
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "sse2")]
    unsafe fn dot_product_f32_sse2(a: &[f32], b: &[f32]) -> f32 {
        use std::arch::x86_64::*;

        debug_assert_eq!((a.as_ptr() as usize) % ALIGNMENT_SSE, 0);
        debug_assert_eq!((b.as_ptr() as usize) % ALIGNMENT_SSE, 0);

        let mut sum = _mm_setzero_ps();
        let chunks = a.len() / 4;

        for i in 0..chunks {
            let offset = i * 4;
            let va = _mm_load_ps(a.as_ptr().add(offset));
            let vb = _mm_load_ps(b.as_ptr().add(offset));
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

    /// Detect available SIMD instruction sets
    pub fn detect_simd_support() -> Vec<SIMDInstructionSet> {
        let mut supported = Vec::new();

        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("sse2") {
                supported.push(SIMDInstructionSet::SSE);
            }
            if is_x86_feature_detected!("avx") {
                supported.push(SIMDInstructionSet::AVX);
            }
            if is_x86_feature_detected!("avx2") {
                supported.push(SIMDInstructionSet::AVX2);
            }
            if is_x86_feature_detected!("avx512f") {
                supported.push(SIMDInstructionSet::AVX512);
            }
        }

        supported
    }
}

/// Memory pool for aligned buffers to reduce allocations
pub struct AlignedBufferPool<T> {
    pool: std::sync::Mutex<Vec<AlignedBuffer<T>>>,
    max_size: usize,
    alignment: usize,
    hits: std::sync::atomic::AtomicU64,
    misses: std::sync::atomic::AtomicU64,
}

impl<T: Copy + Default> AlignedBufferPool<T> {
    pub fn new(max_size: usize, alignment: usize) -> Self {
        Self {
            pool: std::sync::Mutex::new(Vec::new()),
            max_size,
            alignment,
            hits: std::sync::atomic::AtomicU64::new(0),
            misses: std::sync::atomic::AtomicU64::new(0),
        }
    }

    /// Get buffer from pool or create new one
    pub fn get(&self, capacity: usize) -> Result<AlignedBuffer<T>, AlignedMemoryError> {
        let mut pool = self.pool.lock().unwrap();

        // Try to find suitable buffer
        for i in 0..pool.len() {
            if pool[i].capacity() >= capacity {
                let mut buffer = pool.swap_remove(i);
                buffer.clear();
                self.hits.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                return Ok(buffer);
            }
        }

        // Create new buffer
        self.misses.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        AlignedBuffer::new(capacity, self.alignment)
    }

    /// Return buffer to pool
    pub fn return_buffer(&self, buffer: AlignedBuffer<T>) {
        let mut pool = self.pool.lock().unwrap();
        if pool.len() < self.max_size {
            pool.push(buffer);
        }
        // Buffer is dropped if pool is full
    }

    /// Get pool statistics
    pub fn stats(&self) -> PoolStats {
        let pool = self.pool.lock().unwrap();
        PoolStats {
            pool_size: pool.len(),
            max_size: self.max_size,
            hits: self.hits.load(std::sync::atomic::Ordering::Relaxed),
            misses: self.misses.load(std::sync::atomic::Ordering::Relaxed),
        }
    }
}

/// Pool statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoolStats {
    pub pool_size: usize,
    pub max_size: usize,
    pub hits: u64,
    pub misses: u64,
}

impl PoolStats {
    pub fn hit_rate(&self) -> f64 {
        let total = self.hits + self.misses;
        if total == 0 {
            0.0
        } else {
            self.hits as f64 / total as f64
        }
    }
}

/// Memory alignment utilities
pub struct AlignmentUtils;

impl AlignmentUtils {
    /// Check if a pointer is aligned to a specific boundary
    pub fn is_aligned<T>(ptr: *const T, alignment: usize) -> bool {
        (ptr as usize) % alignment == 0
    }

    /// Get the next aligned address
    pub fn next_aligned_address(addr: usize, alignment: usize) -> usize {
        (addr + alignment - 1) & !(alignment - 1)
    }

    /// Calculate padding needed for alignment
    pub fn alignment_padding(addr: usize, alignment: usize) -> usize {
        let next = Self::next_aligned_address(addr, alignment);
        next - addr
    }

    /// Get optimal alignment for SIMD operations
    pub fn optimal_simd_alignment() -> usize {
        let supported = SafeSIMDOperations::detect_simd_support();
        
        if supported.contains(&SIMDInstructionSet::AVX512) {
            ALIGNMENT_AVX512
        } else if supported.contains(&SIMDInstructionSet::AVX2) || supported.contains(&SIMDInstructionSet::AVX) {
            ALIGNMENT_AVX
        } else if supported.contains(&SIMDInstructionSet::SSE) {
            ALIGNMENT_SSE
        } else {
            8 // Default alignment
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_aligned_buffer_creation() {
        let buffer = AlignedBuffer::<f32>::new_avx2(1024).unwrap();
        assert!(buffer.is_aligned());
        assert!(buffer.verify_simd_alignment(SIMDInstructionSet::AVX2));
        assert_eq!(buffer.capacity(), 1024);
        assert_eq!(buffer.len(), 0);
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_aligned_buffer_operations() {
        let mut buffer = AlignedBuffer::<f32>::new_avx2(10).unwrap();
        
        // Test push
        buffer.push(1.0).unwrap();
        buffer.push(2.0).unwrap();
        assert_eq!(buffer.len(), 2);
        
        // Test extend
        buffer.extend_from_slice(&[3.0, 4.0, 5.0]).unwrap();
        assert_eq!(buffer.len(), 5);
        
        // Test clear
        buffer.clear();
        assert_eq!(buffer.len(), 0);
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_simd_operations() {
        let a = vec![1.0f32; 1024];
        let b = vec![2.0f32; 1024];
        let mut result = vec![0.0f32; 1024];

        SafeSIMDOperations::add_vectors_f32(&a, &b, &mut result).unwrap();

        for &val in &result {
            assert_eq!(val, 3.0);
        }
    }

    #[test]
    fn test_dot_product() {
        let a = vec![2.0f32; 100];
        let b = vec![3.0f32; 100];

        let result = SafeSIMDOperations::dot_product_f32(&a, &b).unwrap();
        assert_eq!(result, 600.0); // 2.0 * 3.0 * 100
    }

    #[test]
    fn test_multiply_vectors() {
        let a = vec![2.0f32; 10];
        let b = vec![3.0f32; 10];
        let mut result = vec![0.0f32; 10];

        SafeSIMDOperations::multiply_vectors_f32(&a, &b, &mut result).unwrap();

        for &val in &result {
            assert_eq!(val, 6.0);
        }
    }

    #[test]
    fn test_buffer_pool() {
        let pool = AlignedBufferPool::<f32>::new(5, ALIGNMENT_AVX);
        
        // Get a buffer
        let buffer1 = pool.get(100).unwrap();
        assert_eq!(buffer1.capacity(), 100);
        
        // Return it to pool
        pool.return_buffer(buffer1);
        
        // Get it back (should be a cache hit)
        let buffer2 = pool.get(50).unwrap();
        assert!(buffer2.capacity() >= 50);
        
        let stats = pool.stats();
        assert_eq!(stats.hits, 1);
        assert_eq!(stats.misses, 1);
    }

    #[test]
    fn test_simd_detection() {
        let supported = SafeSIMDOperations::detect_simd_support();
        // At least SSE should be supported on x86_64
        #[cfg(target_arch = "x86_64")]
        assert!(!supported.is_empty());
    }

    #[test]
    fn test_alignment_utils() {
        assert!(AlignmentUtils::is_aligned(0 as *const u8, 8));
        assert!(!AlignmentUtils::is_aligned(1 as *const u8, 8));
        
        assert_eq!(AlignmentUtils::next_aligned_address(1, 8), 8);
        assert_eq!(AlignmentUtils::next_aligned_address(8, 8), 8);
        
        assert_eq!(AlignmentUtils::alignment_padding(1, 8), 7);
        assert_eq!(AlignmentUtils::alignment_padding(8, 8), 0);
    }
}

/// Module for accessing aligned SIMD operations
pub mod simd {
    pub use super::{
        SafeSIMDOperations, SIMDInstructionSet, AlignedBuffer, AlignedMemoryError,
        ALIGNMENT_SSE, ALIGNMENT_AVX, ALIGNMENT_AVX512
    };
}