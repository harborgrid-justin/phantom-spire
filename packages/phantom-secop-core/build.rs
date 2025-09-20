fn main() {
    #[cfg(feature = "napi")]
    {
        if let Err(_e) = std::panic::catch_unwind(|| {
            napi_build::setup();
        }) {
            println!("cargo:warning=NAPI build setup failed, continuing without native module");
        }
    }
}