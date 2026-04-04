export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskRecord = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  relatedTo?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};
