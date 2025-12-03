import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}