import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "./firebase";

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [contributions, setContributions] = useState({});
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser?.displayName || "");

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const qProgress = query(collection(db, "user_progress"), where("userId", "==", currentUser.uid));
      const progressSnapshot = await getDocs(qProgress);
      
      const activityMap = {};
      progressSnapshot.docs.forEach(doc => {
        const date = doc.data().date;
        activityMap[date] = (activityMap[date] || 0) + 1;
      });
      setContributions(activityMap);
      setCompletedCount(progressSnapshot.size);

      const qTasks = collection(db, "tasks");
      const tasksSnapshot = await getDocs(qTasks);
      setTotalTasks(tasksSnapshot.size);
    };
    fetchData();
  }, [currentUser]);

  const handleUpdateName = async () => {
    try { await updateProfile(currentUser, { displayName: newName }); setIsEditing(false); } 
    catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); } 
    catch (error) { console.error(error); }
  };

  const renderContributionGraph = () => {
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = contributions[dateStr] || 0;
        let bg = '#161b22';
        if (count > 0) bg = '#0e4429';
        if (count > 2) bg = '#006d32';
        if (count > 5) bg = '#26a641';
        if (count > 10) bg = '#39d353';
        days.push(<div key={dateStr} title={`${dateStr}: ${count}`} style={{...styles.dayBox, backgroundColor: bg}}></div>);
    }
    return days;
  };

  const avatarUrl = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || currentUser?.email}&background=random&color=fff&size=128`;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    // Головний контейнер (на всю ширину)
    <div style={styles.layout}>
      
      {/* --- БОКОВЕ МЕНЮ (Activity Bar) --- */}
      <div style={styles.activityBar}>
         <div style={styles.activityTop}>
           <Link to="/" style={styles.activityIcon} title="Home">🏠</Link>
         </div>
         <div style={styles.activityMiddle}>
           <Link to="/junior" style={styles.activityIcon} title="Junior">J</Link>
           <Link to="/middle" style={styles.activityIcon} title="Middle">M</Link>
           <Link to="/senior" style={styles.activityIcon} title="Senior">S</Link>
         </div>
         <div style={styles.activityBottom}>
            {/* Активна іконка профілю */}
            <div style={styles.activityIconActive} title="Profile">👤</div>
         </div>
      </div>

      {/* --- ОБЛАСТЬ КОНТЕНТУ (По центру) --- */}
      <div style={styles.contentContainer}>
        <div style={styles.mainCard}>
          
          {/* Ліва панель картки */}
          <div style={styles.leftPanel}>
            <div style={styles.avatarSection}>
              <img src={avatarUrl} alt="Avatar" style={styles.avatar} />
              {isEditing ? (
                <div style={{display: 'flex', gap: 5, marginTop: 15}}>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} style={styles.nameInput} placeholder="Name"/>
                  <button onClick={handleUpdateName} style={styles.saveBtn}>✓</button>
                </div>
              ) : (
                <h1 style={styles.userName} onClick={() => setIsEditing(true)}>{currentUser?.displayName || "Anonymous Dev"} ✎</h1>
              )}
              <p style={styles.userHandle}>{currentUser?.email}</p>
            </div>

            <div style={styles.statsGrid}>
               <div style={styles.statBox}><div style={styles.statValue}>{completedCount}</div><div style={styles.statLabel}>Completed</div></div>
               <div style={styles.statBox}><div style={styles.statValue}>{totalTasks}</div><div style={styles.statLabel}>Total</div></div>
               <div style={styles.statBox}><div style={styles.statValue}>{progressPercentage}%</div><div style={styles.statLabel}>Progress</div></div>
            </div>

            <div style={styles.menu}>
               <Link to="/junior" style={styles.menuBtn}>← Back to IDE</Link>
               <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
            </div>
          </div>

          {/* Права панель картки */}
          <div style={styles.rightPanel}>
            <div style={styles.sectionTitle}>contribution_graph.git</div>
            <div style={styles.graphWrapper}>
               <div style={styles.graphGrid}>{renderContributionGraph()}</div>
            </div>
            <div style={styles.legendContainer}>
               <span style={styles.legendText}>Less</span>
               {[ '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => <div key={c} style={{...styles.dayBox, backgroundColor: c}}></div>)}
               <span style={styles.legendText}>More</span>
            </div>
            <div style={styles.codeBlock}>
              <div style={{color: '#888', marginBottom: 5}}>// User Configuration</div>
              <div><span style={{color: '#e06c75'}}>const</span> <span style={{color: '#61dafb'}}>user</span> = {'{'}</div>
              <div style={{paddingLeft: 20}}>
                 level: <span style={{color: '#98c379'}}>"Mid-Senior"</span>,<br/>
                 verified: <span style={{color: '#d19a66'}}>{String(currentUser?.emailVerified)}</span>,<br/>
                 lastLogin: <span style={{color: '#98c379'}}>"{new Date().toLocaleDateString()}"</span>
              </div>
              <div>{'}'};</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  // Оновлений лейаут сторінки
  layout: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', overflow: 'hidden', fontFamily: '"JetBrains Mono", monospace' },
  
  // Стилі для Activity Bar (ідентичні PracticePage)
  activityBar: { width: '50px', backgroundColor: '#333333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderRight: '1px solid #252526', zIndex: 10, flexShrink: 0 },
  activityTop: { display: 'flex', flexDirection: 'column', gap: 20 },
  activityMiddle: { display: 'flex', flexDirection: 'column', gap: 15 },
  activityBottom: { marginBottom: 10 },
  activityIcon: { fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6, textDecoration: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '5px', transition: '0.2s' },
  activityIconActive: { fontSize: '1.2rem', cursor: 'pointer', opacity: 1, textDecoration: 'none', color: '#fff', borderLeft: '2px solid #fff', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#252526' },

  // Контейнер для контенту (щоб центрувати картку)
  contentContainer: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflowY: 'auto' },

  // Стилі самої картки (залишилися як були)
  mainCard: { display: 'flex', flexDirection: 'row', backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', width: '100%', maxWidth: '1200px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)', flexWrap: 'wrap' },
  leftPanel: { width: '300px', padding: '30px', borderRight: '1px solid #30363d', backgroundColor: '#0d1117', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  rightPanel: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' },
  
  // Елементи профілю
  avatarSection: { marginBottom: '30px' },
  avatar: { width: '150px', height: '150px', borderRadius: '50%', border: '1px solid #30363d', marginBottom: '20px' },
  userName: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0', cursor: 'pointer' },
  nameInput: { background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '5px', borderRadius: '4px', width: '100%' },
  saveBtn: { background: '#238636', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' },
  userHandle: { fontSize: '1rem', color: '#8b949e', margin: 0 },
  
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' },
  statBox: { backgroundColor: '#161b22', padding: '10px', borderRadius: '6px', border: '1px solid #30363d', textAlign: 'center' },
  statValue: { fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: '0.75rem', color: '#8b949e' },

  menu: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  menuBtn: { display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#21262d', color: '#c9d1d9', textDecoration: 'none', borderRadius: '6px', border: '1px solid #30363d', fontSize: '0.9rem' },
  logoutBtn: { padding: '10px', backgroundColor: '#da3633', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

  sectionTitle: { fontSize: '1rem', marginBottom: '20px', fontFamily: 'monospace', color: '#58a6ff' },
  graphWrapper: { overflowX: 'auto', paddingBottom: '10px', border: '1px solid #30363d', borderRadius: '6px', padding: '20px', backgroundColor: '#0d1117' },
  graphGrid: { display: 'grid', gridTemplateRows: 'repeat(7, 10px)', gridAutoFlow: 'column', gap: '3px', width: 'max-content' },
  dayBox: { width: '10px', height: '10px', borderRadius: '2px' },
  legendContainer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '10px', fontSize: '0.8rem', color: '#8b949e' },
  legendText: { margin: '0 5px' },
  codeBlock: { marginTop: '30px', padding: '20px', backgroundColor: '#161b22', borderRadius: '6px', border: '1px solid #30363d', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' }
};