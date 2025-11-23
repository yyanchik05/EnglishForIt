import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSearchParams, Link } from 'react-router-dom'; // Додали Link

function PracticePage({ specificLevel }) {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [output, setOutput] = useState("Ready to run...");
  const [loading, setLoading] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "tasks"), where("level", "==", specificLevel));
        const querySnapshot = await getDocs(q);
        
        const loadedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category: doc.data().category || "General Modules" 
        }));
        
        setTasks(loadedTasks);

        const uniqueCategories = [...new Set(loadedTasks.map(t => t.category))];
        const initialOpenState = {};
        uniqueCategories.forEach(cat => initialOpenState[cat] = true);
        setCategoriesOpen(initialOpenState);

        if (loadedTasks.length > 0) setCurrentTask(loadedTasks[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, [specificLevel]);

  const runCode = (selectedOption) => {
    if (!currentTask) return;
    if (selectedOption === currentTask.correct) {
      setOutput(`>> BUILD SUCCESSFUL [1.2s]\n>> Return Value: "${currentTask['option_' + selectedOption]}"`);
    } else {
      setOutput(`>> FATAL ERROR: LogicException.\n>> Expected '${currentTask.correct}', but received '${selectedOption}'.\n>> Process finished with exit code 1.`);
    }
  };

  const toggleCategory = (category) => {
    setCategoriesOpen(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const uniqueCategories = [...new Set(tasks.map(t => t.category))].sort();

  if (loading) return <div style={styles.loadingScreen}>Loading {specificLevel}...</div>;

  return (
    <div style={styles.container}>
      
      {/* --- 1. ACTIVITY BAR (Нове меню зліва) --- */}
      <div style={styles.activityBar}>
        <div style={styles.activityTop}>
          <Link to="/" style={styles.activityIcon} title="Home">🏠</Link>
        </div>
        <div style={styles.activityMiddle}>
          <Link to="/junior" style={specificLevel === 'junior' ? styles.activityIconActive : styles.activityIcon} title="Junior">J</Link>
          <Link to="/middle" style={specificLevel === 'middle' ? styles.activityIconActive : styles.activityIcon} title="Middle">M</Link>
          <Link to="/senior" style={specificLevel === 'senior' ? styles.activityIconActive : styles.activityIcon} title="Senior">S</Link>
        </div>
        <div style={styles.activityBottom}>
          <span style={styles.activityIcon} title="Settings">⚙️</span>
        </div>
      </div>

      {/* --- 2. EXPLORER (Сайдбар) --- */}
      <div style={styles.sidebar}>
        <div style={styles.explorerHeader}>
          <span>EXPLORER</span>
          <span style={{opacity: 0.5}}>...</span>
        </div>
        
        <div style={styles.projectTitle}>∨ ENGLISH-PROJECT [{specificLevel.toUpperCase()}]</div>

        {tasks.length === 0 && <div style={{padding: '10px 20px', color: '#666', fontSize: '0.8rem'}}>No tasks found.</div>}

        <div style={styles.fileTree}>
          {uniqueCategories.map(category => (
            <div key={category}>
              <div style={styles.folderHeader} onClick={() => toggleCategory(category)}>
                <span style={{ marginRight: 6, fontSize: '0.8rem' }}>{categoriesOpen[category] ? 'v' : '>'}</span> 
                <span style={{ color: categoriesOpen[category] ? '#e0e0e0' : '#aaa' }}>{category}</span>
              </div>

              {categoriesOpen[category] && tasks
                .filter(t => t.category === category)
                .map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => { setCurrentTask(task); setOutput("Ready to run..."); }}
                    style={{ 
                      ...styles.fileItem,
                      backgroundColor: currentTask?.id === task.id ? '#37373d' : 'transparent',
                      color: currentTask?.id === task.id ? '#fff' : '#999',
                      borderLeft: currentTask?.id === task.id ? '2px solid #61dafb' : '2px solid transparent'
                    }}
                  >
                    <span style={{ marginRight: 8, marginLeft: 18 }}>py</span> 
                    {task.title}
                  </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- 3. MAIN EDITOR AREA --- */}
      <div style={styles.mainArea}>
        
        {/* Breadcrumbs (Шлях до файлу) */}
        <div style={styles.breadcrumbs}>
          src <span style={styles.cr}>&gt;</span> {specificLevel} <span style={styles.cr}>&gt;</span> {currentTask?.category || 'modules'} <span style={styles.cr}>&gt;</span> {currentTask ? currentTask.title + '.py' : 'untitled'}
        </div>

        {/* Tabs */}
        <div style={styles.tabsBar}>
          <div style={styles.activeTab}>
            <span style={{marginRight: 8, color: '#61dafb'}}>py</span> 
            {currentTask ? `${currentTask.title}.py` : 'No File'}
            <span style={{marginLeft: 10, fontSize: '0.7rem', color: '#fff'}}>×</span>
          </div>
        </div>
        
        {/* Code Editor */}
        <div style={styles.editor}>
          {currentTask ? (
            <div style={{ flex: 1, display: 'flex' }}>
              <div style={styles.lineNumbers}>
                {Array.from({length: 10}, (_, i) => i + 1).map(n => <div key={n}>{n}</div>)}
              </div>
              <div style={{ flex: 1 }}>
                <SyntaxHighlighter 
                  language="python" 
                  style={atomOneDark} 
                  customStyle={{ background: 'transparent', margin: 0, padding: 0, fontSize: '15px', lineHeight: '1.5' }}
                  showLineNumbers={false}
                >
                  {currentTask.code || "# Code missing"}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : <div style={styles.emptyState}>Select a file from Explorer to start coding.</div>}
        </div>

        {/* Action Panel (Debug Controls) */}
        <div style={styles.actionPanel}>
          <div style={styles.debugHeader}>
            <span>DEBUG CONSOLE</span>
            <div style={{display: 'flex', gap: 10}}>
               <span style={{color: '#aaa', fontSize: '0.8rem'}}>Variables:</span>
            </div>
          </div>
          
          <div style={styles.gridOptions}>
            <button onClick={() => runCode('a')} style={styles.optionBtn} disabled={!currentTask}>
              <span style={styles.varName}>var a</span> = "{currentTask?.option_a || '...'}"
            </button>
            <button onClick={() => runCode('b')} style={styles.optionBtn} disabled={!currentTask}>
              <span style={styles.varName}>var b</span> = "{currentTask?.option_b || '...'}"
            </button>
            {currentTask?.option_c && (
              <button onClick={() => runCode('c')} style={styles.optionBtn} disabled={!currentTask}>
                <span style={styles.varName}>var c</span> = "{currentTask.option_c}"
              </button>
            )}
            {currentTask?.option_d && (
               <button onClick={() => runCode('d')} style={styles.optionBtn} disabled={!currentTask}>
                <span style={styles.varName}>var d</span> = "{currentTask.option_d}"
              </button>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div style={styles.terminal}>
          <div style={{marginBottom: 5, color: '#aaa', fontSize: '0.8rem', borderBottom: '1px solid #333'}}>OUTPUT</div>
          <pre style={{ 
            color: output.includes('SUCCESS') ? '#4caf50' : (output.includes('ERROR') ? '#ff5252' : '#ccc'), 
            fontFamily: 'monospace', margin: 0 
          }}>
            {output}
          </pre>
        </div>

        {/* Footer Status Bar */}
        <div style={styles.statusBar}>
          <div style={{display: 'flex', gap: 15}}>
            <div style={styles.statusItem}>master*</div>
            <div style={styles.statusItem}>0 errors</div>
          </div>
          <div style={{display: 'flex', gap: 15}}>
             <div style={styles.statusItem}>Ln 12, Col 4</div>
             <div style={styles.statusItem}>UTF-8</div>
             <div style={styles.statusItem}>Python 3.10</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- НОВІ ПОКРАЩЕНІ СТИЛІ ---
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#cccccc', fontFamily: '"JetBrains Mono", "Fira Code", monospace', overflow: 'hidden' },
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e1e1e', color: '#fff' },
  
  // 1. Activity Bar Styles
  activityBar: { width: '50px', backgroundColor: '#333333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderRight: '1px solid #252526', zIndex: 10 },
  activityTop: { display: 'flex', flexDirection: 'column', gap: 20 },
  activityMiddle: { display: 'flex', flexDirection: 'column', gap: 15 },
  activityBottom: { marginBottom: 10 },
  activityIcon: { fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6, textDecoration: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '5px', transition: '0.2s' },
  activityIconActive: { fontSize: '1.2rem', cursor: 'pointer', opacity: 1, textDecoration: 'none', color: '#fff', borderLeft: '2px solid #fff', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#252526' },

  // 2. Sidebar Styles
  sidebar: { width: '250px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column' },
  explorerHeader: { padding: '10px 20px', fontSize: '0.7rem', letterSpacing: '1px', color: '#bbb', display: 'flex', justifyContent: 'space-between' },
  projectTitle: { padding: '5px 20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#61dafb', textTransform: 'uppercase' },
  fileTree: { marginTop: 5, overflowY: 'auto', flex: 1 },
  folderHeader: { padding: '4px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center' },
  fileItem: { padding: '4px 20px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', transition: 'background 0.1s' },

  // 3. Main Area Styles
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e' },
  breadcrumbs: { padding: '5px 20px', fontSize: '0.8rem', color: '#777', backgroundColor: '#1e1e1e' },
  cr: { margin: '0 5px' },
  
  tabsBar: { backgroundColor: '#252526', height: '35px', display: 'flex', alignItems: 'flex-start', overflowX: 'auto' },
  activeTab: { backgroundColor: '#1e1e1e', padding: '8px 15px', fontSize: '0.85rem', borderTop: '1px solid #61dafb', color: '#fff', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  
  editor: { flex: 1, padding: '20px', backgroundColor: '#1e1e1e', display: 'flex', overflow: 'auto' },
  lineNumbers: { color: '#444', marginRight: 15, textAlign: 'right', userSelect: 'none', fontSize: '15px', lineHeight: '1.5', width: '30px' },
  emptyState: { color: '#555', marginTop: '100px', width: '100%', textAlign: 'center' },

  // Action Panel & Buttons
  actionPanel: { padding: '15px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333' },
  debugHeader: { fontSize: '0.75rem', color: '#aaa', marginBottom: 10, display: 'flex', justifyContent: 'space-between' },
  gridOptions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 },
  optionBtn: { padding: '10px', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#ccc', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.9rem', transition: '0.2s' },
  varName: { color: '#c678dd' }, // Purple like in VS Code variables

  terminal: { height: '120px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333', padding: '10px 15px', overflow: 'auto' },
  
  statusBar: { height: '22px', backgroundColor: '#007acc', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.75rem', color: 'white', justifyContent: 'space-between', zIndex: 20 },
  statusItem: { cursor: 'pointer' }
};

export default PracticePage;