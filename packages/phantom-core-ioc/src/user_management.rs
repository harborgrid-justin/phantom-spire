// phantom-ioc-core/src/user_management.rs
// RBAC, authentication, and user access control

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// User management engine for authentication and authorization
pub struct UserManagementEngine {
    users: Arc<RwLock<HashMap<String, User>>>,
    roles: Arc<RwLock<HashMap<String, Role>>>,
    permissions: Arc<RwLock<HashMap<String, Permission>>>,
    sessions: Arc<RwLock<HashMap<String, UserSession>>>,
    audit_logs: Arc<RwLock<Vec<UserAuditEvent>>>,
    security_policies: Arc<RwLock<HashMap<String, SecurityPolicy>>>,
    statistics: Arc<RwLock<UserManagementStats>>,
}

impl UserManagementEngine {
    /// Create a new user management engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            users: Arc::new(RwLock::new(HashMap::new())),
            roles: Arc::new(RwLock::new(HashMap::new())),
            permissions: Arc::new(RwLock::new(HashMap::new())),
            sessions: Arc::new(RwLock::new(HashMap::new())),
            audit_logs: Arc::new(RwLock::new(Vec::new())),
            security_policies: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(UserManagementStats::default())),
        };

        // Initialize with default configuration
        engine.initialize_defaults().await?;

        Ok(engine)
    }

    /// Initialize default users, roles, and permissions
    async fn initialize_defaults(&self) -> Result<(), IOCError> {
        // Define default permissions
        let default_permissions = vec![
            Permission {
                id: "ioc_read".to_string(),
                name: "Read IOCs".to_string(),
                description: "View IOC data and analysis".to_string(),
                resource: "ioc".to_string(),
                action: "read".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "ioc_write".to_string(),
                name: "Write IOCs".to_string(),
                description: "Create and update IOC data".to_string(),
                resource: "ioc".to_string(),
                action: "write".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "ioc_delete".to_string(),
                name: "Delete IOCs".to_string(),
                description: "Delete IOC data".to_string(),
                resource: "ioc".to_string(),
                action: "delete".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "threat_hunting".to_string(),
                name: "Threat Hunting".to_string(),
                description: "Execute threat hunting queries".to_string(),
                resource: "threat_hunting".to_string(),
                action: "execute".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "incident_response".to_string(),
                name: "Incident Response".to_string(),
                description: "Manage security incidents".to_string(),
                resource: "incident".to_string(),
                action: "manage".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "compliance_read".to_string(),
                name: "Read Compliance Data".to_string(),
                description: "View compliance reports and data".to_string(),
                resource: "compliance".to_string(),
                action: "read".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "analytics_access".to_string(),
                name: "Analytics Access".to_string(),
                description: "Access analytics and ML features".to_string(),
                resource: "analytics".to_string(),
                action: "access".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "user_management".to_string(),
                name: "User Management".to_string(),
                description: "Manage users and permissions".to_string(),
                resource: "user".to_string(),
                action: "manage".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
            Permission {
                id: "system_admin".to_string(),
                name: "System Administration".to_string(),
                description: "Full system administration access".to_string(),
                resource: "*".to_string(),
                action: "*".to_string(),
                conditions: vec![],
                created_at: Utc::now(),
            },
        ];

        let mut permissions = self.permissions.write().await;
        for permission in default_permissions {
            permissions.insert(permission.id.clone(), permission);
        }
        drop(permissions);

        // Define default roles
        let default_roles = vec![
            Role {
                id: "analyst".to_string(),
                name: "Security Analyst".to_string(),
                description: "Standard security analyst with IOC and threat hunting access".to_string(),
                permissions: vec![
                    "ioc_read".to_string(),
                    "ioc_write".to_string(),
                    "threat_hunting".to_string(),
                    "compliance_read".to_string(),
                ],
                parent_roles: vec![],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            Role {
                id: "senior_analyst".to_string(),
                name: "Senior Security Analyst".to_string(),
                description: "Senior analyst with incident response capabilities".to_string(),
                permissions: vec![
                    "ioc_read".to_string(),
                    "ioc_write".to_string(),
                    "ioc_delete".to_string(),
                    "threat_hunting".to_string(),
                    "incident_response".to_string(),
                    "compliance_read".to_string(),
                    "analytics_access".to_string(),
                ],
                parent_roles: vec!["analyst".to_string()],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            Role {
                id: "security_manager".to_string(),
                name: "Security Manager".to_string(),
                description: "Security team manager with full operational access".to_string(),
                permissions: vec![
                    "ioc_read".to_string(),
                    "ioc_write".to_string(),
                    "ioc_delete".to_string(),
                    "threat_hunting".to_string(),
                    "incident_response".to_string(),
                    "compliance_read".to_string(),
                    "analytics_access".to_string(),
                    "user_management".to_string(),
                ],
                parent_roles: vec!["senior_analyst".to_string()],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            Role {
                id: "system_admin".to_string(),
                name: "System Administrator".to_string(),
                description: "Full system administration access".to_string(),
                permissions: vec!["system_admin".to_string()],
                parent_roles: vec![],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            Role {
                id: "compliance_officer".to_string(),
                name: "Compliance Officer".to_string(),
                description: "Compliance-focused role with audit access".to_string(),
                permissions: vec![
                    "ioc_read".to_string(),
                    "compliance_read".to_string(),
                ],
                parent_roles: vec![],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        ];

        let mut roles = self.roles.write().await;
        for role in default_roles {
            roles.insert(role.id.clone(), role);
        }
        drop(roles);

        // Define default users
        let default_users = vec![
            User {
                id: "admin".to_string(),
                username: "admin".to_string(),
                email: "admin@company.com".to_string(),
                full_name: "System Administrator".to_string(),
                password_hash: "hashed_password".to_string(), // In production, use proper password hashing
                roles: vec!["system_admin".to_string()],
                status: UserStatus::Active,
                mfa_enabled: true,
                mfa_secret: Some("secret".to_string()),
                last_login: None,
                login_attempts: 0,
                locked_until: None,
                password_changed_at: Utc::now(),
                preferences: UserPreferences {
                    timezone: "UTC".to_string(),
                    language: "en".to_string(),
                    notifications_enabled: true,
                    dashboard_layout: "default".to_string(),
                },
                metadata: HashMap::new(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            User {
                id: "analyst1".to_string(),
                username: "john.analyst".to_string(),
                email: "john.analyst@company.com".to_string(),
                full_name: "John Analyst".to_string(),
                password_hash: "hashed_password".to_string(),
                roles: vec!["analyst".to_string()],
                status: UserStatus::Active,
                mfa_enabled: false,
                mfa_secret: None,
                last_login: Some(Utc::now() - Duration::hours(2)),
                login_attempts: 0,
                locked_until: None,
                password_changed_at: Utc::now() - Duration::days(30),
                preferences: UserPreferences {
                    timezone: "America/New_York".to_string(),
                    language: "en".to_string(),
                    notifications_enabled: true,
                    dashboard_layout: "analyst".to_string(),
                },
                metadata: HashMap::from([
                    ("department".to_string(), serde_json::Value::String("Security Operations".to_string())),
                    ("team".to_string(), serde_json::Value::String("SOC Tier 1".to_string())),
                ]),
                created_at: Utc::now() - Duration::days(90),
                updated_at: Utc::now() - Duration::days(30),
            },
            User {
                id: "manager1".to_string(),
                username: "sarah.manager".to_string(),
                email: "sarah.manager@company.com".to_string(),
                full_name: "Sarah Security Manager".to_string(),
                password_hash: "hashed_password".to_string(),
                roles: vec!["security_manager".to_string()],
                status: UserStatus::Active,
                mfa_enabled: true,
                mfa_secret: Some("secret".to_string()),
                last_login: Some(Utc::now() - Duration::minutes(30)),
                login_attempts: 0,
                locked_until: None,
                password_changed_at: Utc::now() - Duration::days(15),
                preferences: UserPreferences {
                    timezone: "America/Los_Angeles".to_string(),
                    language: "en".to_string(),
                    notifications_enabled: true,
                    dashboard_layout: "manager".to_string(),
                },
                metadata: HashMap::from([
                    ("department".to_string(), serde_json::Value::String("Security Operations".to_string())),
                    ("team".to_string(), serde_json::Value::String("Management".to_string())),
                ]),
                created_at: Utc::now() - Duration::days(365),
                updated_at: Utc::now() - Duration::days(15),
            },
        ];

        let mut users = self.users.write().await;
        for user in default_users {
            users.insert(user.id.clone(), user);
        }
        drop(users);

        // Define default security policies
        let default_policies = vec![
            SecurityPolicy {
                id: "password_policy".to_string(),
                name: "Password Policy".to_string(),
                description: "Password complexity and rotation requirements".to_string(),
                policy_type: PolicyType::Password,
                rules: vec![
                    PolicyRule {
                        rule_type: "min_length".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(12)),
                        description: "Minimum password length of 12 characters".to_string(),
                    },
                    PolicyRule {
                        rule_type: "require_uppercase".to_string(),
                        value: serde_json::Value::Bool(true),
                        description: "Require at least one uppercase letter".to_string(),
                    },
                    PolicyRule {
                        rule_type: "require_lowercase".to_string(),
                        value: serde_json::Value::Bool(true),
                        description: "Require at least one lowercase letter".to_string(),
                    },
                    PolicyRule {
                        rule_type: "require_numbers".to_string(),
                        value: serde_json::Value::Bool(true),
                        description: "Require at least one number".to_string(),
                    },
                    PolicyRule {
                        rule_type: "require_special".to_string(),
                        value: serde_json::Value::Bool(true),
                        description: "Require at least one special character".to_string(),
                    },
                    PolicyRule {
                        rule_type: "max_age_days".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(90)),
                        description: "Password must be changed every 90 days".to_string(),
                    },
                ],
                enforcement: PolicyEnforcement::Strict,
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            SecurityPolicy {
                id: "session_policy".to_string(),
                name: "Session Management Policy".to_string(),
                description: "Session timeout and management rules".to_string(),
                policy_type: PolicyType::Session,
                rules: vec![
                    PolicyRule {
                        rule_type: "idle_timeout_minutes".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(30)),
                        description: "Session timeout after 30 minutes of inactivity".to_string(),
                    },
                    PolicyRule {
                        rule_type: "max_session_duration_hours".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(8)),
                        description: "Maximum session duration of 8 hours".to_string(),
                    },
                    PolicyRule {
                        rule_type: "concurrent_sessions".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(3)),
                        description: "Maximum 3 concurrent sessions per user".to_string(),
                    },
                ],
                enforcement: PolicyEnforcement::Strict,
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            SecurityPolicy {
                id: "access_policy".to_string(),
                name: "Access Control Policy".to_string(),
                description: "Access control and authorization rules".to_string(),
                policy_type: PolicyType::Access,
                rules: vec![
                    PolicyRule {
                        rule_type: "require_mfa_for_admin".to_string(),
                        value: serde_json::Value::Bool(true),
                        description: "Require MFA for administrative roles".to_string(),
                    },
                    PolicyRule {
                        rule_type: "failed_login_threshold".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(5)),
                        description: "Lock account after 5 failed login attempts".to_string(),
                    },
                    PolicyRule {
                        rule_type: "lockout_duration_minutes".to_string(),
                        value: serde_json::Value::Number(serde_json::Number::from(15)),
                        description: "Account lockout duration of 15 minutes".to_string(),
                    },
                ],
                enforcement: PolicyEnforcement::Strict,
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        ];

        let mut policies = self.security_policies.write().await;
        for policy in default_policies {
            policies.insert(policy.id.clone(), policy);
        }

        Ok(())
    }

    /// Authenticate a user
    pub async fn authenticate(&self, username: &str, password: &str, ip_address: Option<String>) -> Result<AuthenticationResult, IOCError> {
        let authentication_time = Utc::now();
        
        // Find user
        let user = {
            let users = self.users.read().await;
            users.values()
                .find(|u| u.username == username)
                .cloned()
        };

        let user = match user {
            Some(u) => u,
            None => {
                self.log_auth_event(AuthEventType::LoginFailed, username, "User not found", ip_address.as_deref()).await;
                return Ok(AuthenticationResult {
                    success: false,
                    user_id: None,
                    session_token: None,
                    mfa_required: false,
                    error_message: Some("Invalid credentials".to_string()),
                    authentication_time,
                });
            }
        };

        // Check if user is active
        if user.status != UserStatus::Active {
            self.log_auth_event(AuthEventType::LoginFailed, username, "Account inactive", ip_address.as_deref()).await;
            return Ok(AuthenticationResult {
                success: false,
                user_id: Some(user.id.clone()),
                session_token: None,
                mfa_required: false,
                error_message: Some("Account is not active".to_string()),
                authentication_time,
            });
        }

        // Check if user is locked
        if let Some(locked_until) = user.locked_until {
            if locked_until > authentication_time {
                self.log_auth_event(AuthEventType::LoginFailed, username, "Account locked", ip_address.as_deref()).await;
                return Ok(AuthenticationResult {
                    success: false,
                    user_id: Some(user.id.clone()),
                    session_token: None,
                    mfa_required: false,
                    error_message: Some("Account is temporarily locked".to_string()),
                    authentication_time,
                });
            }
        }

        // Verify password (simplified - in production, use proper password hashing)
        if !self.verify_password(password, &user.password_hash) {
            // Increment failed login attempts
            self.increment_failed_login_attempts(&user.id).await?;
            
            self.log_auth_event(AuthEventType::LoginFailed, username, "Invalid password", ip_address.as_deref()).await;
            return Ok(AuthenticationResult {
                success: false,
                user_id: Some(user.id.clone()),
                session_token: None,
                mfa_required: false,
                error_message: Some("Invalid credentials".to_string()),
                authentication_time,
            });
        }

        // Check if MFA is required
        let mfa_required = user.mfa_enabled || self.is_mfa_required_for_user(&user).await;
        
        if mfa_required && user.mfa_secret.is_none() {
            return Ok(AuthenticationResult {
                success: false,
                user_id: Some(user.id.clone()),
                session_token: None,
                mfa_required: true,
                error_message: Some("MFA setup required".to_string()),
                authentication_time,
            });
        }

        // Reset failed login attempts on successful password verification
        self.reset_failed_login_attempts(&user.id).await?;

        // For MFA-enabled users, return partial success
        if mfa_required {
            self.log_auth_event(AuthEventType::LoginPartial, username, "Password verified, MFA required", ip_address.as_deref()).await;
            return Ok(AuthenticationResult {
                success: false,
                user_id: Some(user.id.clone()),
                session_token: None,
                mfa_required: true,
                error_message: None,
                authentication_time,
            });
        }

        // Create session for non-MFA users
        let session = self.create_user_session(&user, ip_address).await?;
        
        self.log_auth_event(AuthEventType::LoginSuccess, username, "Authentication successful", ip_address.as_deref()).await;

        // Update user's last login
        self.update_user_last_login(&user.id, authentication_time).await?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.successful_logins += 1;
            stats.last_login = Some(authentication_time);
        }

        Ok(AuthenticationResult {
            success: true,
            user_id: Some(user.id),
            session_token: Some(session.token),
            mfa_required: false,
            error_message: None,
            authentication_time,
        })
    }

    /// Verify MFA token
    pub async fn verify_mfa(&self, user_id: &str, mfa_token: &str, ip_address: Option<String>) -> Result<AuthenticationResult, IOCError> {
        let user = {
            let users = self.users.read().await;
            users.get(user_id).cloned()
                .ok_or_else(|| IOCError::Authentication("User not found".to_string()))?
        };

        // Verify MFA token (simplified - in production, use proper TOTP verification)
        if !self.verify_mfa_token(&user, mfa_token) {
            self.log_auth_event(AuthEventType::MfaFailed, &user.username, "Invalid MFA token", ip_address.as_deref()).await;
            return Ok(AuthenticationResult {
                success: false,
                user_id: Some(user.id.clone()),
                session_token: None,
                mfa_required: true,
                error_message: Some("Invalid MFA token".to_string()),
                authentication_time: Utc::now(),
            });
        }

        // Create session
        let session = self.create_user_session(&user, ip_address).await?;
        
        self.log_auth_event(AuthEventType::LoginSuccess, &user.username, "MFA verification successful", ip_address.as_deref()).await;

        Ok(AuthenticationResult {
            success: true,
            user_id: Some(user.id),
            session_token: Some(session.token),
            mfa_required: false,
            error_message: None,
            authentication_time: Utc::now(),
        })
    }

    /// Check if user has permission for an action
    pub async fn check_permission(&self, user_id: &str, resource: &str, action: &str) -> Result<bool, IOCError> {
        let user = {
            let users = self.users.read().await;
            users.get(user_id).cloned()
                .ok_or_else(|| IOCError::Authentication("User not found".to_string()))?
        };

        // Get all permissions for the user's roles
        let user_permissions = self.get_user_permissions(&user).await?;

        // Check if user has the specific permission
        for permission in &user_permissions {
            if (permission.resource == "*" || permission.resource == resource) &&
               (permission.action == "*" || permission.action == action) {
                return Ok(true);
            }
        }

        // Log access denied
        self.log_auth_event(
            AuthEventType::AccessDenied,
            &user.username,
            &format!("Access denied for {}:{}", resource, action),
            None
        ).await;

        Ok(false)
    }

    /// Get user permissions
    async fn get_user_permissions(&self, user: &User) -> Result<Vec<Permission>, IOCError> {
        let roles = self.roles.read().await;
        let permissions = self.permissions.read().await;
        let mut user_permissions = Vec::new();

        for role_id in &user.roles {
            if let Some(role) = roles.get(role_id) {
                // Get direct permissions
                for permission_id in &role.permissions {
                    if let Some(permission) = permissions.get(permission_id) {
                        user_permissions.push(permission.clone());
                    }
                }

                // Get inherited permissions from parent roles
                user_permissions.extend(self.get_inherited_permissions(role, &roles, &permissions));
            }
        }

        // Remove duplicates
        user_permissions.sort_by(|a, b| a.id.cmp(&b.id));
        user_permissions.dedup_by(|a, b| a.id == b.id);

        Ok(user_permissions)
    }

    /// Get inherited permissions from parent roles
    fn get_inherited_permissions(&self, role: &Role, roles: &HashMap<String, Role>, permissions: &HashMap<String, Permission>) -> Vec<Permission> {
        let mut inherited = Vec::new();

        for parent_role_id in &role.parent_roles {
            if let Some(parent_role) = roles.get(parent_role_id) {
                // Get permissions from parent role
                for permission_id in &parent_role.permissions {
                    if let Some(permission) = permissions.get(permission_id) {
                        inherited.push(permission.clone());
                    }
                }

                // Recursively get permissions from parent's parents
                inherited.extend(self.get_inherited_permissions(parent_role, roles, permissions));
            }
        }

        inherited
    }

    /// Create a user session
    async fn create_user_session(&self, user: &User, ip_address: Option<String>) -> Result<UserSession, IOCError> {
        let session_token = self.generate_session_token();
        let created_at = Utc::now();
        
        // Get session timeout from policy
        let idle_timeout = self.get_session_idle_timeout().await;
        let max_duration = self.get_session_max_duration().await;

        let session = UserSession {
            token: session_token.clone(),
            user_id: user.id.clone(),
            created_at,
            expires_at: created_at + max_duration,
            last_activity: created_at,
            idle_timeout,
            ip_address,
            user_agent: None, // Would be populated from request headers
            active: true,
        };

        // Store session
        {
            let mut sessions = self.sessions.write().await;
            sessions.insert(session_token.clone(), session.clone());
        }

        Ok(session)
    }

    /// Validate a session token
    pub async fn validate_session(&self, token: &str) -> Result<Option<User>, IOCError> {
        let session = {
            let sessions = self.sessions.read().await;
            sessions.get(token).cloned()
        };

        let session = match session {
            Some(s) => s,
            None => return Ok(None),
        };

        let now = Utc::now();

        // Check if session is expired
        if session.expires_at <= now {
            self.invalidate_session(token).await?;
            return Ok(None);
        }

        // Check if session is idle
        if session.last_activity + session.idle_timeout <= now {
            self.invalidate_session(token).await?;
            return Ok(None);
        }

        // Update last activity
        {
            let mut sessions = self.sessions.write().await;
            if let Some(session_mut) = sessions.get_mut(token) {
                session_mut.last_activity = now;
            }
        }

        // Get user
        let users = self.users.read().await;
        let user = users.get(&session.user_id).cloned();

        Ok(user)
    }

    /// Invalidate a session
    pub async fn invalidate_session(&self, token: &str) -> Result<(), IOCError> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.remove(token) {
            self.log_auth_event(
                AuthEventType::Logout,
                &session.user_id,
                "Session invalidated",
                session.ip_address.as_deref()
            ).await;
        }
        Ok(())
    }

    /// Create a new user
    pub async fn create_user(&self, user_data: CreateUserRequest) -> Result<String, IOCError> {
        // Validate password against policy
        self.validate_password(&user_data.password).await?;

        // Check if username already exists
        {
            let users = self.users.read().await;
            if users.values().any(|u| u.username == user_data.username) {
                return Err(IOCError::Validation("Username already exists".to_string()));
            }
        }

        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let user = User {
            id: user_id.clone(),
            username: user_data.username.clone(),
            email: user_data.email.clone(),
            full_name: user_data.full_name.clone(),
            password_hash: self.hash_password(&user_data.password),
            roles: user_data.roles.clone(),
            status: UserStatus::Active,
            mfa_enabled: false,
            mfa_secret: None,
            last_login: None,
            login_attempts: 0,
            locked_until: None,
            password_changed_at: now,
            preferences: UserPreferences {
                timezone: "UTC".to_string(),
                language: "en".to_string(),
                notifications_enabled: true,
                dashboard_layout: "default".to_string(),
            },
            metadata: HashMap::new(),
            created_at: now,
            updated_at: now,
        };

        // Store user
        {
            let mut users = self.users.write().await;
            users.insert(user_id.clone(), user);
        }

        self.log_auth_event(AuthEventType::UserCreated, &user_data.username, "User created", None).await;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_users += 1;
        }

        Ok(user_id)
    }

    /// Update user roles
    pub async fn update_user_roles(&self, user_id: &str, roles: Vec<String>) -> Result<(), IOCError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(user_id) {
            user.roles = roles;
            user.updated_at = Utc::now();
            
            self.log_auth_event(AuthEventType::RoleChanged, &user.username, "User roles updated", None).await;
        } else {
            return Err(IOCError::Authentication("User not found".to_string()));
        }
        Ok(())
    }

    /// Helper methods
    fn verify_password(&self, password: &str, hash: &str) -> bool {
        // Simplified password verification - use proper bcrypt in production
        password == "password" || hash == "hashed_password"
    }

    async fn is_mfa_required_for_user(&self, user: &User) -> bool {
        // Check if any of the user's roles require MFA
        let policies = self.security_policies.read().await;
        if let Some(access_policy) = policies.get("access_policy") {
            if let Some(rule) = access_policy.rules.iter().find(|r| r.rule_type == "require_mfa_for_admin") {
                if rule.value.as_bool().unwrap_or(false) {
                    // Check if user has admin roles
                    return user.roles.contains(&"system_admin".to_string()) || user.roles.contains(&"security_manager".to_string());
                }
            }
        }
        false
    }

    fn verify_mfa_token(&self, user: &User, token: &str) -> bool {
        // Simplified MFA verification - use proper TOTP in production
        token == "123456" || token.len() == 6
    }

    fn generate_session_token(&self) -> String {
        Uuid::new_v4().to_string()
    }

    async fn get_session_idle_timeout(&self) -> Duration {
        let policies = self.security_policies.read().await;
        if let Some(session_policy) = policies.get("session_policy") {
            if let Some(rule) = session_policy.rules.iter().find(|r| r.rule_type == "idle_timeout_minutes") {
                if let Some(minutes) = rule.value.as_f64() {
                    return Duration::minutes(minutes as i64);
                }
            }
        }
        Duration::minutes(30) // Default
    }

    async fn get_session_max_duration(&self) -> Duration {
        let policies = self.security_policies.read().await;
        if let Some(session_policy) = policies.get("session_policy") {
            if let Some(rule) = session_policy.rules.iter().find(|r| r.rule_type == "max_session_duration_hours") {
                if let Some(hours) = rule.value.as_f64() {
                    return Duration::hours(hours as i64);
                }
            }
        }
        Duration::hours(8) // Default
    }

    async fn increment_failed_login_attempts(&self, user_id: &str) -> Result<(), IOCError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(user_id) {
            user.login_attempts += 1;
            
            // Check if should lock account
            let threshold = self.get_failed_login_threshold().await;
            if user.login_attempts >= threshold {
                let lockout_duration = self.get_lockout_duration().await;
                user.locked_until = Some(Utc::now() + lockout_duration);
                user.login_attempts = 0; // Reset after locking
            }
        }
        Ok(())
    }

    async fn reset_failed_login_attempts(&self, user_id: &str) -> Result<(), IOCError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(user_id) {
            user.login_attempts = 0;
            user.locked_until = None;
        }
        Ok(())
    }

    async fn update_user_last_login(&self, user_id: &str, login_time: DateTime<Utc>) -> Result<(), IOCError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(user_id) {
            user.last_login = Some(login_time);
        }
        Ok(())
    }

    async fn get_failed_login_threshold(&self) -> u32 {
        let policies = self.security_policies.read().await;
        if let Some(access_policy) = policies.get("access_policy") {
            if let Some(rule) = access_policy.rules.iter().find(|r| r.rule_type == "failed_login_threshold") {
                return rule.value.as_f64().unwrap_or(5.0) as u32;
            }
        }
        5 // Default
    }

    async fn get_lockout_duration(&self) -> Duration {
        let policies = self.security_policies.read().await;
        if let Some(access_policy) = policies.get("access_policy") {
            if let Some(rule) = access_policy.rules.iter().find(|r| r.rule_type == "lockout_duration_minutes") {
                return Duration::minutes(rule.value.as_f64().unwrap_or(15.0) as i64);
            }
        }
        Duration::minutes(15) // Default
    }

    async fn validate_password(&self, password: &str) -> Result<(), IOCError> {
        let policies = self.security_policies.read().await;
        if let Some(password_policy) = policies.get("password_policy") {
            for rule in &password_policy.rules {
                match rule.rule_type.as_str() {
                    "min_length" => {
                        let min_length = rule.value.as_f64().unwrap_or(8.0) as usize;
                        if password.len() < min_length {
                            return Err(IOCError::Validation(format!("Password must be at least {} characters", min_length)));
                        }
                    }
                    "require_uppercase" => {
                        if rule.value.as_bool().unwrap_or(false) && !password.chars().any(|c| c.is_uppercase()) {
                            return Err(IOCError::Validation("Password must contain at least one uppercase letter".to_string()));
                        }
                    }
                    "require_lowercase" => {
                        if rule.value.as_bool().unwrap_or(false) && !password.chars().any(|c| c.is_lowercase()) {
                            return Err(IOCError::Validation("Password must contain at least one lowercase letter".to_string()));
                        }
                    }
                    "require_numbers" => {
                        if rule.value.as_bool().unwrap_or(false) && !password.chars().any(|c| c.is_numeric()) {
                            return Err(IOCError::Validation("Password must contain at least one number".to_string()));
                        }
                    }
                    "require_special" => {
                        if rule.value.as_bool().unwrap_or(false) && !password.chars().any(|c| !c.is_alphanumeric()) {
                            return Err(IOCError::Validation("Password must contain at least one special character".to_string()));
                        }
                    }
                    _ => {}
                }
            }
        }
        Ok(())
    }

    fn hash_password(&self, password: &str) -> String {
        // Simplified password hashing - use proper bcrypt in production
        format!("hashed_{}", password)
    }

    async fn log_auth_event(&self, event_type: AuthEventType, username: &str, details: &str, ip_address: Option<&str>) {
        let event = UserAuditEvent {
            id: Uuid::new_v4().to_string(),
            event_type,
            username: username.to_string(),
            timestamp: Utc::now(),
            ip_address: ip_address.map(|s| s.to_string()),
            details: details.to_string(),
        };

        let mut logs = self.audit_logs.write().await;
        logs.push(event);

        // Keep only last 10,000 events
        if logs.len() > 10_000 {
            logs.drain(0..5_000);
        }
    }

    /// Get user management statistics
    pub async fn get_statistics(&self) -> UserManagementStats {
        let mut stats = self.statistics.read().await.clone();
        
        // Update current counts
        let users = self.users.read().await;
        let sessions = self.sessions.read().await;
        
        stats.total_users = users.len() as u64;
        stats.active_users = users.values().filter(|u| u.status == UserStatus::Active).count() as u64;
        stats.active_sessions = sessions.len() as u64;
        
        stats
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.get_statistics().await;
        let policies = self.security_policies.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("User management operational with {} users and {} policies", stats.total_users, policies.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_users".to_string(), stats.total_users as f64),
                ("active_users".to_string(), stats.active_users as f64),
                ("active_sessions".to_string(), stats.active_sessions as f64),
                ("successful_logins".to_string(), stats.successful_logins as f64),
                ("failed_logins".to_string(), stats.failed_logins as f64),
            ]),
        }
    }
}

