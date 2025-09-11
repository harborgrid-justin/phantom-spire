//! Database Integration
//! 
//! Provides Diesel ORM integration for PostgreSQL, MySQL, and SQLite databases
//! Supports connection pooling, migrations, and type-safe database queries

use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, Pool, PooledConnection};
use std::sync::Arc;
use thiserror::Error;

/// Database connection types
#[derive(Debug, Clone)]
pub enum DatabaseType {
    PostgreSQL,
    MySQL,
    SQLite,
}

/// Database configuration
#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub database_type: DatabaseType,
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub connection_timeout_seconds: u64,
    pub idle_timeout_seconds: Option<u64>,
    pub max_lifetime_seconds: Option<u64>,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            database_type: DatabaseType::PostgreSQL,
            url: "postgresql://localhost/incident_response".to_string(),
            max_connections: 10,
            min_connections: 1,
            connection_timeout_seconds: 30,
            idle_timeout_seconds: Some(600),
            max_lifetime_seconds: Some(1800),
        }
    }
}

/// Database errors
#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Connection error: {0}")]
    ConnectionError(String),
    
    #[error("Query error: {0}")]
    QueryError(String),
    
    #[error("Migration error: {0}")]
    MigrationError(String),
    
    #[error("Pool error: {0}")]
    PoolError(String),
    
    #[error("Transaction error: {0}")]
    TransactionError(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
}

/// Database connection types for different backends
pub type PgPool = Pool<ConnectionManager<PgConnection>>;
pub type MysqlPool = Pool<ConnectionManager<MysqlConnection>>;
pub type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

pub type PgPooledConnection = PooledConnection<ConnectionManager<PgConnection>>;
pub type MysqlPooledConnection = PooledConnection<ConnectionManager<MysqlConnection>>;
pub type SqlitePooledConnection = PooledConnection<ConnectionManager<SqliteConnection>>;

/// Database connection pool manager
pub struct DatabaseManager {
    config: DatabaseConfig,
    pg_pool: Option<Arc<PgPool>>,
    mysql_pool: Option<Arc<MysqlPool>>,
    sqlite_pool: Option<Arc<SqlitePool>>,
}

impl DatabaseManager {
    /// Create a new database manager
    pub fn new(config: DatabaseConfig) -> Self {
        Self {
            config,
            pg_pool: None,
            mysql_pool: None,
            sqlite_pool: None,
        }
    }
    
    /// Initialize the connection pool based on database type
    pub async fn initialize(&mut self) -> Result<(), DatabaseError> {
        match self.config.database_type {
            DatabaseType::PostgreSQL => {
                self.pg_pool = Some(Arc::new(self.create_pg_pool()?));
            }
            DatabaseType::MySQL => {
                self.mysql_pool = Some(Arc::new(self.create_mysql_pool()?));
            }
            DatabaseType::SQLite => {
                self.sqlite_pool = Some(Arc::new(self.create_sqlite_pool()?));
            }
        }
        Ok(())
    }
    
    /// Create PostgreSQL connection pool
    fn create_pg_pool(&self) -> Result<PgPool, DatabaseError> {
        let manager = ConnectionManager::<PgConnection>::new(&self.config.url);
        let pool = Pool::builder()
            .max_size(self.config.max_connections)
            .min_idle(Some(self.config.min_connections))
            .connection_timeout(std::time::Duration::from_secs(self.config.connection_timeout_seconds))
            .idle_timeout(self.config.idle_timeout_seconds.map(std::time::Duration::from_secs))
            .max_lifetime(self.config.max_lifetime_seconds.map(std::time::Duration::from_secs))
            .build(manager)
            .map_err(|e| DatabaseError::PoolError(e.to_string()))?;
        Ok(pool)
    }
    
