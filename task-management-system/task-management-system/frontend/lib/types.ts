export type User = {
  id: string;
  name: string;
  email: string;
};

export type TaskStatus = 'PENDING' | 'COMPLETED';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskListResponse = {
  items: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
