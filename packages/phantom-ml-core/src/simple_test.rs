use napi::bindgen_prelude::*;

#[napi]
pub fn hello() -> Result<String> {
    Ok("Hello from Phantom ML Core!".to_string())
}

#[napi]
pub fn get_system_health() -> Result<String> {
    let response = serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "version": "1.0.1",
        "platform": "windows-msvc"
    });
    Ok(response.to_string())
}