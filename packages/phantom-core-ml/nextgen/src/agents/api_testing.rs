use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone)]
#[napi]
pub struct APITestingAgent {
    name: String,
    version: String,
    test_suites: Vec<TestSuite>,
}

#[napi]
impl APITestingAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "APITestingAgent".to_string(),
            version: "1.0.0".to_string(),
            test_suites: Vec::new(),
        }
    }

    #[napi]
    pub fn create_test(&self, endpoint: String, method: String, expected_status: i32) -> APITest {
        APITest {
            id: uuid::Uuid::new_v4().to_string(),
            name: format!("{} {}", method, endpoint),
            endpoint,
            method,
            headers: HashMap::new(),
            body: None,
            expected_status,
            expected_headers: HashMap::new(),
            expected_body: None,
            timeout_ms: 5000,
        }
    }

    #[napi]
    pub async fn run_test(&self, test: &APITest) -> TestResult {
        let start = std::time::Instant::now();

        let mut result = TestResult {
            test_id: test.id.clone(),
            passed: false,
            status_code: 0,
            response_time_ms: 0,
            errors: Vec::new(),
            response_body: None,
            response_headers: HashMap::new(),
        };

        result.response_time_ms = start.elapsed().as_millis() as i64;

        if result.status_code != test.expected_status {
            result.errors.push(format!(
                "Status mismatch: expected {}, got {}",
                test.expected_status, result.status_code
            ));
        }

        result.passed = result.errors.is_empty();
        result
    }

    #[napi]
    pub fn create_test_suite(&mut self, name: String, tests: Vec<APITest>) -> TestSuite {
        let suite = TestSuite {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            tests,
            setup_script: None,
            teardown_script: None,
        };
        self.test_suites.push(suite.clone());
        suite
    }

    #[napi]
    pub async fn run_suite(&self, suite: &TestSuite) -> SuiteResult {
        let mut results = Vec::new();
        let start = std::time::Instant::now();

        for test in &suite.tests {
            results.push(self.run_test(test).await);
        }

        let passed = results.iter().filter(|r| r.passed).count();
        let failed = results.len() - passed;

        SuiteResult {
            suite_id: suite.id.clone(),
            total_tests: results.len() as i32,
            passed: passed as i32,
            failed: failed as i32,
            duration_ms: start.elapsed().as_millis() as i64,
            results,
        }
    }

    #[napi]
    pub fn generate_contract_tests(&self, openapi_spec: String) -> Vec<APITest> {
        let mut tests = Vec::new();

        tests.push(self.create_test("/health".to_string(), "GET".to_string(), 200));
        tests.push(self.create_test("/api/v1/users".to_string(), "GET".to_string(), 200));
        tests.push(self.create_test("/api/v1/users".to_string(), "POST".to_string(), 201));

        tests
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct APITest {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
    pub expected_status: i32,
    pub expected_headers: HashMap<String, String>,
    pub expected_body: Option<String>,
    pub timeout_ms: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct TestResult {
    pub test_id: String,
    pub passed: bool,
    pub status_code: i32,
    pub response_time_ms: i64,
    pub errors: Vec<String>,
    pub response_body: Option<String>,
    pub response_headers: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct TestSuite {
    pub id: String,
    pub name: String,
    pub tests: Vec<APITest>,
    pub setup_script: Option<String>,
    pub teardown_script: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct SuiteResult {
    pub suite_id: String,
    pub total_tests: i32,
    pub passed: i32,
    pub failed: i32,
    pub duration_ms: i64,
    pub results: Vec<TestResult>,
}