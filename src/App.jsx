import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [output, setOutput] = useState("Ready to run...");
  const [loading, setLoading] = useState(true);
  
  // Стан для розкриття папок (за замовчуванням відкриті)
  const [foldersOpen, setFoldersOpen] = useState({
    junior: true,
    middle: true,
    senior: true
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const loadedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(loadedTasks);
        if (loadedTasks.length > 0) setCurrentTask(loadedTasks[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const runCode = (selectedOption) => {
    if (!currentTask) return;
    if (selectedOption === currentTask.correct) {
      setOutput(`>> SUCCESS: Build passing.\n>> Output: "${currentTask['option_' + selectedOption]}"`);
    } else {
      setOutput(`>> ERROR: Runtime Exception.\n>> Expected logic for '${currentTask.correct}', but got '${selectedOption}'.`);
    }
  };

  const toggleFolder = (level) => {
    setFoldersOpen(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // Функція для фільтрації завдань по папках
  const getTasksByLevel = (level) => tasks.filter(t => t.level?.toLowerCase() === level);

  if (loading) return <div className="loading">Initializing Environment...</div>;

  return (
    <div style={styles.container}>
      
      {/* --- ЛІВА ПАНЕЛЬ (EXPLORER) --- */}
      <div style={styles.sidebar}>
        <div style={styles.explorerHeader}>EXPLORER: ENGLISH-PROJECT</div>
        
        {/* Папки рівнів */}
        {['junior', 'middle', 'senior'].map(level => (
          <div key={level}>
            {/* Назва папки */}
            <div style={styles.folderHeader} onClick={() => toggleFolder(level)}>
              <span style={{ marginRight: 5 }}>{foldersOpen[level] ? '📂' : '📁'}</span> 
              {level.toUpperCase()}
            </div>

            {/* Список файлів у папці */}
            {foldersOpen[level] && getTasksByLevel(level).map(task => (
              <div 
                key={task.id} 
                onClick={() => { setCurrentTask(task); setOutput("Ready..."); }}
                style={{ 
                  ...styles.fileItem,
                  backgroundColor: currentTask?.id === task.id ? '#37373d' : 'transparent',
                  color: currentTask?.id === task.id ? '#fff' : '#ccc'
                }}
              >
                <span style={{ marginRight: 5, marginLeft: 15 }}>📄</span> 
                {task.title}.py
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* --- ЦЕНТРАЛЬНА ЧАСТИНА --- */}
      <div style={styles.mainArea}>
        
        {/* Вкладки (Tabs) */}
        <div style={styles.tabsBar}>
          <div style={styles.activeTab}>
            📄 {currentTask ? `${currentTask.title}.py` : 'No File'}
          </div>
        </div>

        {/* Редактор коду */}
        <div style={styles.editor}>
          {currentTask ? (
            <>
               {/* Номери рядків (візуально) */}
              <div style={{ color: '#666', marginRight: 10, textAlign: 'right', userSelect: 'none' }}>
                1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9
              </div>
              
              <div style={{ flex: 1 }}>
                <SyntaxHighlighter 
                  language="python" 
                  style={atomOneDark} 
                  customStyle={{ background: 'transparent', margin: 0, padding: 0, fontSize: '14px' }}
                >
                  {currentTask.code || "# Loading code..."}
                </SyntaxHighlighter>
              </div>
            </>
          ) : <div style={{padding: 20}}>Select a file to edit</div>}
        </div>

        {/* Панель управління (Кнопки) */}
        <div style={styles.actionPanel}>
          <div style={{ marginBottom: 10, color: '#888' }}>// TODO: Choose the correct variable assignment</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => runCode('a')} style={styles.button}>
              Option A: "{currentTask?.option_a}"
            </button>
            <button onClick={() => runCode('b')} style={styles.button}>
              Option B: "{currentTask?.option_b}"
            </button>
          </div>
        </div>

        {/* Термінал */}
        <div style={styles.terminal}>
          <div style={styles.terminalHeader}>
            <span style={{ marginRight: 15, borderBottom: '1px solid white' }}>TERMINAL</span>
            <span style={{ marginRight: 15, color: '#777' }}>OUTPUT</span>
            <span style={{ color: '#777' }}>DEBUG CONSOLE</span>
          </div>
          <pre style={{ 
            color: output.includes('SUCCESS') ? '#4caf50' : (output.includes('ERROR') ? '#ff5252' : '#ccc'),
            fontFamily: 'monospace',
            margin: 0
          }}>
            {output}
          </pre>
        </div>

        {/* Рядок стану (Status Bar) */}
        <div style={styles.statusBar}>
          <div style={styles.statusItem}>On branch: master*</div>
          <div style={styles.statusItem}>Python 3.10</div>
          <div style={styles.statusItem}>Spaces: 4</div>
          <div style={styles.statusItem}>UTF-8</div>
        </div>

      </div>
    </div>
  );
}

// --- СТИЛІ (CSS-in-JS) ---
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, "Courier New", monospace', overflow: 'hidden' },
  sidebar: { width: '250px', backgroundColor: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' },
  explorerHeader: { padding: '10px 20px', fontSize: '0.7rem', fontWeight: 'bold', color: '#bbb' },
  folderHeader: { padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', color: '#e0e0e0', display: 'flex', alignItems: 'center' },
  fileItem: { padding: '3px 10px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', transition: '0.2s' },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  tabsBar: { backgroundColor: '#2d2d2d', height: '35px', display: 'flex', alignItems: 'flex-end' },
  activeTab: { backgroundColor: '#1e1e1e', padding: '8px 15px', fontSize: '0.85rem', borderTop: '1px solid #007acc', color: '#fff' },
  editor: { flex: 1, padding: '20px', backgroundColor: '#1e1e1e', display: 'flex', overflow: 'auto' },
  actionPanel: { padding: '10px 20px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333' },
  button: { padding: '8px 15px', backgroundColor: '#0e639c', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', marginRight: '10px', borderRadius: '2px' },
  terminal: { height: '150px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333', padding: '10px', overflow: 'auto' },
  terminalHeader: { fontSize: '0.75rem', marginBottom: '10px', display: 'flex', cursor: 'pointer' },
  statusBar: { height: '22px', backgroundColor: '#007acc', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.75rem', color: 'white', justifyContent: 'space-between' },
  statusItem: { marginRight: '15px' }
};

export default App;