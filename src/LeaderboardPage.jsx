import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where, getDoc, doc, getCountFromServer } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import { motion } from "framer-motion";
import { Crown, Medal, Shield, Zap } from "lucide-react";

const getJobTitle = (score) => {
  if (score < 5) return "Intern";
  if (score < 15) return "Junior Dev";
  if (score < 25) return "Middle Dev";
  if (score < 50) return "Senior Dev";
  if (score < 100) return "Tech Lead";
  return "CTO";
};

const getRoleColor = (score) => {
  if (score < 5) return "#abb2bf"; 
  if (score < 15) return "#61dafb"; 
  if (score < 25) return "#98c379"; 
  if (score < 50) return "#d19a66"; 
  return "#c678dd"; 
};

const getBadges = (score) => {
  return [];
};

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [myRank, setMyRank] = useState(null);
  const [myScoreData, setMyScoreData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data);

        if (currentUser) {
            const amIInTop = data.find(user => user.id === currentUser.uid);
            if (amIInTop) {
                setMyRank(data.indexOf(amIInTop) + 1);
                setMyScoreData(amIInTop);
            } else {
                const myDocSnap = await getDoc(doc(db, "leaderboard", currentUser.uid));
                if (myDocSnap.exists()) {
                    const myData = myDocSnap.data();
                    setMyScoreData({ id: myDocSnap.id, ...myData });
                    const qHigher = query(collection(db, "leaderboard"), where("score", ">", myData.score));
                    const snapshotHigh = await getCountFromServer(qHigher);
                    setMyRank(snapshotHigh.data().count + 1);
                }
            }
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [currentUser]);

  const getAvatar = (user) => user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=128`;

  const getDisplayName = (user) => {
    const isMe = currentUser && user.id === currentUser.uid;
    return isMe ? (currentUser.displayName || user.username) : user.username;
  };

  const topThree = leaders.slice(0, 3);
  const restList = leaders.slice(3);
  const showStickyFooter = !loading && myRank > 50 && myScoreData;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.contentContainer}>
        <div style={styles.mainWrapper}>
          <h1 style={styles.pageTitle}>HALL OF FAME 🏆</h1>
          {loading ? <div style={{color: '#666'}}>Calculating ranks...</div> : (
            <>
              <div style={styles.podiumContainer}>
                {topThree[1] && <PodiumItem user={topThree[1]} rank={2} color="#C0C0C0" height="140px" name={getDisplayName(topThree[1])} />}
                {topThree[0] && <PodiumItem user={topThree[0]} rank={1} color="#FFD700" height="170px" isFirst name={getDisplayName(topThree[0])} />}
                {topThree[2] && <PodiumItem user={topThree[2]} rank={3} color="#CD7F32" height="120px" name={getDisplayName(topThree[2])} />}
              </div>

              <div style={styles.listCard}>
                <div style={styles.listHeader}>
                  <span style={{width: '40px'}}>#</span>
                  <span style={{flex: 1}}>Cadet</span>
                  <span style={{width: '100px'}}>Role</span>
                  <span style={{width: '80px', textAlign: 'right'}}>Score</span>
                </div>

                <div style={styles.scrollList}>
                  {restList.map((user, index) => {
                    const isMe = currentUser && user.id === currentUser.uid;
                    const rank = index + 4;
                    return (
                      <motion.div 
                        key={user.id} 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                        style={isMe ? styles.rowMe : styles.row}
                      >
                        <div style={styles.rank}>{rank}</div>
                        <div style={styles.userInfo}>
                          <img src={getAvatar(user)} alt="av" style={styles.avatarSmall} />
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                             <span style={styles.username}>
                                {getDisplayName(user)} 
                                <span style={{marginLeft: 5, fontSize: '0.8rem'}}>{getBadges(user.score).join(' ')}</span>
                             </span>
                             {isMe && <span style={styles.meBadge}>YOU</span>}
                          </div>
                        </div>
                        
                        <div style={{...styles.level, color: getRoleColor(user.score)}}>
                           {getJobTitle(user.score)}
                        </div>

                        <div style={styles.score}>{user.score} pts</div>
                      </motion.div>
                    );
                  })}
                  {myRank > 50 && <div style={{textAlign: 'center', padding: '10px', color: '#666'}}>. . .</div>}
                </div>

                {showStickyFooter && (
                    <div style={styles.stickyRow}>
                        <div style={{...styles.rank, color: '#61dafb'}}>{myRank}</div>
                        <div style={styles.userInfo}>
                          <img src={getAvatar(myScoreData)} alt="av" style={styles.avatarSmall} />
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                             <span style={{...styles.username, color: '#fff'}}>{getDisplayName(myScoreData)}</span>
                             <span style={styles.meBadge}>YOU ARE HERE</span>
                          </div>
                        </div>
                        <div style={{...styles.level, color: getRoleColor(myScoreData.score)}}>{getJobTitle(myScoreData.score)}</div>
                        <div style={{...styles.score, color: '#fff'}}>{myScoreData.score} pts</div>
                    </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumItem({ user, rank, color, height, isFirst, name }) {
  const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=128`;
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (rank * 0.1) }} style={styles.podiumItem}>
      <div style={{position: 'relative', marginBottom: 10}}>
        {isFirst && <Crown size={32} color="#FFD700" fill="#FFD700" style={styles.crown} />}
        <img src={avatarUrl} alt="winner" style={{...styles.avatarBig, borderColor: color}} />
        <div style={{...styles.rankBadge, backgroundColor: color}}>{rank}</div>
      </div>
      
      <div style={styles.podiumName}>{name}</div>
      
      <div style={{fontSize: '0.75rem', color: getRoleColor(user.score), fontWeight: 'bold', marginBottom: '2px'}}>
        {getJobTitle(user.score)}
      </div>
      
      <div style={styles.podiumScore}>{user.score} pts</div>
      <div style={{...styles.podiumBar, height: height, backgroundColor: `${color}20`, borderTop: `4px solid ${color}`}}></div>
    </motion.div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', overflow: 'hidden', fontFamily: '"JetBrains Mono", monospace' },
  contentContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflowY: 'auto' },
  mainWrapper: { width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pageTitle: { color: '#fff', marginBottom: '40px', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px rgba(97, 218, 251, 0.5)' },
  podiumContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '15px', marginBottom: '40px', width: '100%' },
  podiumItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' },
  avatarBig: { width: '70px', height: '70px', borderRadius: '50%', border: '3px solid', objectFit: 'cover' },
  crown: { position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 5px gold)' },
  rankBadge: { position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '24px', borderRadius: '50%', color: '#000', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', border: '2px solid #1e1e1e' },
  podiumName: { color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' },
  podiumScore: { color: '#888', fontSize: '0.8rem', marginBottom: '5px' },
  podiumBar: { width: '100%', borderRadius: '8px 8px 0 0' },
  listCard: { backgroundColor: '#252526', borderRadius: '12px', width: '100%', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  listHeader: { display: 'flex', padding: '15px 20px', backgroundColor: '#21252b', borderBottom: '1px solid #333', color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' },
  scrollList: { maxHeight: '400px', overflowY: 'auto' },
  row: { display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #2c313a', transition: '0.2s' },
  rowMe: { display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #2c313a', backgroundColor: 'rgba(97, 218, 251, 0.08)', borderLeft: '3px solid #61dafb' },
  stickyRow: { display: 'flex', alignItems: 'center', padding: '15px 20px', backgroundColor: '#163f52', borderTop: '2px solid #61dafb', boxShadow: '0 -5px 20px rgba(0,0,0,0.5)', zIndex: 10 },
  rank: { width: '40px', color: '#666', fontWeight: 'bold' },
  userInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px' },
  avatarSmall: { width: '36px', height: '36px', borderRadius: '50%' },
  username: { color: '#d19a66', display: 'flex', alignItems: 'center', gap: '5px' },
  meBadge: { fontSize: '0.6rem', backgroundColor: '#61dafb', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  level: { width: '100px', fontSize: '0.85rem', fontWeight: 'bold' },
  score: { width: '80px', textAlign: 'right', color: '#98c379', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }
};