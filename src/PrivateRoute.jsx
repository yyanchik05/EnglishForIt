import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // 1. Якщо юзера немає взагалі -> на Логін
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 2. Якщо юзер є, АЛЕ пошта не підтверджена -> на сторінку Verification
  // (!currentUser.emailVerified)
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  // 3. Якщо все ок -> показуємо сторінку (Junior/Middle/etc)
  return children;
}