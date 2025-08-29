import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config/config';
import { asyncHandler } from '../middleware/errorHandler';
import { LoginRequest, RegisterRequest, ApiResponse } from '../types/api';
import { logger } from '../utils/logger';

// JWT signing helper function
const signJWT = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName, role }: RegisterRequest =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User already exists',
      } as ApiResponse);
      return;
    }

    // Create new user
    const user: IUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'viewer',
    });

    await user.save();

    // Generate JWT token
    const token = signJWT({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
      message: 'User registered successfully',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginRequest = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email, isActive: true }).select(
      '+password'
    );
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      } as ApiResponse);
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = signJWT({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: user.toJSON(), // This will exclude the password
        token,
      },
      message: 'Login successful',
    } as ApiResponse);
  }
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id);

  res.json({
    success: true,
    data: user,
  } as ApiResponse);
});
