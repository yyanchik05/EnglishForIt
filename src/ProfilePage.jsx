import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "./firebase";
import Sidebar from "./components/Sidebar";
import { Terminal, GitCommit, Bug, Cpu } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const displayName = currentUser?.displayName || "Anonymous Dev";

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
    try { 
        await updateProfile(currentUser, { displayName: newName }); 
        
        const userRef = doc(db, "leaderboard", currentUser.uid);
        
        await setDoc(userRef, { username: newName }, { merge: true });

        setIsEditing(false); 
        
        window.location.reload();
        
    } catch (error) { 
        console.error("Error updating profile:", error); 
    }
  };

  const handleLogout = async () => {
    const shouldLogout = window.confirm("Are you sure you want to log out?");
    if (!shouldLogout) return;
    try { await logout(); navigate("/login"); } 
    catch (error) { console.error(error); }
  };

function SkillBadge({ icon: Icon, title, unlocked, desc }) {
  return (
    <div title={desc} style={{
       display: 'flex', alignItems: 'center', gap: 8,
       padding: '4px 10px', 
       borderRadius: '4px', 
       backgroundColor: unlocked ? 'rgba(56, 139, 253, 0.15)' : 'rgba(110, 118, 129, 0.1)', // Кольори GitHub
       border: `1px solid ${unlocked ? 'rgba(56, 139, 253, 0.4)' : 'rgba(110, 118, 129, 0.4)'}`,
       opacity: unlocked ? 1 : 0.5,
       cursor: 'help',
       fontFamily: 'monospace',
       fontSize: '0.8rem',
       color: unlocked ? '#58a6ff' : '#8b949e'
    }}>
       <Icon size={14} />
       <span>{title}</span>
    </div>
  );
}

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

  const avatarName = currentUser?.displayName || currentUser?.email || "User";
  const avatarUrl = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${avatarName}&background=random&color=fff&size=128`;
  
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.contentContainer}>
        <div style={styles.mainCard}>
          
          <div style={styles.leftPanel}>
            <div style={styles.avatarSection}>
              <div style={styles.avatarWrapper}>
                 <img src={avatarUrl} alt="Avatar" style={styles.avatar} />
              </div>
              
              {isEditing ? (
                <div style={{display: 'flex', gap: 5, marginTop: 15}}>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} style={styles.nameInput} placeholder="Enter Name"/>
                  <button onClick={handleUpdateName} style={styles.saveBtn}>✓</button>
                </div>
              ) : (
                <h1 style={styles.userName} onClick={() => setIsEditing(true)} title="Click to edit">
                  {displayName} ✎
                </h1>
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

          <div style={styles.rightPanel}>
            <div style={styles.sectionTitle}>contribution_graph.git</div>
            <div style={styles.graphWrapper}><div style={styles.graphGrid}>{renderContributionGraph()}</div></div>
            <div style={styles.legendContainer}>
               <span style={styles.legendText}>Less</span>
               {[ '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => <div key={c} style={{...styles.dayBox, backgroundColor: c}}></div>)}
               <span style={styles.legendText}>More</span>
            </div>
            
            <div style={styles.codeBlock}>
              <div style={{color: '#8b949e', marginBottom: 5}}>// User Configuration</div>
              <div><span style={{color: '#ff7b72'}}>const</span> <span style={{color: '#d2a8ff'}}>user</span> = {'{'}</div>
              <div style={{paddingLeft: 20, lineHeight: '1.6'}}>
                 <span style={{color: '#79c0ff'}}>username</span>: <span style={{color: '#a5d6ff'}}>"{displayName}"</span>,<br/>
                 
                 <span style={{color: '#79c0ff'}}>verified</span>: <span style={{color: '#ff7b72'}}>{String(currentUser?.emailVerified)}</span>,<br/>
                 <span style={{color: '#79c0ff'}}>lastLogin</span>: <span style={{color: '#a5d6ff'}}>"{new Date().toLocaleDateString()}"</span>
              </div>
              <div>{'}'};</div>

              <div style={{marginTop: 30}}>
               <div style={styles.sectionTitle}>verified_skills.json</div>
               <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                  <SkillBadge icon={Terminal} title="Console_Basic" unlocked={completedCount >= 1} desc="First script executed" />
                  <SkillBadge icon={GitCommit} title="Git_Flow" unlocked={completedCount >= 10} desc="10 commits pushed" />
                  <SkillBadge icon={Cpu} title="System_Design" unlocked={completedCount >= 25} desc="Architecture mastery" />
                  <SkillBadge icon={Bug} title="Bug_Hunter" unlocked={completedCount >= 50} desc="50 issues resolved" />
               </div>
            </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', overflow: 'hidden', fontFamily: '"JetBrains Mono", monospace' },
  contentContainer: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflowY: 'auto' },
  mainCard: { display: 'flex', flexDirection: 'row', backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', width: '100%', maxWidth: '1200px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)', flexWrap: 'wrap' },
  leftPanel: { width: '300px', padding: '30px', borderRight: '1px solid #30363d', backgroundColor: '#0d1117', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  rightPanel: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' },
  avatarSection: { marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarWrapper: { width: '150px', height: '150px', marginBottom: '20px', borderRadius: '50%', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  userName: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0', cursor: 'pointer' },
  nameInput: { background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '5px', borderRadius: '4px', width: '100%' },
  saveBtn: { background: '#238636', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' },
  userHandle: { fontSize: '1rem', color: '#8b949e', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', width: '100%' },
  statBox: { backgroundColor: '#161b22', padding: '10px', borderRadius: '6px', border: '1px solid #30363d', textAlign: 'center' },
  statValue: { fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: '0.75rem', color: '#8b949e' },
  menu: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' },
  menuBtn: { display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#21262d', color: '#c9d1d9', textDecoration: 'none', borderRadius: '6px', border: '1px solid #30363d', fontSize: '0.9rem' },
  logoutBtn: { padding: '10px', backgroundColor: '#da3633', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  sectionTitle: { fontSize: '1rem', marginBottom: '20px', fontFamily: 'monospace', color: '#58a6ff' },
  graphWrapper: { overflowX: 'auto', paddingBottom: '10px', border: '1px solid #30363d', borderRadius: '6px', padding: '20px', backgroundColor: '#0d1117' },
  graphGrid: { display: 'grid', gridTemplateRows: 'repeat(7, 10px)', gridAutoFlow: 'column', gap: '3px', width: 'max-content' },
  dayBox: { width: '10px', height: '10px', borderRadius: '2px' },
  legendContainer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '10px', fontSize: '0.8rem', color: '#8b949e' },
  legendText: { margin: '0 5px' },
  codeBlock: { marginTop: '30px', padding: '20px', backgroundColor: '#161b22', borderRadius: '6px', border: '1px solid #30363d', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', color: '#c9d1d9' }
};