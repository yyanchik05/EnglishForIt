import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./contexts/AuthContext";

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        // Беремо топ-50 юзерів, відсортованих за очками (score)
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  // Генерація аватарки, якщо немає фото
  const getAvatar = (user) => {
    return user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=64`;
  };

  // Медальки для топ-3
  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1; // Просто цифра для інших
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Шапка з кнопкою закриття */}
        <div style={styles.header}>
          <h2 style={{margin: 0, color: '#e06c75'}}>TOP_CONTRIBUTORS</h2>
          <Link to="/junior" style={styles.closeBtn}>×</Link>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: 20}}>Loading data...</div>
        ) : (
          <div style={styles.list}>
            {/* Заголовки таблиці */}
            <div style={styles.listHeader}>
              <span style={{width: '50px'}}>RANK</span>
              <span style={{flex: 1}}>USER</span>
              <span style={{width: '80px', textAlign: 'right'}}>SCORE</span>
            </div>

            {/* Список юзерів */}
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

            {leaders.length === 0 && <div style={{padding: 20, textAlign: 'center', color: '#666'}}>No data yet. Complete some tasks!</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: '"JetBrains Mono", monospace', padding: '20px' },
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