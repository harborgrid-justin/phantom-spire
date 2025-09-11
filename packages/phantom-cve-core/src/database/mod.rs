//! Database Module
//! 
//! Diesel ORM integration for CVE data persistence

#[cfg(feature = "diesel")]
pub mod schema;
#[cfg(feature = "diesel")]
pub mod models;
#[cfg(feature = "diesel")]
pub mod connection;
#[cfg(feature = "diesel")]
pub mod migrations;

#[cfg(feature = "diesel")]
pub use models::*;
#[cfg(feature = "diesel")]
pub use connection::*;

#[cfg(feature = "diesel")]
use diesel::prelude::*;
#[cfg(feature = "diesel")]
use diesel::r2d2::{self, ConnectionManager, Pool};

/// Database connection pool type for PostgreSQL
#[cfg(feature = "diesel")]
pub type PgPool = Pool<ConnectionManager<PgConnection>>;

/// Database connection pool type for SQLite
#[cfg(feature = "diesel")]
pub type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

/// Database connection pool type for MySQL
#[cfg(feature = "diesel")]
pub type MysqlPool = Pool<ConnectionManager<MysqlConnection>>;

/// Database configuration
#[cfg(feature = "diesel")]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DatabaseConfig {
    pub database_url: String,
    pub max_connections: u32,
    pub min_connections: Option<u32>,
    pub connection_timeout: std::time::Duration,
    pub idle_timeout: Option<std::time::Duration>,
    pub max_lifetime: Option<std::time::Duration>,
}

#[cfg(feature = "diesel")]
impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            database_url: "postgresql://localhost/phantom_cve".to_string(),
            max_connections: 10,
            min_connections: Some(1),
            connection_timeout: std::time::Duration::from_secs(30),
            idle_timeout: Some(std::time::Duration::from_secs(600)),
            max_lifetime: Some(std::time::Duration::from_secs(1800)),
        }
    }
}

/// Database connection manager
#[cfg(feature = "diesel")]
pub struct DatabaseManager {
    pg_pool: Option<PgPool>,
    sqlite_pool: Option<SqlitePool>,
    mysql_pool: Option<MysqlPool>,
    config: DatabaseConfig,
}

#[cfg(feature = "diesel")]
impl DatabaseManager {
    /// Create a new database manager with PostgreSQL
    pub fn new_postgres(config: DatabaseConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let manager = ConnectionManager::<PgConnection>::new(&config.database_url);
        let pool = Pool::builder()
            .max_size(config.max_connections)
            .min_idle(config.min_connections)
            .connection_timeout(config.connection_timeout)
            .idle_timeout(config.idle_timeout)
            .max_lifetime(config.max_lifetime)
            .build(manager)?;
            
        Ok(Self {
            pg_pool: Some(pool),
            sqlite_pool: None,
            mysql_pool: None,
            config,
        })
    }
    
    /// Create a new database manager with SQLite
    pub fn new_sqlite(config: DatabaseConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let manager = ConnectionManager::<SqliteConnection>::new(&config.database_url);
        let pool = Pool::builder()
            .max_size(config.max_connections)
            .min_idle(config.min_connections)
            .connection_timeout(config.connection_timeout)
            .idle_timeout(config.idle_timeout)
            .max_lifetime(config.max_lifetime)
            .build(manager)?;
            
        Ok(Self {
            pg_pool: None,
            sqlite_pool: Some(pool),
            mysql_pool: None,
            config,
        })
    }
    
    /// Create a new database manager with MySQL
    pub fn new_mysql(config: DatabaseConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let manager = ConnectionManager::<MysqlConnection>::new(&config.database_url);
        let pool = Pool::builder()
            .max_size(config.max_connections)
            .min_idle(config.min_connections)
            .connection_timeout(config.connection_timeout)
            .idle_timeout(config.idle_timeout)
            .max_lifetime(config.max_lifetime)
            .build(manager)?;
            
        Ok(Self {
            pg_pool: None,
            sqlite_pool: None,
            mysql_pool: Some(pool),
            config,
        })
    }
    
    /// Get PostgreSQL connection from a pool
    pub fn get_pg_connection(&self) -> Result<r2d2::PooledConnection<ConnectionManager<PgConnection>>, r2d2::Error> {
        self.pg_pool.as_ref()
            .ok_or(r2d2::Error::Timeout)?
            .get()
    }
    
    /// Get SQLite connection from a pool
    pub fn get_sqlite_connection(&self) -> Result<r2d2::PooledConnection<ConnectionManager<SqliteConnection>>, r2d2::Error> {
        self.sqlite_pool.as_ref()
            .ok_or(r2d2::Error::Timeout)?
            .get()
    }
    
    /// Get MySQL connection from a pool
    pub fn get_mysql_connection(&self) -> Result<r2d2::PooledConnection<ConnectionManager<MysqlConnection>>, r2d2::Error> {
        self.mysql_pool.as_ref()
            .ok_or(r2d2::Error::Timeout)?
            .get()
    }
}

/// Database error types
#[cfg(feature = "diesel")]
#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {
    #[error("Connection error: {0}")]
    Connection(#[from] diesel::ConnectionError),
    
    #[error("Query error: {0}")]
    Query(#[from] diesel::result::Error),
    
    #[error("Pool error: {0}")]
    Pool(#[from] r2d2::Error),
    
    #[error("Migration error: {0}")]
    Migration(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
}

/// Database result type
#[cfg(feature = "diesel")]
pub type DatabaseResult<T> = Result<T, DatabaseError>;

#[cfg(test)]
#[cfg(feature = "diesel")]
mod tests {
    use super::*;
    
    #[test]
    fn test_database_config_default() {
        let config = DatabaseConfig::default();
        assert!(config.database_url.contains("postgresql"));
        assert_eq!(config.max_connections, 10);
    }
    
    #[test]
    fn test_database_config_from_env() {
        std::env::set_var("DATABASE_URL", "sqlite:///tmp/test.db");
        
        let config = DatabaseConfig {
            database_url: std::env::var("DATABASE_URL").unwrap_or_default(),
            ..Default::default()
        };
        
        assert!(config.database_url.contains("sqlite"));
    }
}