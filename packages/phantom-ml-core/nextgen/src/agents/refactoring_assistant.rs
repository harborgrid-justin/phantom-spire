use napi_derive::napi;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone)]
#[napi]
pub struct RefactoringAssistantAgent {
    name: String,
    version: String,
}

#[napi]
impl RefactoringAssistantAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "RefactoringAssistantAgent".to_string(),
            version: "1.0.0".to_string(),
        }
    }

    #[napi]
    pub fn analyze_code_smells(&self, code: String) -> Vec<CodeSmell> {
        let mut smells = Vec::new();

        if code.lines().any(|l| l.len() > 120) {
            smells.push(CodeSmell {
                smell_type: "Long Line".to_string(),
                severity: "LOW".to_string(),
                description: "Line exceeds 120 characters".to_string(),
                suggestion: "Break long lines into multiple lines".to_string(),
            });
        }

        let func_regex = Regex::new(r"function\s+\w+\s*\([^)]*\)\s*\{").unwrap();
        for cap in func_regex.find_iter(&code) {
            let func_start = cap.start();
            let func_code = &code[func_start..];
            let lines_count = func_code.lines().take_while(|l| !l.contains("}")).count();

            if lines_count > 50 {
                smells.push(CodeSmell {
                    smell_type: "Long Function".to_string(),
                    severity: "MEDIUM".to_string(),
                    description: "Function exceeds 50 lines".to_string(),
                    suggestion: "Extract smaller functions".to_string(),
                });
            }
        }

        if code.matches("if").count() > 5 {
            smells.push(CodeSmell {
                smell_type: "Complex Conditional".to_string(),
                severity: "MEDIUM".to_string(),
                description: "Too many conditional statements".to_string(),
                suggestion: "Consider using polymorphism or strategy pattern".to_string(),
            });
        }

        smells
    }

    #[napi]
    pub fn suggest_refactoring(&self, code: String) -> Vec<RefactoringSuggestion> {
        let mut suggestions = Vec::new();

        if code.contains("var ") {
            suggestions.push(RefactoringSuggestion {
                refactoring_type: "Modernize Variables".to_string(),
                description: "Replace 'var' with 'const' or 'let'".to_string(),
                before: "var x = 5;".to_string(),
                after: "const x = 5;".to_string(),
                impact: "Improves code clarity and prevents hoisting issues".to_string(),
            });
        }

        if code.contains("function(") && code.contains("return") {
            suggestions.push(RefactoringSuggestion {
                refactoring_type: "Arrow Functions".to_string(),
                description: "Convert to arrow function".to_string(),
                before: "function(x) { return x * 2; }".to_string(),
                after: "(x) => x * 2".to_string(),
                impact: "More concise syntax".to_string(),
            });
        }

        if code.contains("for (") && code.contains(".length") {
            suggestions.push(RefactoringSuggestion {
                refactoring_type: "Modern Iteration".to_string(),
                description: "Use array methods instead of for loops".to_string(),
                before: "for loop with array".to_string(),
                after: "array.forEach() or array.map()".to_string(),
                impact: "More functional and readable".to_string(),
            });
        }

        suggestions
    }

    #[napi]
    pub fn extract_method(&self, code: String, start_line: i32, end_line: i32) -> ExtractedMethod {
        let lines: Vec<&str> = code.lines().collect();
        let extracted_lines = &lines[(start_line as usize - 1)..(end_line as usize)];
        let extracted_code = extracted_lines.join("\n");

        let mut parameters = Vec::new();
        let var_regex = Regex::new(r"\b([a-zA-Z_]\w*)\b").unwrap();
        for cap in var_regex.captures_iter(&extracted_code) {
            let var_name = cap[1].to_string();
            if !parameters.contains(&var_name) && !["function", "return", "if", "else", "for", "while", "const", "let", "var"].contains(&var_name.as_str()) {
                parameters.push(var_name);
            }
        }

        ExtractedMethod {
            name: "extractedFunction".to_string(),
            parameters: parameters[..parameters.len().min(3)].to_vec(),
            body: extracted_code,
            return_type: "void".to_string(),
        }
    }

    #[napi]
    pub fn rename_variable(&self, code: String, old_name: String, new_name: String) -> String {
        let regex = Regex::new(&format!(r"\b{}\b", regex::escape(&old_name))).unwrap();
        regex.replace_all(&code, new_name.as_str()).to_string()
    }

    #[napi]
    pub fn inline_variable(&self, code: String, variable_name: String) -> String {
        let declaration_regex = Regex::new(&format!(r"(?:const|let|var)\s+{}\s*=\s*([^;]+);", variable_name)).unwrap();

        if let Some(caps) = declaration_regex.captures(&code) {
            let value = &caps[1];
            let without_declaration = declaration_regex.replace(&code, "").to_string();
            let usage_regex = Regex::new(&format!(r"\b{}\b", variable_name)).unwrap();
            usage_regex.replace_all(&without_declaration, value).to_string()
        } else {
            code
        }
    }

    #[napi]
    pub fn generate_refactoring_report(&self, smells: Vec<CodeSmell>, suggestions: Vec<RefactoringSuggestion>) -> String {
        let mut report = String::new();

        report.push_str("# Code Refactoring Report\n\n");

        if !smells.is_empty() {
            report.push_str("## Code Smells Detected\n");
            for smell in smells {
                report.push_str(&format!("- **{}** ({}): {}\n  Suggestion: {}\n",
                    smell.smell_type, smell.severity, smell.description, smell.suggestion));
            }
            report.push_str("\n");
        }

        if !suggestions.is_empty() {
            report.push_str("## Refactoring Suggestions\n");
            for suggestion in suggestions {
                report.push_str(&format!("### {}\n", suggestion.refactoring_type));
                report.push_str(&format!("- {}\n", suggestion.description));
                report.push_str(&format!("- Impact: {}\n\n", suggestion.impact));
            }
        }

        report
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct CodeSmell {
    pub smell_type: String,
    pub severity: String,
    pub description: String,
    pub suggestion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct RefactoringSuggestion {
    pub refactoring_type: String,
    pub description: String,
    pub before: String,
    pub after: String,
    pub impact: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ExtractedMethod {
    pub name: String,
    pub parameters: Vec<String>,
    pub body: String,
    pub return_type: String,
}