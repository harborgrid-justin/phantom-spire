pub const EVENT_PROP_TIMESTAMP: &str = "timestamp";
pub const EVENT_PROP_USER_ID: &str = "user_id";
pub const EVENT_PROP_SESSION_ID: &str = "session_id";
pub const EVENT_PROP_PAGE_URL: &str = "page_url";
pub const EVENT_PROP_REFERRER: &str = "referrer";
pub const EVENT_PROP_DURATION: &str = "duration";

pub const CUSTOM_EVENT_SIGNUP: &str = "user_signup";
pub const CUSTOM_EVENT_LOGIN: &str = "user_login";
pub const CUSTOM_EVENT_PURCHASE: &str = "purchase";
pub const CUSTOM_EVENT_SUBSCRIPTION: &str = "subscription";

pub const CACHE_MIN_TTL_SECS: u64 = 60;
pub const CACHE_DEFAULT_TTL_SECS: u64 = 3600;
pub const CACHE_MAX_TTL_SECS: u64 = 86400;
pub const CACHE_MIN_SIZE: usize = 100;
pub const CACHE_DEFAULT_SIZE: usize = 10000;
pub const CACHE_MAX_SIZE: usize = 1000000;

pub const UA_DESKTOP: &str = "desktop";
pub const UA_MOBILE: &str = "mobile";
pub const UA_TABLET: &str = "tablet";
pub const UA_BOT: &str = "bot";
pub const UA_UNKNOWN: &str = "unknown";