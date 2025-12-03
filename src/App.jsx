import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import PrivateRoute from './PrivateRoute'; 

import HomePage from './HomePage';
import PracticePage from './PracticePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';
import LeaderboardPage from './LeaderboardPage';
import ResourcesPage from './ResourcesPage';
import VerifyEmailPage from './VerifyEmailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
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
          <Route 
            path="/profile" 
            element={<PrivateRoute><ProfilePage /></PrivateRoute>} 
          />
          <Route 
  path="/leaderboard" 
  element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} 
/>
<Route 
  path="/resources" 
  element={<PrivateRoute><ResourcesPage /></PrivateRoute>} 
/>
<Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

