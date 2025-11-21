import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import PracticePage from './PracticePage'; // Переконайся, що створила цей файл!

function App() {
  return (
    <Router>
      <Routes>
        {/* Якщо адреса сайту /, показуємо Головну */}
        <Route path="/" element={<HomePage />} />
        
        {/* Якщо адреса /practice, показуємо IDE */}
        <Route path="/practice" element={<PracticePage />} />
      </Routes>
    </Router>
  );
}

export default App;