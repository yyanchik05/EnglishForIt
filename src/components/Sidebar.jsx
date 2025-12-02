import { Link, useLocation } from 'react-router-dom';
import { House, BookOpen, Trophy, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation(); // Щоб знати, де ми є, і підсвічувати активне
  const path = location.pathname;

  // Перевірка, чи активна іконка
  const isActive = (p) => path === p;
  
  // Стилі для активного/неактивного стану
  const getStyle = (p) => isActive(p) ? styles.iconActive : styles.icon;

  return (
    <div style={styles.bar}>
       <div style={styles.group}>
         <Link to="/" style={styles.icon} title="Home"><House size={26} strokeWidth={1.5} /></Link>
         <Link to="/resources" style={getStyle('/resources')} title="Resources"><BookOpen size={26} strokeWidth={1.5} /></Link>
       </div>

       <div style={styles.group}>
         <Link to="/junior" style={getStyle('/junior')}title="Junior Level">J</Link>
         <Link to="/middle" style={getStyle('/middle')}title="Middle Level">M</Link>
         <Link to="/senior" style={getStyle('/senior')}title="Senior Level">S</Link>
       </div>

       <div style={styles.group}>
          <Link to="/leaderboard" style={getStyle('/leaderboard')} title="Leaderboard"><Trophy size={26} strokeWidth={1.5} /></Link>
          <Link to="/profile" style={getStyle('/profile')} title="Profile"><UserCircle size={26} strokeWidth={1.5} /></Link>
       </div>
    </div>
  );
}

const styles = {
  bar: { width: '60px', backgroundColor: '#333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderRight: '1px solid #252526', zIndex: 50, flexShrink: 0 },
  group: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
  icon: { color: '#858585', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '8px', transition: '0.2s', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' },
  iconActive: { color: '#fff', backgroundColor: '#444', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '8px', borderLeft: '3px solid #61dafb', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }
};