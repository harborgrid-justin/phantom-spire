import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAdminConsole:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, pending, inactive, suspended, draft]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/user-management/user-admin-console:
 *   get:
 *     summary: Get all user admin console items
 *     tags: [User Admin Console]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, inactive, suspended, draft]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of user admin console items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAdminConsole'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
export const getAllUserAdminConsole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 10, status } = req.query;
    
    // Mock data for now - replace with actual database queries
    const mockData = [
      {
        _id: '1',
        name: 'Sample User Admin Console',
        description: 'Sample description for user admin console',
        status: 'active',
        priority: 'medium',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: mockData.length,
        pages: Math.ceil(mockData.length / parseInt(limit as string))
      }
    });
  }
);

/**
 * @swagger
 * /api/user-management/user-admin-console:
 *   post:
 *     summary: Create new user admin console item
 *     tags: [User Admin Console]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, inactive, suspended, draft]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: User Admin Console item created successfully
 */
export const createUserAdminConsole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, description, status = 'active', priority = 'medium', metadata = {} } = req.body;

    // Mock creation - replace with actual database operations
    const newItem = {
      _id: Date.now().toString(),
      name,
      description,
      status,
      priority,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.id
    };

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'User Admin Console created successfully'
    });
  }
);

/**
 * @swagger
 * /api/user-management/user-admin-console/{id}:
 *   get:
 *     summary: Get user admin console item by ID
 *     tags: [User Admin Console]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User Admin Console item details
 */
export const getUserAdminConsoleById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Mock data - replace with actual database query
    const mockItem = {
      _id: id,
      name: 'Sample User Admin Console',
      description: 'Sample description for user admin console',
      status: 'active',
      priority: 'medium',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockItem
    });
  }
);

/**
 * @swagger
 * /api/user-management/user-admin-console/{id}:
 *   put:
 *     summary: Update user admin console item
 *     tags: [User Admin Console]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, inactive, suspended, draft]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: User Admin Console item updated successfully
 */
export const updateUserAdminConsole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, status, priority, metadata } = req.body;

    // Mock update - replace with actual database operations
    const updatedItem = {
      _id: id,
      name,
      description,
      status,
      priority,
      metadata,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
      updatedBy: req.user!.id
    };

    res.json({
      success: true,
      data: updatedItem,
      message: 'User Admin Console updated successfully'
    });
  }
);

/**
 * @swagger
 * /api/user-management/user-admin-console/{id}:
 *   delete:
 *     summary: Delete user admin console item
 *     tags: [User Admin Console]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User Admin Console item deleted successfully
 */
export const deleteUserAdminConsole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Mock deletion - replace with actual database operations
    res.json({
      success: true,
      message: 'User Admin Console deleted successfully',
      data: { id, deletedAt: new Date().toISOString() }
    });
  }
);

export const userAdminConsoleController = {
  getAllUserAdminConsole,
  createUserAdminConsole,
  getUserAdminConsoleById,
  updateUserAdminConsole,
  deleteUserAdminConsole
};