    /// Create MySQL connection pool
    fn create_mysql_pool(&self) -> Result<MysqlPool, DatabaseError> {
        let manager = ConnectionManager::<MysqlConnection>::new(&self.config.url);
        let pool = Pool::builder()
            .max_size(self.config.max_connections)
            .min_idle(Some(self.config.min_connections))
            .connection_timeout(std::time::Duration::from_secs(self.config.connection_timeout_seconds))
            .idle_timeout(self.config.idle_timeout_seconds.map(std::time::Duration::from_secs))
            .max_lifetime(self.config.max_lifetime_seconds.map(std::time::Duration::from_secs))
            .build(manager)
            .map_err(|e| DatabaseError::PoolError(e.to_string()))?;
        Ok(pool)
    }
    
    /// Create SQLite connection pool
    fn create_sqlite_pool(&self) -> Result<SqlitePool, DatabaseError> {
        let manager = ConnectionManager::<SqliteConnection>::new(&self.config.url);
        let pool = Pool::builder()
            .max_size(self.config.max_connections)
            .min_idle(Some(self.config.min_connections))
            .connection_timeout(std::time::Duration::from_secs(self.config.connection_timeout_seconds))
            .idle_timeout(self.config.idle_timeout_seconds.map(std::time::Duration::from_secs))
            .max_lifetime(self.config.max_lifetime_seconds.map(std::time::Duration::from_secs))
            .build(manager)
            .map_err(|e| DatabaseError::PoolError(e.to_string()))?;
        Ok(pool)
    }
    
    /// Get a PostgreSQL connection from the pool
    pub fn get_pg_connection(&self) -> Result<PgPooledConnection, DatabaseError> {
        match &self.pg_pool {
            Some(pool) => pool.get().map_err(|e| DatabaseError::ConnectionError(e.to_string())),
            None => Err(DatabaseError::ConnectionError("PostgreSQL pool not initialized".to_string())),
        }
    }
    
    /// Get a MySQL connection from the pool
    pub fn get_mysql_connection(&self) -> Result<MysqlPooledConnection, DatabaseError> {
        match &self.mysql_pool {
            Some(pool) => pool.get().map_err(|e| DatabaseError::ConnectionError(e.to_string())),
            None => Err(DatabaseError::ConnectionError("MySQL pool not initialized".to_string())),
        }
    }
    
    /// Get a SQLite connection from the pool
    pub fn get_sqlite_connection(&self) -> Result<SqlitePooledConnection, DatabaseError> {
        match &self.sqlite_pool {
            Some(pool) => pool.get().map_err(|e| DatabaseError::ConnectionError(e.to_string())),
            None => Err(DatabaseError::ConnectionError("SQLite pool not initialized".to_string())),
        }
    }
    
    /// Get the PostgreSQL pool
    pub fn get_pg_pool(&self) -> Result<Arc<PgPool>, DatabaseError> {
        match &self.pg_pool {
            Some(pool) => Ok(Arc::clone(pool)),
            None => Err(DatabaseError::ConnectionError("PostgreSQL pool not initialized".to_string())),
        }
    }
    
    /// Get the MySQL pool
    pub fn get_mysql_pool(&self) -> Result<Arc<MysqlPool>, DatabaseError> {
        match &self.mysql_pool {
            Some(pool) => Ok(Arc::clone(pool)),
            None => Err(DatabaseError::ConnectionError("MySQL pool not initialized".to_string())),
        }
    }
    
    /// Get the SQLite pool
    pub fn get_sqlite_pool(&self) -> Result<Arc<SqlitePool>, DatabaseError> {
        match &self.sqlite_pool {
            Some(pool) => Ok(Arc::clone(pool)),
            None => Err(DatabaseError::ConnectionError("SQLite pool not initialized".to_string())),
        }
    }
    
