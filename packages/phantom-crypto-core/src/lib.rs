//! Phantom Crypto Core - Advanced Cryptographic Security Engine
//!
//! This crate provides enterprise-grade cryptographic capabilities:
//! - Ultra-secure Argon2 password hashing with optimized parameters
//! - High-performance JWT processing for authentication systems
//! - ChaCha20 cryptographically secure random number generation
//! - Advanced key exchange and digital signatures
//! - Designed to outperform Anomali's security capabilities

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};
use once_cell::sync::Lazy;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use rand_chacha::{ChaCha20Rng, rand_core::SeedableRng};
use rand::RngCore;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use sha2::{Sha256, Digest};
use hmac::{Hmac, Mac};
use aes_gcm::{Aes256Gcm, Key, Nonce, aead::{Aead, KeyInit}};
use x25519_dalek::{EphemeralSecret, PublicKey as X25519PublicKey};
use ed25519_dalek::{Keypair, Signature, Signer, Verifier};

/// Global ChaCha20 RNG for cryptographically secure random generation
static SECURE_RNG: Lazy<std::sync::Mutex<ChaCha20Rng>> = Lazy::new(|| {
    std::sync::Mutex::new(ChaCha20Rng::from_entropy())
});

/// Advanced cryptographic processor
#[derive(Debug)]
pub struct CryptoCore {
    pub jwt_secret: Vec<u8>,
    pub argon2_params: Argon2<'static>,
    pub session_store: HashMap<String, SessionInfo>,
    pub key_pairs: HashMap<String, CryptoKeyPair>,
    pub performance_metrics: CryptoMetrics,
}

/// JWT claims structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,        // Subject (user ID)
    pub exp: i64,           // Expiration time
    pub iat: i64,           // Issued at
    pub iss: String,        // Issuer
    pub aud: String,        // Audience
    pub jti: String,        // JWT ID
    pub role: String,       // User role
    pub permissions: Vec<String>, // User permissions
    pub session_id: String, // Session identifier
    pub security_level: u8, // Security clearance level
}

/// Session information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub session_id: String,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub ip_address: String,
    pub user_agent: String,
    pub security_level: u8,
    pub is_active: bool,
}

/// Cryptographic key pair
#[derive(Debug, Clone)]
pub struct CryptoKeyPair {
    pub key_id: String,
    pub key_type: KeyType,
    pub created_at: DateTime<Utc>,
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>, // Should be encrypted in production
    pub expires_at: Option<DateTime<Utc>>,
}

/// Supported key types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyType {
    Ed25519,    // Digital signatures
    X25519,     // Key exchange
    AES256,     // Symmetric encryption
}

/// Password hashing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordHashResult {
    pub hash: String,
    pub salt: String,
    pub algorithm: String,
    pub params: String,
    pub created_at: DateTime<Utc>,
}

/// JWT processing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtResult {
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub token_type: String,
}

/// Encryption result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionResult {
    pub ciphertext: String, // Base64 encoded
    pub nonce: String,      // Base64 encoded
    pub tag: String,        // Base64 encoded (for AES-GCM)
    pub algorithm: String,
    pub key_id: String,
}

/// Performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoMetrics {
    pub passwords_hashed: u64,
    pub passwords_verified: u64,
    pub jwts_created: u64,
    pub jwts_verified: u64,
    pub keys_generated: u64,
    pub encryptions_performed: u64,
    pub decryptions_performed: u64,
    pub signatures_created: u64,
    pub signatures_verified: u64,
    pub average_hash_time_ms: f64,
    pub average_jwt_time_ms: f64,
    pub last_updated: DateTime<Utc>,
}

impl CryptoCore {
    /// Create a new CryptoCore with secure defaults
    pub fn new() -> Result<Self, String> {
        // Generate secure JWT secret
        let jwt_secret = Self::generate_secure_bytes(64)?;

        // Configure Argon2 with optimal parameters for security vs performance
        let argon2_params = Argon2::new(
            argon2::Algorithm::Argon2id,
            argon2::Version::V0x13,
            argon2::Params::new(65536, 3, 4, Some(32))  // 64MB memory, 3 iterations, 4 threads, 32 byte output
                .map_err(|e| format!("Failed to create Argon2 params: {}", e))?,
        );

        Ok(Self {
            jwt_secret,
            argon2_params,
            session_store: HashMap::new(),
            key_pairs: HashMap::new(),
            performance_metrics: CryptoMetrics {
                passwords_hashed: 0,
                passwords_verified: 0,
                jwts_created: 0,
                jwts_verified: 0,
                keys_generated: 0,
                encryptions_performed: 0,
                decryptions_performed: 0,
                signatures_created: 0,
                signatures_verified: 0,
                average_hash_time_ms: 0.0,
                average_jwt_time_ms: 0.0,
                last_updated: Utc::now(),
            },
        })
    }

