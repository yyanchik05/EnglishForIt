import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPass) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      
      await signup(email, password);
      
      navigate("/verify-email"); 
      
    } catch (err) {
      setError("Failed to create an account: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Init New User</h2>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>const email =</label>
            <input type="email" style={styles.input} required onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>const password =</label>
            <input type="password" style={styles.input} required onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>const confirm =</label>
            <input type="password" style={styles.input} required onChange={(e) => setConfirmPass(e.target.value)} />
          </div>

          <button disabled={loading} type="submit" style={styles.button}>
            git commit -m "Register"
          </button>
        </form>
        
        <div style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' },
  card: { backgroundColor: '#252526', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
  header: { textAlign: 'center', marginBottom: '30px', fontFamily: 'monospace', color: '#61dafb' },
  error: { backgroundColor: 'rgba(255, 82, 82, 0.2)', color: '#ff5252', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontFamily: 'monospace', color: '#888', fontSize: '0.9rem' },
  input: { padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '4px', outline: 'none', fontFamily: 'monospace' },
  button: { padding: '12px', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1rem', marginTop: '10px' },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#888' },
  link: { color: '#61dafb', textDecoration: 'none' }
};