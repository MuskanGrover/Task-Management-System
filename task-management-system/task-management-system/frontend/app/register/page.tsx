import AuthForm from '../../components/AuthForm';
import { ToastProvider } from '../../components/ToastProvider';

export default function RegisterPage() {
  return (
    <ToastProvider>
      <AuthForm mode="register" />
    </ToastProvider>
  );
}
