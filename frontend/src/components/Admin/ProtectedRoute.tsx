import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
