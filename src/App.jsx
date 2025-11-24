import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Імпортуємо провайдер
import PrivateRoute from './PrivateRoute'; // Імпортуємо охоронця

import HomePage from './HomePage';
import PracticePage from './PracticePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

function App() {
  return (
    // Обгортаємо ВЕСЬ додаток в AuthProvider, щоб юзер був доступний всюди
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публічні сторінки */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Приватні сторінки (ЗАХИЩЕНІ) */}
          <Route 
            path="/junior" 
            element={<PrivateRoute><PracticePage specificLevel="junior" /></PrivateRoute>} 
          />
          <Route 
            path="/middle" 
            element={<PrivateRoute><PracticePage specificLevel="middle" /></PrivateRoute>} 
          />
          <Route 
            path="/senior" 
            element={<PrivateRoute><PracticePage specificLevel="senior" /></PrivateRoute>} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

