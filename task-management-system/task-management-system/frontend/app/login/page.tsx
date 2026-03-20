import AuthForm from '../../components/AuthForm';
import { ToastProvider } from '../../components/ToastProvider';

export default function LoginPage() {
  return (
    <ToastProvider>
      <AuthForm mode="login" />
    </ToastProvider>
  );
}
