use napi_derive::napi;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone)]
#[napi]
pub struct DocumentationGeneratorAgent {
    name: String,
    version: String,
}

#[napi]
impl DocumentationGeneratorAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "DocumentationGeneratorAgent".to_string(),
            version: "1.0.0".to_string(),
        }
    }

    #[napi]
    pub fn generate_function_doc(&self, code: String) -> FunctionDoc {
        let mut doc = FunctionDoc {
            name: String::new(),
            description: String::new(),
            parameters: Vec::new(),
            returns: String::new(),
            examples: Vec::new(),
            throws: Vec::new(),
        };

        let func_regex = Regex::new(r"(?:async\s+)?function\s+(\w+)\s*\((.*?)\)").unwrap();
        if let Some(caps) = func_regex.captures(&code) {
            doc.name = caps[1].to_string();
            let params_str = &caps[2];

            for param in params_str.split(',') {
                let param = param.trim();
                if !param.is_empty() {
                    doc.parameters.push(ParameterDoc {
                        name: param.split(':').next().unwrap_or(param).trim().to_string(),
                        type_info: param.split(':').nth(1).unwrap_or("any").trim().to_string(),
                        description: String::new(),
                        required: !param.contains('?'),
                    });
                }
            }
        }

        doc.description = format!("Function {} implementation", doc.name);
        doc.returns = "void".to_string();

        doc
    }

    #[napi]
    pub fn generate_class_doc(&self, code: String) -> ClassDoc {
        let mut doc = ClassDoc {
            name: String::new(),
            description: String::new(),
            constructor: None,
            methods: Vec::new(),
            properties: Vec::new(),
        };

        let class_regex = Regex::new(r"class\s+(\w+)").unwrap();
        if let Some(caps) = class_regex.captures(&code) {
            doc.name = caps[1].to_string();
        }

        doc.description = format!("Class {} implementation", doc.name);

        doc
    }

    #[napi]
    pub fn generate_api_doc(&self, endpoint: String, method: String) -> APIDoc {
        APIDoc {
            endpoint,
            method,
            description: String::new(),
            parameters: Vec::new(),
            request_body: None,
            responses: vec![
                ResponseDoc {
                    status: 200,
                    description: "Success".to_string(),
                    schema: None,
                },
            ],
            security: Vec::new(),
        }
    }

    #[napi]
    pub fn generate_readme(&self, project_name: String, description: String) -> String {
        let mut readme = String::new();

        readme.push_str(&format!("# {}\n\n", project_name));
        readme.push_str(&format!("{}\n\n", description));

        readme.push_str("## Installation\n\n");
        readme.push_str("```bash\nnpm install\n```\n\n");

        readme.push_str("## Usage\n\n");
        readme.push_str("```javascript\n// Example usage\n```\n\n");

        readme.push_str("## API Documentation\n\n");
        readme.push_str("See [API.md](./API.md) for detailed API documentation.\n\n");

        readme.push_str("## Contributing\n\n");
        readme.push_str("Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.\n\n");

        readme.push_str("## License\n\n");
        readme.push_str("This project is licensed under the MIT License.\n");

        readme
    }

    #[napi]
    pub fn extract_comments(&self, code: String) -> Vec<Comment> {
        let mut comments = Vec::new();

        let single_line_regex = Regex::new(r"//\s*(.*)").unwrap();
        let multi_line_regex = Regex::new(r"/\*\*(.*?)\*/").unwrap();

        for (i, line) in code.lines().enumerate() {
            if let Some(caps) = single_line_regex.captures(line) {
                comments.push(Comment {
                    line: i as i32 + 1,
                    text: caps[1].trim().to_string(),
                    comment_type: "single".to_string(),
                });
            }
        }

        for caps in multi_line_regex.captures_iter(&code) {
            comments.push(Comment {
                line: 0,
                text: caps[1].trim().to_string(),
                comment_type: "block".to_string(),
            });
        }

        comments
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct FunctionDoc {
    pub name: String,
    pub description: String,
    pub parameters: Vec<ParameterDoc>,
    pub returns: String,
    pub examples: Vec<String>,
    pub throws: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ParameterDoc {
    pub name: String,
    pub type_info: String,
    pub description: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ClassDoc {
    pub name: String,
    pub description: String,
    pub constructor: Option<FunctionDoc>,
    pub methods: Vec<FunctionDoc>,
    pub properties: Vec<PropertyDoc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct PropertyDoc {
    pub name: String,
    pub type_info: String,
    pub description: String,
    pub access: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct APIDoc {
    pub endpoint: String,
    pub method: String,
    pub description: String,
    pub parameters: Vec<ParameterDoc>,
    pub request_body: Option<String>,
    pub responses: Vec<ResponseDoc>,
    pub security: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ResponseDoc {
    pub status: i32,
    pub description: String,
    pub schema: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct Comment {
    pub line: i32,
    pub text: String,
    pub comment_type: String,
}