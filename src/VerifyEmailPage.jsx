import { useAuth } from "./contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
      alert("Email sent again!");
    }
  };

  const checkVerification = async () => {
    await currentUser.reload();
    
    if (currentUser.emailVerified) {
      navigate("/junior");
    } else {
      alert("Not verified yet. Check your spam folder!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{fontSize: '3rem', marginBottom: 20}}>📧</div>
        <h2 style={{color: '#61dafb', marginBottom: 10}}>Verify your Email</h2>
        <p style={{color: '#ccc', lineHeight: '1.5'}}>
          We sent a link to <span style={{color: '#fff', fontWeight: 'bold'}}>{currentUser?.email}</span>.
          <br/>Please check your inbox (and spam) to unlock the IDE.
        </p>

        <div style={styles.buttons}>
          <button onClick={checkVerification} style={styles.primaryBtn}>
            I have verified it!
          </button>
          
          <button onClick={handleResend} style={styles.secondaryBtn}>
            Resend Email
          </button>

          <button onClick={() => logout()} style={styles.linkBtn}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' },
  card: { backgroundColor: '#252526', padding: '40px', borderRadius: '10px', maxWidth: '500px', textAlign: 'center', border: '1px solid #333' },
  buttons: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' },
  primaryBtn: { padding: '12px', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  secondaryBtn: { padding: '12px', backgroundColor: 'transparent', color: '#61dafb', border: '1px solid #61dafb', borderRadius: '5px', cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }
};