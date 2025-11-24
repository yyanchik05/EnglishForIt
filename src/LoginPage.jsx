import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/junior");
    } catch (err) {
      console.log(err.code); // Щоб ти бачила реальний код помилки в консолі (F12)

      // --- ТУТ МИ ПЕРЕКЛАДАЄМО ПОМИЛКИ ---
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Невірний емейл або пароль. Можливо, ви ще не зареєстровані?");
          break;
        case "auth/too-many-requests":
          setError("Забагато спроб входу. Спробуйте пізніше.");
          break;
        case "auth/invalid-email":
          setError("Некоректний формат пошти.");
          break;
        default:
          setError("Помилка входу: " + err.message);
      }
      // ------------------------------------
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>System Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>user.email</label>
            <input type="email" style={styles.input} required onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>user.password</label>
            <input type="password" style={styles.input} required onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} type="submit" style={styles.button}>
            ssh login
          </button>
        </form>
        
        <div style={styles.footer}>
          Need an account? <Link to="/register" style={styles.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

// Використовуємо ті ж самі стилі, що і в RegisterPage
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' },
  card: { backgroundColor: '#252526', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
  header: { textAlign: 'center', marginBottom: '30px', fontFamily: 'monospace', color: '#61dafb' },
  error: { backgroundColor: 'rgba(255, 82, 82, 0.2)', color: '#ff5252', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontFamily: 'monospace', color: '#888', fontSize: '0.9rem' },
  input: { padding: '10px', backgroundColor: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '4px', outline: 'none', fontFamily: 'monospace' },
  button: { padding: '12px', backgroundColor: '#0e639c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1rem', marginTop: '10px' },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#888' },
  link: { color: '#61dafb', textDecoration: 'none' }
};