/**
 * Enterprise JWT Authentication Service
 * Provides secure token-based authentication with refresh token rotation
 * and advanced session management for Fortune 100 deployments
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from './audit-logger';
import { EnterpriseErrorManager } from '../services/error-handling/enterprise-error-manager';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticationConfig {
  jwtSecret: string;
  refreshSecret: string;
  accessTokenTTL: number; // seconds
  refreshTokenTTL: number; // seconds
  maxConcurrentSessions: number;
  enableTokenRotation: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number; // seconds
  requireTwoFactor: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isRevoked: boolean;
}

/**
 * Enterprise JWT Authentication Service
 * Provides comprehensive authentication with security best practices
 */
export class JWTAuthenticationService {
  private config: AuthenticationConfig;
  private auditLogger: AuditLogger;
  private errorManager: EnterpriseErrorManager;
  private activeSessions = new Map<string, Session>();
  private refreshTokens = new Map<string, Session>();

  constructor(config: AuthenticationConfig) {
    this.config = {
      maxConcurrentSessions: 5,
      enableTokenRotation: true,
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60, // 15 minutes
      requireTwoFactor: false,
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      ...config
    };

    this.auditLogger = new AuditLogger();
    this.errorManager = new EnterpriseErrorManager();

    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60000); // Every minute
  }

  /**
   * Authenticate user with username/password
   */
  async authenticate(
    username: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    twoFactorToken?: string
  ): Promise<{ success: boolean; tokens?: AuthTokens; user?: User; error?: string }> {
    try {
      // Validate input
      if (!username || !password) {
        await this.auditLogger.logSecurityEvent('authentication_failed', {
          reason: 'missing_credentials',
          username,
          ipAddress
        });
        return { success: false, error: 'Username and password are required' };
      }

      // Get user (this would typically query a database)
      const user = await this.getUserByUsername(username);
      if (!user) {
        await this.auditLogger.logSecurityEvent('authentication_failed', {
          reason: 'user_not_found',
          username,
          ipAddress
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await this.auditLogger.logSecurityEvent('authentication_failed', {
          reason: 'account_locked',
          username,
          ipAddress,
          lockedUntil: user.lockedUntil
        });
        return { success: false, error: 'Account is temporarily locked' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, await this.getPasswordHash(user.id));
      if (!isValidPassword) {
        await this.handleFailedLogin(user, ipAddress);
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is active
      if (!user.isActive) {
        await this.auditLogger.logSecurityEvent('authentication_failed', {
          reason: 'account_inactive',
          username,
          ipAddress
        });
        return { success: false, error: 'Account is inactive' };
      }

      // Verify two-factor authentication if required
      if (user.twoFactorEnabled && !twoFactorToken) {
        return { success: false, error: 'Two-factor authentication token required' };
      }

      if (user.twoFactorEnabled && twoFactorToken) {
        const isValidTwoFactor = await this.verifyTwoFactorToken(user.id, twoFactorToken);
        if (!isValidTwoFactor) {
          await this.auditLogger.logSecurityEvent('authentication_failed', {
            reason: 'invalid_2fa_token',
            username,
            ipAddress
          });
          return { success: false, error: 'Invalid two-factor authentication token' };
        }
      }

      // Reset failed login attempts on successful authentication
      await this.resetFailedLoginAttempts(user.id);

      // Check concurrent sessions limit
      const userSessions = Array.from(this.activeSessions.values())
        .filter(session => session.userId === user.id && !session.isRevoked);

      if (userSessions.length >= this.config.maxConcurrentSessions) {
        // Revoke oldest session
        const oldestSession = userSessions
          .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())[0];
        await this.revokeSession(oldestSession.id);
      }

      // Create new session
      const session = await this.createSession(user.id, ipAddress, userAgent);

      // Generate tokens
      const tokens = await this.generateTokens(user, session.id);

      // Update last login
      await this.updateLastLogin(user.id);

      await this.auditLogger.logSecurityEvent('authentication_success', {
        userId: user.id,
        username: user.username,
        sessionId: session.id,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        tokens,
        user: this.sanitizeUser(user)
      };

    } catch (error) {
      await this.auditLogger.logSecurityEvent('authentication_error', {
        username,
        ipAddress,
        error: error.message
      });
      throw this.errorManager.createError('AuthenticationError', 'Authentication failed', { username });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, ipAddress: string): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.config.refreshSecret) as JWTPayload;

      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Get session
      const session = this.refreshTokens.get(refreshToken);
      if (!session || session.isRevoked) {
        await this.auditLogger.logSecurityEvent('token_refresh_failed', {
          reason: 'invalid_refresh_token',
          sessionId: payload.sessionId,
          ipAddress
        });
        return { success: false, error: 'Invalid refresh token' };
      }

      // Get user
      const user = await this.getUserById(payload.userId);
      if (!user || !user.isActive) {
        await this.revokeSession(session.id);
        return { success: false, error: 'User not found or inactive' };
      }

      // Update session activity
      session.lastActivity = new Date();

      // Generate new tokens if rotation is enabled
      let newTokens: AuthTokens;
      if (this.config.enableTokenRotation) {
        // Revoke old refresh token
        this.refreshTokens.delete(refreshToken);
        
        // Generate new token pair
        newTokens = await this.generateTokens(user, session.id);
      } else {
        // Generate new access token only
        const accessToken = await this.generateAccessToken(user, session.id);
        newTokens = {
          accessToken,
          refreshToken, // Keep existing refresh token
          expiresIn: this.config.accessTokenTTL,
          tokenType: 'Bearer'
        };
      }

      await this.auditLogger.logSecurityEvent('token_refresh_success', {
        userId: user.id,
        sessionId: session.id,
        ipAddress,
        tokenRotated: this.config.enableTokenRotation
      });

      return { success: true, tokens: newTokens };

    } catch (error) {
      await this.auditLogger.logSecurityEvent('token_refresh_error', {
        ipAddress,
        error: error.message
      });

      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'Refresh token expired' };
      }

      return { success: false, error: 'Invalid refresh token' };
    }
  }

  /**
   * Middleware for JWT authentication
   */
  authenticateMiddleware = (requiredPermissions?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Access token required' });
        }

        const token = authHeader.substring(7);
        const payload = jwt.verify(token, this.config.jwtSecret) as JWTPayload;

        if (payload.tokenType !== 'access') {
          return res.status(401).json({ error: 'Invalid token type' });
        }

        // Check if session is still active
        const session = this.activeSessions.get(payload.sessionId);
        if (!session || session.isRevoked) {
          return res.status(401).json({ error: 'Session expired' });
        }

        // Update session activity
        session.lastActivity = new Date();

        // Check permissions if required
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.every(permission =>
            payload.permissions.includes(permission)
          );

          if (!hasPermission) {
            await this.auditLogger.logSecurityEvent('authorization_failed', {
              userId: payload.userId,
              requiredPermissions,
              userPermissions: payload.permissions,
              ipAddress: req.ip
            });
            return res.status(403).json({ error: 'Insufficient permissions' });
          }
        }

        // Add user context to request
        req.user = {
          id: payload.userId,
          username: payload.username,
          roles: payload.roles,
          permissions: payload.permissions,
          sessionId: payload.sessionId
        };

        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Access token expired' });
        }

        return res.status(401).json({ error: 'Invalid access token' });
      }
    };
  };

  /**
   * Revoke session and all associated tokens
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isRevoked = true;
      this.activeSessions.delete(sessionId);
      this.refreshTokens.delete(session.refreshToken);

      await this.auditLogger.logSecurityEvent('session_revoked', {
        sessionId,
        userId: session.userId
      });

      return true;
    }
    return false;
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string): Promise<number> {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && !session.isRevoked);

    let revokedCount = 0;
    for (const session of userSessions) {
      if (await this.revokeSession(session.id)) {
        revokedCount++;
      }
    }

    await this.auditLogger.logSecurityEvent('all_sessions_revoked', {
      userId,
      revokedCount
    });

    return revokedCount;
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    createdAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
  }>> {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && !session.isRevoked)
      .map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      }));
  }

  // Private helper methods

  private async createSession(userId: string, ipAddress: string, userAgent: string): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      refreshToken: '', // Will be set when generating tokens
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress,
      userAgent,
      isRevoked: false
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  private async generateTokens(user: User, sessionId: string): Promise<AuthTokens> {
    const accessToken = await this.generateAccessToken(user, sessionId);
    const refreshToken = await this.generateRefreshToken(user, sessionId);

    // Update session with refresh token
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.refreshToken = refreshToken;
      this.refreshTokens.set(refreshToken, session);
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTTL,
      tokenType: 'Bearer'
    };
  }

  private async generateAccessToken(user: User, sessionId: string): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
      sessionId,
      tokenType: 'access'
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.accessTokenTTL
    });
  }

  private async generateRefreshToken(user: User, sessionId: string): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
      sessionId,
      tokenType: 'refresh'
    };

    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshTokenTTL
    });
  }

  private async handleFailedLogin(user: User, ipAddress: string): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.config.maxFailedAttempts) {
      user.lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 1000);
      
      await this.auditLogger.logSecurityEvent('account_locked', {
        userId: user.id,
        username: user.username,
        failedAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        ipAddress
      });
    } else {
      await this.auditLogger.logSecurityEvent('authentication_failed', {
        reason: 'invalid_password',
        userId: user.id,
        username: user.username,
        failedAttempts: user.failedLoginAttempts,
        ipAddress
      });
    }

    // Update user in database (implementation depends on your storage)
    await this.updateUser(user);
  }

  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    // Implementation depends on your storage
    // This would reset failedLoginAttempts to 0 and clear lockedUntil
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // Implementation depends on your storage
    // This would update the user's lastLogin timestamp
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions = Array.from(this.activeSessions.values())
      .filter(session => {
        const inactivityLimit = new Date(session.lastActivity.getTime() + (this.config.refreshTokenTTL * 1000));
        return inactivityLimit < now;
      });

    for (const session of expiredSessions) {
      await this.revokeSession(session.id);
    }
  }

  private sanitizeUser(user: User): Omit<User, 'failedLoginAttempts' | 'lockedUntil'> {
    const { failedLoginAttempts, lockedUntil, ...sanitized } = user;
    return sanitized;
  }

  private async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    // Implementation for 2FA verification (TOTP, SMS, etc.)
    // This is a placeholder - implement according to your 2FA strategy
    return true;
  }

  // Mock database operations - implement these according to your storage solution
  private async getUserByUsername(username: string): Promise<User | null> {
    // Mock implementation - replace with actual database query
    return null;
  }

  private async getUserById(userId: string): Promise<User | null> {
    // Mock implementation - replace with actual database query
    return null;
  }

  private async getPasswordHash(userId: string): Promise<string> {
    // Mock implementation - replace with actual database query
    return '';
  }

  private async updateUser(user: User): Promise<void> {
    // Mock implementation - replace with actual database update
  }
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        roles: string[];
        permissions: string[];
        sessionId: string;
      };
    }
  }
}

export default JWTAuthenticationService;