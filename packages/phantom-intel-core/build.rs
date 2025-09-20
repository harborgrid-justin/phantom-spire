fn main() {
    #[cfg(feature = "napi")]
    {
        // Try to setup NAPI build, but don't fail if it doesn't work
        if let Err(_e) = std::panic::catch_unwind(|| {
            napi_build::setup();
        }) {
            println!("cargo:warning=NAPI build setup failed, continuing without native module");
        }
    }
}