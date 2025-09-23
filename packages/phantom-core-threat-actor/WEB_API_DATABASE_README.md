# Web API and Database Integration

This document describes the optional web API and database features that have been integrated into the phantom-threat-actor-core package.

## Features

### Web API (`web-api` feature)

- REST API server using actix-web
- CORS support for cross-origin requests
- JSON-based request/response format
- Comprehensive endpoints for threat analysis

### Database ORM (`diesel-orm` feature)

- PostgreSQL database support using Diesel ORM
- Compile-time query safety
- Repository pattern for data access
- Database migrations support

## Installation

To enable these features, add them to your `Cargo.toml`:

```toml
[dependencies]
phantom-threat-actor-core = { version = "1.0.1", features = ["web-api", "diesel-orm"] }
```

Or enable all features:

```toml
[dependencies]
phantom-threat-actor-core = { version = "1.0.1", features = ["full"] }
```

## Database Setup

1. **Install PostgreSQL** and create a database
2. **Set environment variable**:

   ```bash
   export DATABASE_URL="postgres://username:password@localhost/database_name"
   ```

3. **Run migrations**:

   ```rust
   use phantom_threat_actor_core::database::DatabaseManager;

   let manager = DatabaseManager::new(database_url);
   manager.run_migrations()?;
   ```

## Web API Usage

### Starting the Server

```rust
use phantom_threat_actor_core::web_api::start_server;
use phantom_threat_actor_core::database::{DatabaseManager, DatabaseService};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let database_url = "postgres://user:pass@localhost/db";
    let manager = DatabaseManager::new(database_url.to_string());
    let service = DatabaseService::new();

    start_server(manager, service, "127.0.0.1:8080").await
}
```

### API Endpoints

#### Health Check

```
GET /api/v1/health
```

Returns server health status.

#### Threat Analysis

```http
POST /api/v1/analyze
Content-Type: application/json

{
  "indicators": ["malicious_domain.com", "suspicious_ip"]
}
```

Analyzes threat indicators and returns attribution results.

#### Threat Actors

```http
GET /api/v1/threat-actors
GET /api/v1/threat-actors/{id}
POST /api/v1/threat-actors
PUT /api/v1/threat-actors/{id}
DELETE /api/v1/threat-actors/{id}
```

#### Incidents

```http
GET /api/v1/incidents
GET /api/v1/incidents/{id}
POST /api/v1/incidents
PUT /api/v1/incidents/{id}
DELETE /api/v1/incidents/{id}
```

#### Alerts

```http
GET /api/v1/alerts
GET /api/v1/alerts/{id}
POST /api/v1/alerts
PUT /api/v1/alerts/{id}
DELETE /api/v1/alerts/{id}
```

#### Threat Hunting

```http
POST /api/v1/threat-hunt
Content-Type: application/json

{
  "query": "suspicious_activity",
  "time_range": "24h"
}
```

## Database Models

The following models are available when the `diesel-orm` feature is enabled:

- `ThreatActor` - Threat actor profiles and attribution data
- `Incident` - Security incidents and response tracking
- `Alert` - Security alerts and notifications
- `BehavioralPattern` - Behavioral analysis patterns
- `GeographicLocation` - Geographic threat intelligence
- `IntelligenceReport` - Intelligence reports and assessments
- `RiskAssessment` - Risk assessment data

## Repository Pattern

Database operations use a repository pattern for clean separation of concerns:

```rust
use phantom_threat_actor_core::database::{DatabaseService, DatabaseManager};

let manager = DatabaseManager::new(database_url);
let mut conn = manager.connect()?;
let service = DatabaseService::new();

// Create a threat actor
let actor = ThreatActor::new(Some("APT-123".to_string()), Some("APT".to_string()));
let created = service.threat_actors.create(&mut conn, &actor).await?;

// Find by ID
let found = service.threat_actors.find_by_id(&mut conn, &actor.id).await?;

// Search
let results = service.threat_actors.search(&mut conn, "APT").await?;
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a JSON object with error details:

```json
{
  "error": "Database connection failed",
  "code": "DB_ERROR"
}
```

## Testing

Run integration tests with both features enabled:

```bash
cargo test --features "web-api diesel-orm"
```

Set up a test database and run:

```bash
TEST_DATABASE_URL="postgres://test:test@localhost/test_db" cargo test --features "web-api diesel-orm"
```

## Performance Considerations

- Database connections are pooled for efficiency
- API endpoints support async operations
- Indexes are created on frequently queried columns
- JSON fields use PostgreSQL's native JSONB for fast queries

## Security

- CORS is configured for secure cross-origin requests
- Input validation is performed on all API endpoints
- Database queries use parameterized statements to prevent SQL injection
- Consider adding authentication middleware for production use

## Migration

To migrate existing data to the new database schema:

1. Export existing data
2. Run database migrations
3. Import data using the repository methods

The migration system supports rolling back changes if needed.
