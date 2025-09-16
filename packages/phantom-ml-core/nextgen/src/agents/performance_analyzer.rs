use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use std::collections::HashMap;

#[derive(Debug, Clone)]
#[napi]
pub struct PerformanceAnalyzerAgent {
    name: String,
    version: String,
    profiles: HashMap<String, PerformanceProfile>,
}

#[napi]
impl PerformanceAnalyzerAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "PerformanceAnalyzerAgent".to_string(),
            version: "1.0.0".to_string(),
            profiles: HashMap::new(),
        }
    }

    #[napi]
    pub fn start_profiling(&mut self, operation_name: String) -> String {
        let profile_id = format!("{}_{}", operation_name, uuid::Uuid::new_v4());
        let profile = PerformanceProfile {
            id: profile_id.clone(),
            name: operation_name,
            start_time: Instant::now(),
            end_time: None,
            memory_start: self.get_memory_usage(),
            memory_end: 0,
            cpu_usage: Vec::new(),
            events: Vec::new(),
        };
        self.profiles.insert(profile_id.clone(), profile);
        profile_id
    }

    #[napi]
    pub fn mark_event(&mut self, profile_id: String, event_name: String) {
        if let Some(profile) = self.profiles.get_mut(&profile_id) {
            profile.events.push(PerformanceEvent {
                name: event_name,
                timestamp: profile.start_time.elapsed().as_millis() as i64,
                memory: self.get_memory_usage(),
            });
        }
    }

    #[napi]
    pub fn stop_profiling(&mut self, profile_id: String) -> Option<PerformanceReport> {
        if let Some(mut profile) = self.profiles.remove(&profile_id) {
            profile.end_time = Some(Instant::now());
            profile.memory_end = self.get_memory_usage();

            let duration = profile.end_time.unwrap().duration_since(profile.start_time);

            Some(PerformanceReport {
                profile_id: profile.id,
                operation_name: profile.name,
                duration_ms: duration.as_millis() as i64,
                memory_used: profile.memory_end - profile.memory_start,
                memory_peak: profile.events.iter().map(|e| e.memory).max().unwrap_or(profile.memory_end),
                events: profile.events,
                recommendations: self.generate_recommendations(&profile, duration),
            })
        } else {
            None
        }
    }

    #[napi]
    pub async fn analyze_function(&self, code: String) -> FunctionAnalysis {
        let mut analysis = FunctionAnalysis {
            complexity: 0,
            estimated_time: 0,
            memory_estimate: 0,
            bottlenecks: Vec::new(),
            optimizations: Vec::new(),
        };

        if code.contains("for") || code.contains("while") {
            analysis.complexity += 1;
            if code.contains("for.*for") || code.contains("while.*while") {
                analysis.complexity += 2;
                analysis.bottlenecks.push("Nested loops detected".to_string());
                analysis.optimizations.push("Consider using array methods or optimizing nested loops".to_string());
            }
        }

        if code.contains(".map(").and(code.contains(".filter(")) {
            analysis.bottlenecks.push("Multiple array iterations".to_string());
            analysis.optimizations.push("Combine map and filter into single reduce".to_string());
        }

        if code.contains("await") && code.contains("for") {
            analysis.bottlenecks.push("Sequential async operations in loop".to_string());
            analysis.optimizations.push("Use Promise.all for parallel execution".to_string());
        }

        analysis.estimated_time = (analysis.complexity * 10) as i64;
        analysis.memory_estimate = (code.len() * 2) as i64;

        analysis
    }

    fn get_memory_usage(&self) -> i64 {
        #[cfg(unix)]
        {
            use std::fs;
            if let Ok(status) = fs::read_to_string("/proc/self/status") {
                for line in status.lines() {
                    if line.starts_with("VmRSS:") {
                        let parts: Vec<&str> = line.split_whitespace().collect();
                        if parts.len() >= 2 {
                            return parts[1].parse().unwrap_or(0) * 1024;
                        }
                    }
                }
            }
        }
        0
    }

    fn generate_recommendations(&self, profile: &PerformanceProfile, duration: Duration) -> Vec<String> {
        let mut recommendations = Vec::new();

        if duration.as_secs() > 1 {
            recommendations.push("Operation took more than 1 second - consider optimization".to_string());
        }

        let memory_increase = profile.memory_end - profile.memory_start;
        if memory_increase > 50_000_000 {
            recommendations.push("High memory usage detected - check for memory leaks".to_string());
        }

        if profile.events.len() > 100 {
            recommendations.push("Many events recorded - consider batching operations".to_string());
        }

        recommendations
    }
}

#[derive(Debug, Clone)]
struct PerformanceProfile {
    id: String,
    name: String,
    start_time: Instant,
    end_time: Option<Instant>,
    memory_start: i64,
    memory_end: i64,
    cpu_usage: Vec<f32>,
    events: Vec<PerformanceEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct PerformanceEvent {
    pub name: String,
    pub timestamp: i64,
    pub memory: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct PerformanceReport {
    pub profile_id: String,
    pub operation_name: String,
    pub duration_ms: i64,
    pub memory_used: i64,
    pub memory_peak: i64,
    pub events: Vec<PerformanceEvent>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct FunctionAnalysis {
    pub complexity: i32,
    pub estimated_time: i64,
    pub memory_estimate: i64,
    pub bottlenecks: Vec<String>,
    pub optimizations: Vec<String>,
}