// User management data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub full_name: String,
    pub password_hash: String,
    pub roles: Vec<String>,
    pub status: UserStatus,
    pub mfa_enabled: bool,
    pub mfa_secret: Option<String>,
    pub last_login: Option<DateTime<Utc>>,
    pub login_attempts: u32,
    pub locked_until: Option<DateTime<Utc>>,
    pub password_changed_at: DateTime<Utc>,
    pub preferences: UserPreferences,
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserStatus {
    Active,
    Inactive,
    Suspended,
    Locked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    pub timezone: String,
    pub language: String,
    pub notifications_enabled: bool,
    pub dashboard_layout: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub parent_roles: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub id: String,
    pub name: String,
    pub description: String,
    pub resource: String,
    pub action: String,
    pub conditions: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSession {
    pub token: String,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub idle_timeout: Duration,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub policy_type: PolicyType,
    pub rules: Vec<PolicyRule>,
    pub enforcement: PolicyEnforcement,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyType {
    Password,
    Session,
    Access,
    Audit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyRule {
    pub rule_type: String,
    pub value: serde_json::Value,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyEnforcement {
    Strict,
    Warn,
    Advisory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
    pub full_name: String,
    pub password: String,
    pub roles: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationResult {
    pub success: bool,
    pub user_id: Option<String>,
    pub session_token: Option<String>,
    pub mfa_required: bool,
    pub error_message: Option<String>,
    pub authentication_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAuditEvent {
    pub id: String,
    pub event_type: AuthEventType,
    pub username: String,
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthEventType {
    LoginSuccess,
    LoginFailed,
    LoginPartial,
    MfaFailed,
    Logout,
    AccessDenied,
    UserCreated,
    UserDeleted,
    RoleChanged,
    PasswordChanged,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct UserManagementStats {
    pub total_users: u64,
    pub active_users: u64,
    pub inactive_users: u64,
    pub locked_users: u64,
    pub active_sessions: u64,
    pub successful_logins: u64,
    pub failed_logins: u64,
    pub last_login: Option<DateTime<Utc>>,
}