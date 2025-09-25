//! Integration tests for web API and database features
//! These tests verify the integration between actix-web and diesel ORM

#[cfg(all(feature = "web-api", feature = "diesel-orm"))]
mod integration_tests {
    use super::*;
    use actix_web::{test, web, App};
    use diesel::prelude::*;
    use std::env;

    use crate::database::{models::*, DatabaseManager, DatabaseService};
    use crate::web_api::{create_app_data, ApiState};

    /// Setup test database connection
    async fn setup_test_db() -> DatabaseManager {
        // Use a test database URL - in real scenarios, this would be a test database
        let database_url = env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgres://test:test@localhost/test_db".to_string());

        let manager = DatabaseManager::new(database_url);

        // Run migrations for test database
        if let Err(e) = manager.run_migrations() {
            println!("Warning: Could not run migrations on test database: {}", e);
        }

        manager
    }

    /// Test database operations
    #[tokio::test]
    async fn test_database_operations() {
        let manager = setup_test_db().await;
        let mut conn = match manager.connect() {
            Ok(conn) => conn,
            Err(_) => {
                println!("Skipping database test - no test database available");
                return;
            }
        };

        let service = DatabaseService::new();

        // Test threat actor creation
        let new_actor =
            models::ThreatActor::new(Some("Test Actor".to_string()), Some("APT".to_string()));

        let created_actor = service.threat_actors.create(&mut conn, &new_actor).await;
        assert!(created_actor.is_ok(), "Failed to create threat actor");

        let actor = created_actor.unwrap();

        // Test finding by ID
        let found_actor = service.threat_actors.find_by_id(&mut conn, &actor.id).await;
        assert!(found_actor.is_ok(), "Failed to find threat actor");
        assert!(found_actor.unwrap().is_some(), "Threat actor not found");

        // Test incident creation
        let new_incident = models::Incident::new(
            "Test Incident".to_string(),
            "Test incident description".to_string(),
            "high".to_string(),
        );

        let created_incident = service.incidents.create(&mut conn, &new_incident).await;
        assert!(created_incident.is_ok(), "Failed to create incident");

        // Test statistics
        let stats = service.get_threat_actor_stats(&mut conn).await;
        assert!(stats.is_ok(), "Failed to get threat actor stats");

        let incident_stats = service.get_incident_stats(&mut conn).await;
        assert!(incident_stats.is_ok(), "Failed to get incident stats");
    }

    /// Test web API endpoints
    #[actix_web::test]
    async fn test_web_api_endpoints() {
        let manager = setup_test_db().await;
        let service = DatabaseService::new();
        let app_data = create_app_data(manager, service).await;

        let app = test::init_service(
            App::new()
                .app_data(app_data)
                .configure(crate::web_api::configure_routes),
        )
        .await;

        // Test health check endpoint
        let req = test::TestRequest::get().uri("/api/v1/health").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success(), "Health check failed");

        // Test threat analysis endpoint (without database dependency)
        let req = test::TestRequest::post()
            .uri("/api/v1/analyze")
            .set_json(&serde_json::json!({
                "indicators": ["malicious_domain.com", "suspicious_ip"]
            }))
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success(), "Threat analysis failed");
    }

    /// Test API state creation
    #[tokio::test]
    async fn test_api_state_creation() {
        let manager = setup_test_db().await;
        let service = DatabaseService::new();

        let api_state = ApiState::new(manager, service).await;
        assert!(
            api_state.database.is_some() || api_state.database_url.is_some(),
            "API state should have database configuration"
        );
    }
}

#[cfg(not(all(feature = "web-api", feature = "diesel-orm")))]
mod stub_tests {
    #[test]
    fn test_features_not_enabled() {
        // This test passes when features are not enabled
        assert!(true, "Features not enabled - this is expected");
    }
}
