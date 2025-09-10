use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit};
use aes_gcm::aead::Aead;
use sha2::{Sha256, Digest};
use rand::RngCore;
use base64::{Engine as _, engine::general_purpose};

pub struct CryptoUtils;

impl CryptoUtils {
    pub fn hash_data(data: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }

    pub fn generate_key() -> Vec<u8> {
        let mut key = vec![0u8; 32];
        rand::thread_rng().fill_bytes(&mut key);
        key
    }

    pub fn encrypt_data(data: &str, key: &[u8]) -> Result<String, String> {
        let key: &aes_gcm::Key<Aes256Gcm> = key.into();
        let cipher = Aes256Gcm::new(key);
        let mut nonce_bytes = vec![0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher.encrypt(nonce, data.as_bytes())
            .map_err(|e| format!("Encryption failed: {:?}", e))?;

        let mut result = nonce_bytes;
        result.extend(ciphertext);
        Ok(general_purpose::STANDARD.encode(&result))
    }

    pub fn decrypt_data(encrypted_data: &str, key: &[u8]) -> Result<String, String> {
        let data = general_purpose::STANDARD.decode(encrypted_data)
            .map_err(|e| format!("Base64 decode failed: {:?}", e))?;

        if data.len() < 12 {
            return Err("Invalid encrypted data".to_string());
        }

        let key: &aes_gcm::Key<Aes256Gcm> = key.into();
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&data[..12]);
        let ciphertext = &data[12..];

        let plaintext = cipher.decrypt(nonce, ciphertext)
            .map_err(|e| format!("Decryption failed: {:?}", e))?;

        String::from_utf8(plaintext)
            .map_err(|e| format!("UTF-8 decode failed: {:?}", e))
    }

    pub fn generate_token() -> String {
        let mut token = vec![0u8; 32];
        rand::thread_rng().fill_bytes(&mut token);
        hex::encode(token)
    }
}