    /// Generate cryptographically secure random bytes using ChaCha20
    pub fn generate_secure_bytes(length: usize) -> Result<Vec<u8>, String> {
        let mut rng = SECURE_RNG.lock()
            .map_err(|e| format!("Failed to acquire RNG lock: {}", e))?;

        let mut bytes = vec![0u8; length];
        rng.fill_bytes(&mut bytes);
        Ok(bytes)
    }

    /// Hash password using Argon2id with optimal security parameters
    pub fn hash_password(&mut self, password: &str) -> Result<PasswordHashResult, String> {
        let start_time = std::time::Instant::now();

        // Generate cryptographically secure salt
        let salt = SaltString::generate(&mut OsRng);

        // Hash the password
        let password_hash = self.argon2_params.hash_password(password.as_bytes(), &salt)
            .map_err(|e| format!("Password hashing failed: {}", e))?;

        let processing_time = start_time.elapsed();
        self.update_hash_time(processing_time.as_millis() as f64);
        self.performance_metrics.passwords_hashed += 1;

        Ok(PasswordHashResult {
            hash: password_hash.to_string(),
            salt: salt.to_string(),
            algorithm: "Argon2id".to_string(),
            params: "m=65536,t=3,p=4".to_string(),
            created_at: Utc::now(),
        })
    }

    /// Verify password against Argon2id hash
    pub fn verify_password(&mut self, password: &str, hash: &str) -> Result<bool, String> {
        let start_time = std::time::Instant::now();

        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| format!("Invalid hash format: {}", e))?;

        let is_valid = self.argon2_params.verify_password(password.as_bytes(), &parsed_hash).is_ok();

        let processing_time = start_time.elapsed();
        self.update_hash_time(processing_time.as_millis() as f64);
        self.performance_metrics.passwords_verified += 1;

