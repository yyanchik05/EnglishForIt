import { useState, useEffect } from 'react';
import { db } from './firebase'; // Підключаємо нашу базу
import { collection, getDocs } from 'firebase/firestore'; // Функції для читання
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function App() {
  const [tasks, setTasks] = useState([]); // Тут будуть всі завдання
  const [currentTask, setCurrentTask] = useState(null); // Активне завдання
  const [output, setOutput] = useState("Waiting for execution...");
  const [loading, setLoading] = useState(true);

  // 1. Ця функція запускається ОДИН раз при вході на сайт
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Йдемо в колекцію 'tasks'
        const querySnapshot = await getDocs(collection(db, "tasks"));
        // Перетворюємо дані в зручний формат
        const loadedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTasks(loadedTasks);
        
        // Якщо є завдання, показуємо перше
        if (loadedTasks.length > 0) {
          setCurrentTask(loadedTasks[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading tasks:", error);
        setOutput("Error: Could not load data from Firebase. Check console.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Функція перевірки відповіді
  const runCode = (selectedOption) => {
    if (!currentTask) return;

    if (selectedOption === currentTask.correct) {
      setOutput(`>> SUCCESS: Process finished with exit code 0\n>> Correct answer: "${currentTask['option_' + selectedOption]}"`);
    } else {
      setOutput(`>> ERROR: LogicError. \n>> Expected '${currentTask.correct}', but got '${selectedOption}'. Try again.`);
    }
  };

  if (loading) return <div style={{color: 'white', padding: 20}}>Loading IDE environment...</div>;
  if (!currentTask) return <div style={{color: 'white', padding: 20}}>No tasks found in database 'tasks'.</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
      
      {/* ЛІВА ПАНЕЛЬ (Список) */}
      <div style={{ width: '250px', borderRight: '1px solid #333', padding: '10px' }}>
        <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '10px' }}>PROJECT EXPLORER</div>
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => { setCurrentTask(task); setOutput("Waiting..."); }}
            style={{ 
              cursor: 'pointer', 
              color: currentTask.id === task.id ? '#61dafb' : '#ccc',
              padding: '5px 0',
              background: currentTask.id === task.id ? '#2d2d2d' : 'transparent'
            }}
          >
            📄 {task.title || "Untitled Task"}
          </div>
        ))}
      </div>

      {/* ЦЕНТРАЛЬНА ПАНЕЛЬ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Редактор */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#282c34', overflow: 'auto' }}>
          <div style={{ color: '#777', marginBottom: '10px' }}>// Level: {currentTask.level}</div>
          
          <SyntaxHighlighter language="python" style={atomOneDark} customStyle={{ background: 'transparent', fontSize: '1.1rem' }}>
            {currentTask.code || "# No code provided"}
          </SyntaxHighlighter>

          {/* Кнопки варіантів */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button onClick={() => runCode('a')} style={btnStyle}>
              var a = "{currentTask.option_a}"
            </button>
            <button onClick={() => runCode('b')} style={btnStyle}>
              var b = "{currentTask.option_b}"
            </button>
          </div>
        </div>

        {/* Термінал */}
        <div style={{ height: '150px', borderTop: '1px solid #333', padding: '10px', backgroundColor: '#1e1e1e' }}>
          <div style={{ borderBottom: '1px solid #333', marginBottom: '5px', fontSize: '0.8rem', color: '#aaa' }}>TERMINAL</div>
          <pre style={{ color: output.includes('SUCCESS') ? '#4caf50' : '#ff5252', fontFamily: 'monospace' }}>
            {output}
          </pre>
        </div>

      </div>
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  backgroundColor: '#3c3f41',
  border: '1px solid #555',
  color: '#e8e8e8',
  cursor: 'pointer',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '1rem'
};

export default App;