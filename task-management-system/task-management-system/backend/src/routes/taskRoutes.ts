import { Router } from 'express';
import { createTask, deleteTask, getTask, listTasks, toggleTask, updateTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listTasks as any));
router.post('/', asyncHandler(createTask as any));
router.get('/:id', asyncHandler(getTask as any));
router.patch('/:id', asyncHandler(updateTask as any));
router.delete('/:id', asyncHandler(deleteTask as any));
router.patch('/:id/toggle', asyncHandler(toggleTask as any));

export default router;