        Ok(is_valid)
    }

    /// Create JWT token with advanced security features
    pub fn create_jwt_token(&mut self, claims: JwtClaims) -> Result<JwtResult, String> {
        let start_time = std::time::Instant::now();

        // Set up JWT header with secure algorithm
        let header = Header::new(Algorithm::HS256);

        // Create encoding key from JWT secret
        let encoding_key = EncodingKey::from_secret(&self.jwt_secret);

        // Encode the JWT
        let token = encode(&header, &claims, &encoding_key)
            .map_err(|e| format!("JWT encoding failed: {}", e))?;

        let processing_time = start_time.elapsed();
        self.update_jwt_time(processing_time.as_millis() as f64);
        self.performance_metrics.jwts_created += 1;

        Ok(JwtResult {
            token,
            expires_at: DateTime::from_timestamp(claims.exp, 0)
                .unwrap_or_else(|| Utc::now() + Duration::hours(1)),
            token_type: "Bearer".to_string(),
        })
    }

    /// Verify and decode JWT token
    pub fn verify_jwt_token(&mut self, token: &str) -> Result<JwtClaims, String> {
        let start_time = std::time::Instant::now();

        // Create decoding key from JWT secret
        let decoding_key = DecodingKey::from_secret(&self.jwt_secret);

        // Set up validation parameters
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        validation.validate_nbf = true;

        // Decode and verify the JWT
        let token_data = decode::<JwtClaims>(token, &decoding_key, &validation)
            .map_err(|e| format!("JWT verification failed: {}", e))?;

        let processing_time = start_time.elapsed();
        self.update_jwt_time(processing_time.as_millis() as f64);
        self.performance_metrics.jwts_verified += 1;

        Ok(token_data.claims)
    }

    /// Generate Ed25519 key pair for digital signatures
    pub fn generate_ed25519_keypair(&mut self, key_id: String) -> Result<String, String> {
        let mut rng = SECURE_RNG.lock()
            .map_err(|e| format!("Failed to acquire RNG: {}", e))?;

        let keypair = Keypair::generate(&mut *rng);

        let crypto_keypair = CryptoKeyPair {
            key_id: key_id.clone(),
            key_type: KeyType::Ed25519,
            created_at: Utc::now(),
            public_key: keypair.public.to_bytes().to_vec(),
            private_key: keypair.secret.to_bytes().to_vec(),
            expires_at: Some(Utc::now() + Duration::days(365)), // 1 year expiry
        };

        self.key_pairs.insert(key_id.clone(), crypto_keypair);
        self.performance_metrics.keys_generated += 1;

        Ok(key_id)
    }

    /// Generate X25519 key pair for key exchange
    pub fn generate_x25519_keypair(&mut self, key_id: String) -> Result<String, String> {
        let mut rng = SECURE_RNG.lock()
            .map_err(|e| format!("Failed to acquire RNG: {}", e))?;

        let secret = EphemeralSecret::new(&mut *rng);
        let public = X25519PublicKey::from(&secret);

        let crypto_keypair = CryptoKeyPair {
            key_id: key_id.clone(),
            key_type: KeyType::X25519,
            created_at: Utc::now(),
            public_key: public.to_bytes().to_vec(),
            private_key: secret.to_bytes().to_vec(),
            expires_at: Some(Utc::now() + Duration::days(30)), // 30 day expiry for ephemeral keys
        };

        self.key_pairs.insert(key_id.clone(), crypto_keypair);
        self.performance_metrics.keys_generated += 1;

        Ok(key_id)
    }

    /// Create digital signature using Ed25519
    pub fn create_signature(&mut self, key_id: &str, message: &[u8]) -> Result<String, String> {
        let keypair = self.key_pairs.get(key_id)
            .ok_or_else(|| format!("Key {} not found", key_id))?;

        if !matches!(keypair.key_type, KeyType::Ed25519) {
            return Err("Key is not Ed25519 type".to_string());
        }

        // Reconstruct the keypair
        let secret_key = ed25519_dalek::SecretKey::from_bytes(&keypair.private_key)
            .map_err(|e| format!("Invalid private key: {}", e))?;
        let public_key = ed25519_dalek::PublicKey::from_bytes(&keypair.public_key)
            .map_err(|e| format!("Invalid public key: {}", e))?;
        let signing_keypair = Keypair { secret: secret_key, public: public_key };

        // Create signature
        let signature = signing_keypair.sign(message);

        self.performance_metrics.signatures_created += 1;

        Ok(BASE64.encode(signature.to_bytes()))
    }

    /// Verify digital signature using Ed25519
    pub fn verify_signature(&mut self, key_id: &str, message: &[u8], signature_b64: &str) -> Result<bool, String> {
        let keypair = self.key_pairs.get(key_id)
            .ok_or_else(|| format!("Key {} not found", key_id))?;

        if !matches!(keypair.key_type, KeyType::Ed25519) {
            return Err("Key is not Ed25519 type".to_string());
        }

        // Decode signature
        let signature_bytes = BASE64.decode(signature_b64)
            .map_err(|e| format!("Invalid signature encoding: {}", e))?;
        let signature = Signature::from_bytes(&signature_bytes)
            .map_err(|e| format!("Invalid signature format: {}", e))?;

        // Reconstruct public key
        let public_key = ed25519_dalek::PublicKey::from_bytes(&keypair.public_key)
            .map_err(|e| format!("Invalid public key: {}", e))?;

        // Verify signature
        let is_valid = public_key.verify(message, &signature).is_ok();

        self.performance_metrics.signatures_verified += 1;

        Ok(is_valid)
    }

    /// Encrypt data using AES-256-GCM
    pub fn encrypt_data(&mut self, key_id: &str, plaintext: &[u8]) -> Result<EncryptionResult, String> {
        let key_material = Self::generate_secure_bytes(32)?; // 256-bit key
        let key = Key::<Aes256Gcm>::from_slice(&key_material);
        let cipher = Aes256Gcm::new(key);

        // Generate random nonce
        let nonce_bytes = Self::generate_secure_bytes(12)?; // 96-bit nonce for GCM
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt the data
        let ciphertext = cipher.encrypt(nonce, plaintext)
            .map_err(|e| format!("Encryption failed: {}", e))?;

        self.performance_metrics.encryptions_performed += 1;

        Ok(EncryptionResult {
            ciphertext: BASE64.encode(&ciphertext),
            nonce: BASE64.encode(&nonce_bytes),
            tag: "integrated".to_string(), // GCM integrates authentication tag
            algorithm: "AES-256-GCM".to_string(),
            key_id: key_id.to_string(),
        })
    }

    /// Create session with enhanced security
    pub fn create_session(&mut self, user_id: String, ip_address: String, user_agent: String, security_level: u8) -> Result<SessionInfo, String> {
        let session_id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();

        let session = SessionInfo {
            session_id: session_id.clone(),
            user_id,
            created_at: now,
            expires_at: now + Duration::hours(8), // 8 hour session
            last_activity: now,
            ip_address,
            user_agent,
            security_level,
            is_active: true,
        };

        self.session_store.insert(session_id, session.clone());

        Ok(session)
    }

    /// Generate secure random token
    pub fn generate_secure_token(&self, length: usize) -> Result<String, String> {
        let bytes = Self::generate_secure_bytes(length)?;
        Ok(BASE64.encode(&bytes))
    }

    /// Update hash timing metrics
    fn update_hash_time(&mut self, time_ms: f64) {
        let current_avg = self.performance_metrics.average_hash_time_ms;
        let count = self.performance_metrics.passwords_hashed + self.performance_metrics.passwords_verified;
        
        if count > 1 {
            self.performance_metrics.average_hash_time_ms = (current_avg * 0.9) + (time_ms * 0.1);
        } else {
            self.performance_metrics.average_hash_time_ms = time_ms;
        }
    }

    /// Update JWT timing metrics
    fn update_jwt_time(&mut self, time_ms: f64) {
        let current_avg = self.performance_metrics.average_jwt_time_ms;
        let count = self.performance_metrics.jwts_created + self.performance_metrics.jwts_verified;
        
        if count > 1 {
            self.performance_metrics.average_jwt_time_ms = (current_avg * 0.9) + (time_ms * 0.1);
        } else {
            self.performance_metrics.average_jwt_time_ms = time_ms;
        }
        
        self.performance_metrics.last_updated = Utc::now();
    }

    /// Get performance metrics
    pub fn get_metrics(&self) -> &CryptoMetrics {
        &self.performance_metrics
    }
}

