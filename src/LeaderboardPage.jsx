import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./contexts/AuthContext";
import Sidebar from './components/Sidebar';

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const getAvatar = (user) => user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=64`;

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  return (
    // ГОЛОВНИЙ КОНТЕЙНЕР
    <div style={styles.layout}>
      
      {/* --- БОКОВЕ МЕНЮ (Activity Bar) --- */}
      <Sidebar />

      {/* --- ЦЕНТРАЛЬНА ЧАСТИНА --- */}
      <div style={styles.contentContainer}>
        <div style={styles.card}>
          
          <div style={styles.header}>
            <h2 style={{margin: 0, color: '#e06c75'}}>TOP_CONTRIBUTORS</h2>
            <Link to="/junior" style={styles.closeBtn}>×</Link>
          </div>

          {loading ? (
            <div style={{textAlign: 'center', padding: 20, color: '#666'}}>Fetching data...</div>
          ) : (
            <div style={styles.list}>
              <div style={styles.listHeader}>
                <span style={{width: '50px'}}>RANK</span>
                <span style={{flex: 1}}>USER</span>
                <span style={{width: '80px', textAlign: 'right'}}>SCORE</span>
              </div>

              {leaders.map((user, index) => {
                const isMe = currentUser && user.id === currentUser.uid;
                return (
                  <div key={user.id} style={isMe ? styles.rowMe : styles.row}>
                    <div style={styles.rank}>{getRankIcon(index)}</div>
                    <div style={styles.userInfo}>
                      <img src={getAvatar(user)} alt="av" style={styles.avatar} />
                      <span style={styles.username}>{user.username}</span>
                      {isMe && <span style={styles.meBadge}>(YOU)</span>}
                    </div>
                    <div style={styles.score}>{user.score} pts</div>
                  </div>
                );
              })}

              {leaders.length === 0 && <div style={{padding: 20, textAlign: 'center', color: '#666'}}>No data yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // Лейаут на весь екран
  layout: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', overflow: 'hidden', fontFamily: '"JetBrains Mono", monospace' },
  
  // Activity Bar
  activityBar: { width: '50px', backgroundColor: '#333333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderRight: '1px solid #252526', zIndex: 10, flexShrink: 0 },
  activityTop: { display: 'flex', flexDirection: 'column', gap: 20 },
  activityMiddle: { display: 'flex', flexDirection: 'column', gap: 15 },
  activityBottom: { marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 15 },
  
  activityIcon: { fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6, textDecoration: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '5px', transition: '0.2s' },
  activityIconActive: { fontSize: '1.2rem', cursor: 'pointer', opacity: 1, textDecoration: 'none', color: '#fff', borderLeft: '2px solid #fff', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#252526' },

  // Контейнер для центрування картки
  contentContainer: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflowY: 'auto' },

  // Картка таблиці
  card: { backgroundColor: '#252526', borderRadius: '10px', width: '100%', maxWidth: '600px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #333', backgroundColor: '#21252b' },
  closeBtn: { textDecoration: 'none', color: '#888', fontSize: '1.5rem', fontWeight: 'bold' },
  
  list: { overflowY: 'auto', padding: '10px' },
  listHeader: { display: 'flex', padding: '10px 15px', color: '#666', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' },
  
  row: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #2c313a', transition: '0.2s' },
  rowMe: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #2c313a', backgroundColor: 'rgba(97, 218, 251, 0.1)', borderLeft: '3px solid #61dafb' },
  
  rank: { width: '50px', fontSize: '1.2rem', fontWeight: 'bold' },
  userInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%' },
  username: { color: '#d19a66' },
  meBadge: { fontSize: '0.7rem', color: '#61dafb', opacity: 0.7 },
  score: { width: '80px', textAlign: 'right', color: '#98c379', fontWeight: 'bold' }
};