    /// Check if the database connection is healthy
    pub async fn health_check(&self) -> Result<bool, DatabaseError> {
        match self.config.database_type {
            DatabaseType::PostgreSQL => {
                let mut conn = self.get_pg_connection()?;
                diesel::sql_query("SELECT 1")
                    .execute(&mut conn)
                    .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
            }
            DatabaseType::MySQL => {
                let mut conn = self.get_mysql_connection()?;
                diesel::sql_query("SELECT 1")
                    .execute(&mut conn)
                    .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
            }
            DatabaseType::SQLite => {
                let mut conn = self.get_sqlite_connection()?;
                diesel::sql_query("SELECT 1")
                    .execute(&mut conn)
                    .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
            }
        }
        Ok(true)
    }
}

/// Migration utilities
pub mod migrations {
    use super::*;
    use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
    
    pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
    
    /// Run all pending migrations
    pub fn run_migrations(manager: &DatabaseManager) -> Result<(), DatabaseError> {
        match manager.config.database_type {
            DatabaseType::PostgreSQL => {
                let mut conn = manager.get_pg_connection()?;
                conn.run_pending_migrations(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
            DatabaseType::MySQL => {
                let mut conn = manager.get_mysql_connection()?;
                conn.run_pending_migrations(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
            DatabaseType::SQLite => {
                let mut conn = manager.get_sqlite_connection()?;
                conn.run_pending_migrations(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
        }
        Ok(())
    }
    
    /// Revert the last migration
    pub fn revert_migration(manager: &DatabaseManager) -> Result<(), DatabaseError> {
        match manager.config.database_type {
            DatabaseType::PostgreSQL => {
                let mut conn = manager.get_pg_connection()?;
                conn.revert_last_migration(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
            DatabaseType::MySQL => {
                let mut conn = manager.get_mysql_connection()?;
                conn.revert_last_migration(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
            DatabaseType::SQLite => {
                let mut conn = manager.get_sqlite_connection()?;
                conn.revert_last_migration(MIGRATIONS)
                    .map_err(|e| DatabaseError::MigrationError(e.to_string()))?;
            }
        }
        Ok(())
    }
}

/// Transaction utilities
pub trait Transactional {
    type Connection;
    type Error;
    
    fn with_transaction<F, R>(&self, f: F) -> Result<R, Self::Error>
    where
        F: FnOnce(&mut Self::Connection) -> Result<R, Self::Error>;
}

impl Transactional for DatabaseManager {
    type Connection = Box<dyn diesel::Connection>;
    type Error = DatabaseError;
    
    fn with_transaction<F, R>(&self, f: F) -> Result<R, Self::Error>
    where
        F: FnOnce(&mut Self::Connection) -> Result<R, Self::Error>,
    {
        match self.config.database_type {
            DatabaseType::PostgreSQL => {
                let mut conn = self.get_pg_connection()?;
                conn.transaction(|conn| {
                    let mut boxed_conn = Box::new(conn) as Box<dyn diesel::Connection>;
                    f(&mut boxed_conn)
                }).map_err(|e| DatabaseError::TransactionError(e.to_string()))
            }
            DatabaseType::MySQL => {
                let mut conn = self.get_mysql_connection()?;
                conn.transaction(|conn| {
                    let mut boxed_conn = Box::new(conn) as Box<dyn diesel::Connection>;
                    f(&mut boxed_conn)
                }).map_err(|e| DatabaseError::TransactionError(e.to_string()))
            }
            DatabaseType::SQLite => {
                let mut conn = self.get_sqlite_connection()?;
                conn.transaction(|conn| {
                    let mut boxed_conn = Box::new(conn) as Box<dyn diesel::Connection>;
                    f(&mut boxed_conn)
                }).map_err(|e| DatabaseError::TransactionError(e.to_string()))
            }
        }
    }
}

/// Re-export commonly used Diesel types and traits
pub use diesel::{
    connection::Connection,
    prelude::*,
    query_builder::QueryBuilder,
    result::{Error as DieselError, QueryResult},
    serialize::ToSql,
    deserialize::FromSql,
    sql_types,
    Queryable,
    Insertable,
    AsChangeset,
    Identifiable,
};