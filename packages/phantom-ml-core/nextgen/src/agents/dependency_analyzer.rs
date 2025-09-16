use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
#[napi]
pub struct DependencyAnalyzerAgent {
    name: String,
    version: String,
}

#[napi]
impl DependencyAnalyzerAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "DependencyAnalyzerAgent".to_string(),
            version: "1.0.0".to_string(),
        }
    }

    #[napi]
    pub async fn analyze_package_json(&self, content: String) -> DependencyReport {
        let mut report = DependencyReport {
            total_dependencies: 0,
            production_deps: HashMap::new(),
            dev_deps: HashMap::new(),
            outdated: Vec::new(),
            vulnerabilities: Vec::new(),
            unused: Vec::new(),
            duplicate_versions: HashMap::new(),
        };

        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(deps) = json["dependencies"].as_object() {
                for (name, version) in deps {
                    report.production_deps.insert(name.clone(), version.as_str().unwrap_or("").to_string());
                    report.total_dependencies += 1;
                }
            }

            if let Some(deps) = json["devDependencies"].as_object() {
                for (name, version) in deps {
                    report.dev_deps.insert(name.clone(), version.as_str().unwrap_or("").to_string());
                    report.total_dependencies += 1;
                }
            }
        }

        report
    }

    #[napi]
    pub fn find_circular_dependencies(&self, dependencies: HashMap<String, Vec<String>>) -> Vec<CircularDependency> {
        let mut circular_deps = Vec::new();
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();

        for package in dependencies.keys() {
            if !visited.contains(package) {
                let mut path = Vec::new();
                self.dfs_circular(package, &dependencies, &mut visited, &mut rec_stack, &mut path, &mut circular_deps);
            }
        }

        circular_deps
    }

    fn dfs_circular(
        &self,
        node: &str,
        graph: &HashMap<String, Vec<String>>,
        visited: &mut HashSet<String>,
        rec_stack: &mut HashSet<String>,
        path: &mut Vec<String>,
        circular_deps: &mut Vec<CircularDependency>,
    ) {
        visited.insert(node.to_string());
        rec_stack.insert(node.to_string());
        path.push(node.to_string());

        if let Some(deps) = graph.get(node) {
            for dep in deps {
                if !visited.contains(dep) {
                    self.dfs_circular(dep, graph, visited, rec_stack, path, circular_deps);
                } else if rec_stack.contains(dep) {
                    let cycle_start = path.iter().position(|x| x == dep).unwrap_or(0);
                    let cycle = path[cycle_start..].to_vec();
                    circular_deps.push(CircularDependency {
                        packages: cycle,
                        severity: "HIGH".to_string(),
                    });
                }
            }
        }

        path.pop();
        rec_stack.remove(node);
    }

    #[napi]
    pub fn calculate_dependency_tree_depth(&self, root: String, dependencies: HashMap<String, Vec<String>>) -> i32 {
        self.calculate_depth(&root, &dependencies, 0, &mut HashSet::new())
    }

    fn calculate_depth(&self, node: &str, graph: &HashMap<String, Vec<String>>, current_depth: i32, visited: &mut HashSet<String>) -> i32 {
        if visited.contains(node) {
            return current_depth;
        }

        visited.insert(node.to_string());
        let mut max_depth = current_depth;

        if let Some(deps) = graph.get(node) {
            for dep in deps {
                let depth = self.calculate_depth(dep, graph, current_depth + 1, visited);
                max_depth = max_depth.max(depth);
            }
        }

        max_depth
    }

    #[napi]
    pub fn generate_dependency_graph(&self, dependencies: HashMap<String, Vec<String>>) -> DependencyGraph {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        for (package, deps) in &dependencies {
            nodes.push(GraphNode {
                id: package.clone(),
                label: package.clone(),
                node_type: "package".to_string(),
                size: deps.len() as i32,
            });

            for dep in deps {
                edges.push(GraphEdge {
                    source: package.clone(),
                    target: dep.clone(),
                    edge_type: "depends_on".to_string(),
                });
            }
        }

        DependencyGraph { nodes, edges }
    }

    #[napi]
    pub fn check_license_compatibility(&self, licenses: HashMap<String, String>) -> LicenseReport {
        let mut compatible = Vec::new();
        let mut incompatible = Vec::new();
        let mut unknown = Vec::new();

        let permissive = vec!["MIT", "Apache-2.0", "BSD", "ISC"];
        let copyleft = vec!["GPL", "AGPL", "LGPL"];

        for (package, license) in licenses {
            if permissive.iter().any(|l| license.contains(l)) {
                compatible.push(LicenseInfo {
                    package,
                    license,
                    license_type: "Permissive".to_string(),
                });
            } else if copyleft.iter().any(|l| license.contains(l)) {
                incompatible.push(LicenseInfo {
                    package,
                    license,
                    license_type: "Copyleft".to_string(),
                });
            } else {
                unknown.push(LicenseInfo {
                    package,
                    license,
                    license_type: "Unknown".to_string(),
                });
            }
        }

        LicenseReport {
            compatible,
            incompatible,
            unknown,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct DependencyReport {
    pub total_dependencies: i32,
    pub production_deps: HashMap<String, String>,
    pub dev_deps: HashMap<String, String>,
    pub outdated: Vec<OutdatedDependency>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub unused: Vec<String>,
    pub duplicate_versions: HashMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct OutdatedDependency {
    pub name: String,
    pub current: String,
    pub latest: String,
    pub wanted: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct Vulnerability {
    pub package: String,
    pub severity: String,
    pub description: String,
    pub fixed_in: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct CircularDependency {
    pub packages: Vec<String>,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct DependencyGraph {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct GraphNode {
    pub id: String,
    pub label: String,
    pub node_type: String,
    pub size: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct GraphEdge {
    pub source: String,
    pub target: String,
    pub edge_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct LicenseReport {
    pub compatible: Vec<LicenseInfo>,
    pub incompatible: Vec<LicenseInfo>,
    pub unknown: Vec<LicenseInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct LicenseInfo {
    pub package: String,
    pub license: String,
    pub license_type: String,
}