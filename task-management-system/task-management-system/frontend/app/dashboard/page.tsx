import { ToastProvider } from '../../components/ToastProvider';
import TaskDashboard from '../../components/TaskDashboard';

export default function DashboardPage() {
  return (
    <ToastProvider>
      <TaskDashboard />
    </ToastProvider>
  );
}
