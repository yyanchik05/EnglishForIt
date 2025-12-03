import { useState, useEffect } from 'react';
import { db } from './firebase';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; 
import { collection, getDocs, query, where, doc, setDoc, getDoc, increment } from 'firebase/firestore';
import Sidebar from './components/Sidebar';

function PracticePage({ specificLevel }) {
  const { currentUser } = useAuth(); 
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [output, setOutput] = useState("Ready to run...");
  const [loading, setLoading] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState({});
  const [userInputValue, setUserInputValue] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [activeHint, setActiveHint] = useState(null);
  const [selectedFragments, setSelectedFragments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());


  useEffect(() => {
    const fetchData = async () => {
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

        if (currentUser) {
            const progressQuery = query(collection(db, "user_progress"), where("userId", "==", currentUser.uid));
            const progressSnapshot = await getDocs(progressQuery);
            const completedIds = new Set(progressSnapshot.docs.map(d => d.data().taskId));
            setCompletedTaskIds(completedIds);
        }

        const uniqueCategories = [...new Set(loadedTasks.map(t => t.category))];
        const initialOpenState = {};
        uniqueCategories.forEach(cat => initialOpenState[cat] = true);
        setCategoriesOpen(initialOpenState);

        const taskIdFromUrl = searchParams.get("task");
        if (taskIdFromUrl) {
            const found = loadedTasks.find(t => t.id === taskIdFromUrl);
            if (found) setCurrentTask(found);
        } else if (loadedTasks.length > 0) {
            setCurrentTask(loadedTasks[0]);
            setSearchParams({ task: loadedTasks[0].id }, { replace: true });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [specificLevel, currentUser]);

  useEffect(() => {
    setUserInputValue("");
    setSelectedFragments([]);
    setWrongAttempts(0);
    setActiveHint(null);
    setOutput("Ready to run...");
  }, [currentTask]);

  const saveProgress = async () => {
    if (!currentUser || !currentTask) return;
    
    try {
        const progressId = `${currentUser.uid}_${currentTask.id}`;
        const today = new Date().toISOString().split('T')[0];

        const docRef = doc(db, "user_progress", progressId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                userId: currentUser.uid,
                taskId: currentTask.id,
                date: today,
                level: specificLevel
            });

            const statsRef = doc(db, "leaderboard", currentUser.uid);
            await setDoc(statsRef, {
                username: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || null,
                score: increment(1) 
            }, { merge: true });

            setCompletedTaskIds(prev => new Set(prev).add(currentTask.id));
        }
        
    } catch (error) {
        console.error("Failed to save progress:", error);
    }
  };

  const runCode = (answerToCheck) => {
    if (!currentTask) return;
    
    let finalAnswer = "";
    if (currentTask.type === 'builder') {
      finalAnswer = selectedFragments.join(' ');
    } else {
      finalAnswer = answerToCheck !== undefined ? answerToCheck : userInputValue;
    }
    
    const cleanAnswer = (finalAnswer || "").toString().toLowerCase().trim();
    const cleanCorrect = (currentTask.correct || "").toString().toLowerCase().trim();

    if (cleanAnswer === cleanCorrect) {
      setOutput(`>> BUILD SUCCESSFUL [0.5s]\n>> Result: "${finalAnswer}"\n>> Status: Saved.`);
      setActiveHint(null); 
      saveProgress();
    } else {
      let errorMsg = `>> FATAL ERROR: LogicException.\n>> The argument '${finalAnswer}' caused a runtime error.\n>> Process finished with exit code 1.`;
      
      if (currentTask.type === 'input') {
          const currentAttempts = wrongAttempts + 1;
          setWrongAttempts(currentAttempts);

          if (currentAttempts >= 3) {
              const correctWord = currentTask.correct ? currentTask.correct.trim() : "";
              let hintPattern = "...";
              if (correctWord.length >= 2) {
                  hintPattern = `${correctWord.charAt(0)}...${correctWord.charAt(correctWord.length - 1)}`;
              }
              setActiveHint(`💡 HINT: Try pattern "${hintPattern}"`);
          }
      }
      setOutput(errorMsg);
    }
  };


  const toggleCategory = (category) => setCategoriesOpen(prev => ({ ...prev, [category]: !prev[category] }));
  const handleFragmentClick = (word) => setSelectedFragments([...selectedFragments, word]);
  const handleUndoFragment = () => setSelectedFragments(selectedFragments.slice(0, -1));
  const uniqueCategories = [...new Set(tasks.map(t => t.category))].sort();

  const renderCodeEditor = () => {
    if (!currentTask) return null;

    const cleanCode = (currentTask.code || '').replace(/\\n/g, '\n');

    const totalLines = cleanCode.split('\n').length;
    let content = null;

    if (currentTask.type === 'input' && cleanCode.includes('____')) {
      const lines = cleanCode.split('\n');
      const inputLineIndex = lines.findIndex(line => line.includes('____'));
      
      if (inputLineIndex === -1) return <div>Error parsing code structure</div>;

      const codeBefore = lines.slice(0, inputLineIndex).join('\n');
      const targetLine = lines[inputLineIndex];
      const codeAfter = lines.slice(inputLineIndex + 1).join('\n');

      const parts = targetLine.split('____');

      content = (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {codeBefore && (
            <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.blockCode}>
              {codeBefore}
            </SyntaxHighlighter>
          )}

          <div style={styles.inputRow}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.inlineCode}>
                 {parts[0]}
               </SyntaxHighlighter>
            </div>
            <input
  type="text"
  value={userInputValue}
  onChange={(e) => setUserInputValue(e.target.value)}
  onKeyDown={(e) => { 
      if (e.key === 'Enter') runCode(e.target.value); 
  }}
  style={styles.inlineInput}
  autoFocus
  placeholder="..."
/>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.inlineCode}>
                 {parts[1] || ""}
               </SyntaxHighlighter>
            </div>
          </div>

          {codeAfter && (
            <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.blockCode}>
              {codeAfter}
            </SyntaxHighlighter>
          )}
        </div>
      );
    
    } else if (currentTask.type === 'builder' && cleanCode.includes('____')) {
        const lines = cleanCode.split('\n');
        const inputLineIndex = lines.findIndex(line => line.includes('____'));
        
        if (inputLineIndex === -1) return <div>Error parsing builder structure</div>;

        const codeBefore = lines.slice(0, inputLineIndex).join('\n');
        const targetLine = lines[inputLineIndex];
        const codeAfter = lines.slice(inputLineIndex + 1).join('\n');

        const parts = targetLine.split('____');
        const constructedString = selectedFragments.join(' ');
        
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
             {codeBefore && (
                <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.blockCode}>
                  {codeBefore}
                </SyntaxHighlighter>
             )}

             <div style={styles.inputRow}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.inlineCode}>
                     {parts[0]}
                   </SyntaxHighlighter>
                </div>
                
                <div style={styles.builderArea}>
                   {constructedString || <span style={{opacity: 0.3}}>...</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.inlineCode}>
                     {parts[1] || ""}
                   </SyntaxHighlighter>
                </div>
                
                {selectedFragments.length > 0 && (
                  <button onClick={handleUndoFragment} style={styles.undoBtn} title="Undo">⌫</button>
                )}
             </div>

             {codeAfter && (
                <SyntaxHighlighter language="python" style={atomOneDark} customStyle={styles.blockCode}>
                  {codeAfter}
                </SyntaxHighlighter>
             )}
          </div>
        );

    } else {
        content = (
            <SyntaxHighlighter 
              language="python" 
              style={atomOneDark} 
              customStyle={{ background: 'transparent', margin: 0, padding: 0, fontSize: '15px', lineHeight: '1.5' }}
              showLineNumbers={false}
            >
              {cleanCode || "# Code missing"}
            </SyntaxHighlighter>
        );
    }

    return (
       <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <div style={styles.lineNumbers}>
            {Array.from({length: totalLines}, (_, i) => i + 1).map(n => (
              <div key={n} style={{ height: '22.5px', lineHeight: '22.5px' }}>{n}</div>
            ))}
          </div>
          <div style={{ flex: 1, paddingLeft: 10 }}>
            {content}
          </div>
        </div>
    );
  };

  const renderActionPanel = () => {
    if (!currentTask) return null;

    if (currentTask.type === 'input') {
        return (
            <button onClick={() => runCode(userInputValue)} style={styles.runButton}>
                ▶ EXECUTE SCRIPT
            </button>
        );
    }

    if (currentTask.type === 'builder') {
        const safeFragments = Array.isArray(currentTask.fragments) ? currentTask.fragments : [];
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
             <div style={{color: '#888', fontSize: '0.8rem'}}>// Click fragments:</div>
             <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
               {safeFragments.map((word, i) => (
                 <button key={i} onClick={() => handleFragmentClick(word)} style={styles.fragmentBtn}>{word}</button>
               ))}
             </div>
             <button onClick={() => runCode()} style={{...styles.runButton, marginTop: 10}}>▶ VERIFY STRING</button>
          </div>
        );
    }

    return (
        <div style={styles.gridOptions}>
          <button onClick={() => runCode('a')} style={styles.optionBtn}>
             var a = "{currentTask?.option_a}"
          </button>
          <button onClick={() => runCode('b')} style={styles.optionBtn}>
             var b = "{currentTask?.option_b}"
          </button>
          
          {currentTask?.option_c && (
            <button onClick={() => runCode('c')} style={styles.optionBtn}>
               var c = "{currentTask.option_c}"
            </button>
          )}
          {currentTask?.option_d && (
            <button onClick={() => runCode('d')} style={styles.optionBtn}>
               var d = "{currentTask.option_d}"
            </button>
          )}
        </div>
    );
  };

  if (loading) return <div style={styles.loadingScreen}>Loading...</div>;

  const customScrollbarCss = `
    ::-webkit-scrollbar { width: 12px; height: 12px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.15); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
    ::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.3); }
  `;

  return (
    <div style={styles.container}>
      <style>{customScrollbarCss}</style>
      <Sidebar />

      <div style={styles.sidebar}>
        <div style={styles.explorerHeader}>EXPLORER</div>
        <div style={styles.projectTitle}>∨ PROJECT [{specificLevel.toUpperCase()}]</div>
        <div style={styles.fileTree}>
          {uniqueCategories.map(category => (
            <div key={category}>
              <div style={styles.folderHeader} onClick={() => toggleCategory(category)}>
                <span style={{ marginRight: 6 }}>{categoriesOpen[category] ? 'v' : '>'}</span> 
                {category}
              </div>
              {categoriesOpen[category] && tasks.filter(t => t.category === category).map(task => {
                  const isDone = completedTaskIds.has(task.id);
                  
                  return (
                    <div key={task.id} 
                         onClick={() => { setCurrentTask(task); setSearchParams({ task: task.id }); }} 
                         style={{
                             ...styles.fileItem, 
                             backgroundColor: currentTask?.id === task.id ? '#37373d' : 'transparent', 
                             color: isDone ? '#98c379' : (currentTask?.id === task.id ? '#fff' : '#999'), // Зелений якщо зроблено
                             borderLeft: currentTask?.id === task.id ? '2px solid #61dafb' : '2px solid transparent'
                         }}>
                      <span style={{
                          marginRight: 0, 
                          marginLeft: 18, 
                          color: isDone ? '#98c379' : '#61dafb', 
                          fontWeight: isDone ? 'bold' : 'normal',
                          opacity: 0.8
                      }}>
                        {isDone ? '✓' : 'py.'}
                      </span> 
                      <span style={{ marginLeft: 5, textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                        {task.title}
                      </span>
                    </div>
                  )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.mainArea}>
        <div style={styles.tabsBar}>
           <div style={styles.activeTab}><span style={{marginRight: 8, color: '#61dafb'}}>py</span> {currentTask ? `${currentTask.title}.py` : 'No File'}</div>
        </div>
        <div style={styles.editor}>{renderCodeEditor()}</div>
        <div style={styles.actionPanel}>
          <div style={styles.debugHeader}>
             <span>{currentTask?.type === 'input' ? 'MANUAL MODE' : (currentTask?.type === 'builder' ? 'CONSTRUCTOR MODE' : 'DEBUG CONSOLE')}</span>
          </div>
          {activeHint && (
            <div style={styles.hintBox}>
              {activeHint}
            </div>
          )}
          {renderActionPanel()}
        </div>
        <div style={styles.terminal}>
          <div style={{marginBottom: 5, color: '#aaa', fontSize: '0.8rem', borderBottom: '1px solid #333'}}>OUTPUT</div>
          <pre style={{ color: output.includes('SUCCESS') ? '#4caf50' : (output.includes('ERROR') ? '#ff5252' : '#ccc'), fontFamily: 'monospace', margin: 0 }}>{output}</pre>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#cccccc', fontFamily: '"JetBrains Mono", "Fira Code", monospace', overflow: 'hidden' },
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e1e1e', color: '#fff' },
  activityBar: { width: '50px', backgroundColor: '#333333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderRight: '1px solid #252526', zIndex: 10 },
  activityTop: { display: 'flex', flexDirection: 'column', gap: 20 },
  activityMiddle: { display: 'flex', flexDirection: 'column', gap: 15 },
  activityBottom: { marginBottom: 10 },
  activityIcon: { fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6, textDecoration: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '5px', transition: '0.2s' },
  activityIconActive: { fontSize: '1.2rem', cursor: 'pointer', opacity: 1, textDecoration: 'none', color: '#fff', borderLeft: '2px solid #fff', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#252526' },
  sidebar: { width: '250px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column' },
  explorerHeader: { padding: '10px 20px', fontSize: '0.7rem', letterSpacing: '1px', color: '#bbb', display: 'flex', justifyContent: 'space-between' },
  projectTitle: { padding: '5px 20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#61dafb', textTransform: 'uppercase' },
  fileTree: { marginTop: 5, overflowY: 'auto', flex: 1 },
  folderHeader: { padding: '4px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center' },
  fileItem: { padding: '4px 20px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', transition: 'background 0.1s' },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e' },
  tabsBar: { backgroundColor: '#252526', height: '35px', display: 'flex', alignItems: 'flex-start', overflowX: 'auto' },
  activeTab: { backgroundColor: '#1e1e1e', padding: '8px 15px', fontSize: '0.85rem', borderTop: '1px solid #61dafb', color: '#fff', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  editor: { flex: 1, padding: '20px', backgroundColor: '#1e1e1e', display: 'flex', overflow: 'auto' },
  lineNumbers: { color: '#444', marginRight: 0, paddingRight: '15px', textAlign: 'right', userSelect: 'none', fontSize: '15px', lineHeight: '1.5', width: '40px', borderRight: '1px solid #333' },
  blockCode: { background: 'transparent', margin: 0, padding: 0, fontSize: '15px', lineHeight: '1.5' },
  inputRow: { display: 'flex', alignItems: 'center', height: '22.5px', overflow: 'hidden' },
  inlineCode: { background: 'transparent', margin: 0, padding: 0, display: 'inline-block' },
  inlineInput: { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #61dafb', color: '#fff', fontFamily: 'inherit', fontSize: '15px', width: '120px', textAlign: 'center', outline: 'none', margin: '0 5px', height: '20px', lineHeight: '20px' },
  actionPanel: { padding: '15px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333' },
  debugHeader: { fontSize: '0.75rem', color: '#aaa', marginBottom: 10, display: 'flex', justifyContent: 'space-between' },
  gridOptions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 },
  optionBtn: { padding: '10px', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#ccc', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.9rem', transition: '0.2s' },
  terminal: { height: '120px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333', padding: '10px 15px', overflow: 'auto' },
  runButton: { backgroundColor: '#238636', color: '#fff', border: '1px solid rgba(240,246,252,0.1)', borderRadius: '6px', padding: '8px 20px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  builderArea: { borderBottom: '1px dashed #61dafb', minWidth: '100px', margin: '0 5px', color: '#98c379', padding: '0 5px', cursor: 'pointer' },
  fragmentBtn: { backgroundColor: '#3e4451', border: '1px solid #565c64', color: '#abb2bf', padding: '6px 12px', borderRadius: '15px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.9rem', transition: '0.2s' },
  undoBtn: { background: 'transparent', border: 'none', color: '#e06c75', cursor: 'pointer', fontSize: '1.2rem', marginLeft: 10 },
  hintBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)', 
    border: '1px solid #ffc107',
    color: '#ffc107', 
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
};

export default PracticePage;