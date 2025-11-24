import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import PracticePage from './PracticePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Три окремі шляхи, але використовують один "шаблон" сторінки */}
        {/* Ми передаємо "пропсом" (param) назву рівня */}
        <Route path="/junior" element={<PracticePage specificLevel="junior" />} />
        <Route path="/middle" element={<PracticePage specificLevel="middle" />} />
        <Route path="/senior" element={<PracticePage specificLevel="senior" />} />
      </Routes>
    </Router>
  );
}

export default App;