impl Default for CryptoCore {
    fn default() -> Self {
        Self::new().expect("Failed to create default CryptoCore")
    }
}

// NAPI bindings for JavaScript
#[napi]
pub struct CryptoCoreNapi {
    inner: CryptoCore,
}

#[napi]
impl CryptoCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let inner = CryptoCore::new()
            .map_err(|e| napi::Error::from_reason(e))?;
        Ok(Self { inner })
    }

    #[napi]
    pub fn hash_password(&mut self, password: String) -> Result<String> {
        let result = self.inner.hash_password(&password)
            .map_err(|e| napi::Error::from_reason(e))?;
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn verify_password(&mut self, password: String, hash: String) -> Result<bool> {
        self.inner.verify_password(&password, &hash)
            .map_err(|e| napi::Error::from_reason(e))
    }

    #[napi]
    pub fn create_jwt_token(&mut self, claims_json: String) -> Result<String> {
        let claims: JwtClaims = serde_json::from_str(&claims_json)
            .map_err(|e| napi::Error::from_reason(format!("Invalid claims: {}", e)))?;
        
        let result = self.inner.create_jwt_token(claims)
            .map_err(|e| napi::Error::from_reason(e))?;
        
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn verify_jwt_token(&mut self, token: String) -> Result<String> {
        let claims = self.inner.verify_jwt_token(&token)
            .map_err(|e| napi::Error::from_reason(e))?;
        
        serde_json::to_string(&claims)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }

    #[napi]
    pub fn generate_ed25519_keypair(&mut self, key_id: String) -> Result<String> {
        self.inner.generate_ed25519_keypair(key_id)
            .map_err(|e| napi::Error::from_reason(e))
    }

    #[napi]
    pub fn create_signature(&mut self, key_id: String, message: Buffer) -> Result<String> {
        self.inner.create_signature(&key_id, message.as_ref())
            .map_err(|e| napi::Error::from_reason(e))
    }

    #[napi]
    pub fn verify_signature(&mut self, key_id: String, message: Buffer, signature: String) -> Result<bool> {
        self.inner.verify_signature(&key_id, message.as_ref(), &signature)
            .map_err(|e| napi::Error::from_reason(e))
    }

    #[napi]
    pub fn generate_secure_token(&self, length: u32) -> Result<String> {
        self.inner.generate_secure_token(length as usize)
            .map_err(|e| napi::Error::from_reason(e))
    }

    #[napi]
    pub fn get_metrics(&self) -> Result<String> {
        let metrics = self.inner.get_metrics();
        serde_json::to_string(metrics)
            .map_err(|e| napi::Error::from_reason(format!("Serialization error: {}", e)))
    }
}