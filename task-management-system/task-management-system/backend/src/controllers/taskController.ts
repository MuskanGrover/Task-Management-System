import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/appError';
import type { AuthenticatedRequest } from '../types/express';

const TASK_STATUSES = ['PENDING', 'COMPLETED'] as const;

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.enum(TASK_STATUSES).optional()
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.enum(TASK_STATUSES).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required'
});

const taskIdSchema = z.object({
  id: z.string().min(1)
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(TASK_STATUSES).optional(),
  search: z.string().trim().optional()
});

async function getOwnedTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }
  return task;
}

export async function listTasks(req: AuthenticatedRequest, res: Response) {
  const { page, limit, status, search } = listQuerySchema.parse(req.query);
  const userId = req.user!.userId;

  const where: Record<string, unknown> = {
    userId,
    ...(status ? { status } : {}),
    ...(search ? { title: { contains: search } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.task.count({ where })
  ]);

  return res.json({
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const data = createTaskSchema.parse(req.body);

  const task = await prisma.task.create({
    data: {
      ...data,
      userId,
      description: data.description || null
    }
  });

  return res.status(StatusCodes.CREATED).json({ message: 'Task created', task });
}

export async function getTask(req: AuthenticatedRequest, res: Response) {
  const { id } = taskIdSchema.parse(req.params);
  const task = await getOwnedTask(id, req.user!.userId);
  return res.json(task);
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  const { id } = taskIdSchema.parse(req.params);
  await getOwnedTask(id, req.user!.userId);
  const data = updateTaskSchema.parse(req.body);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      ...(data.description !== undefined ? { description: data.description || null } : {})
    }
  });

  return res.json({ message: 'Task updated', task });
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  const { id } = taskIdSchema.parse(req.params);
  await getOwnedTask(id, req.user!.userId);
  await prisma.task.delete({ where: { id } });
  return res.json({ message: 'Task deleted' });
}

export async function toggleTask(req: AuthenticatedRequest, res: Response) {
  const { id } = taskIdSchema.parse(req.params);
  const existingTask = await getOwnedTask(id, req.user!.userId);

  const task = await prisma.task.update({
    where: { id },
    data: {
      status: existingTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    }
  });

  return res.json({ message: 'Task toggled', task });
}
