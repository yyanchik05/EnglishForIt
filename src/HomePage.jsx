import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={styles.container}>
      
      {/* --- НАВІГАЦІЯ (Закріплена) --- */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>IT.ENGLISH_</div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.link}>Why Us</a>
          <a href="#levels" style={styles.link}>Levels</a>
          <Link to="/practice" style={styles.ctaButtonSmall}>Start Coding</Link>
        </div>
      </nav>

      {/* --- HERO SECTION (Екран 1) --- */}
      <section style={styles.heroSection}>
        <div style={styles.overlay}></div>
        <div style={styles.content}>
          <h1 style={styles.title}>
            <span style={{ color: '#ccc' }}>while(</span>alive<span style={{ color: '#ccc' }}>)</span> <br/> 
            <span style={{ color: '#61dafb' }}>learn_english()</span>;
          </h1>
          <p style={styles.subtitle}>
            Stop learning "London is the capital". <br/>
            Start learning "Merge Conflict", "Daily Standup", and "Salary Negotiation".
          </p>
          <Link to="/practice" style={styles.mainButton}>
            Launch Terminal_ 
          </Link>
        </div>
      </section>

      {/* --- FEATURES (Чому це круто) --- */}
      <section id="features" style={styles.sectionDark}>
        <h2 style={styles.sectionTitle}>// SYSTEM FEATURES</h2>
        <div style={styles.gridThree}>
          <FeatureCard 
            icon="⚡" 
            title="Grammar as Code" 
            desc="We treat English tenses like syntax. If you use Past Simple wrong, it's a Compilation Error." 
          />
          <FeatureCard 
            icon="🛠" 
            title="Real Scenarios" 
            desc="Practice replying to Jira tickets, writing commit messages, and arguing in Code Reviews." 
          />
          <FeatureCard 
            icon="ue" 
            title="Soft Skills Patch" 
            desc="Special module for introverts: How to survive Small Talk before the meeting starts." 
          />
        </div>
      </section>

      {/* --- LEVELS (Джун, Мідл, Сеньйор) --- */}
      <section id="levels" style={styles.sectionGray}>
        <h2 style={styles.sectionTitle}>// CHOOSE YOUR DIFFICULTY</h2>
        <div style={styles.gridThree}>
          
          {/* JUNIOR CARD */}
          <LevelCard 
            level="JUNIOR" 
            color="#61dafb" // React Blue
            desc="Focus on basic syntax and technical vocabulary. Learn to read documentation without Google Translate."
            topics={['Present Perfect vs Past Simple', 'Basic Git Commands', 'Reporting Bugs']}
          />

          {/* MIDDLE CARD */}
          <LevelCard 
            level="MIDDLE" 
            color="#4caf50" // Green
            desc="Communication is key. Learn how to suggest changes, conduct code reviews, and mentor juniors."
            topics={['Polite Refactoring Requests', 'Daily Standup Speech', 'Writing Documentation']}
          />

          {/* SENIOR CARD */}
          <LevelCard 
            level="SENIOR" 
            color="#ff5252" // Red
            desc="High-level architecture discussions and client negotiations. Master the art of saying 'No' politely."
            topics={['System Design Presentation', 'Salary Negotiation', 'Handling Critical Feedback']}
          />

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={{opacity: 0.6}}>© 2025 EnglishForIT. Open Source Project.</div>
        <div style={{marginTop: 10}}>git push --force english-skills</div>
      </footer>

    </div>
  );
}

// --- КОМПОНЕНТИ-ЦЕГЛИНКИ (Щоб код був чистим) ---

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: '2.5rem', marginBottom: 15 }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: 10, color: '#fff' }}>{title}</h3>
      <p style={{ color: '#aaa', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

// Заміни функцію LevelCard на цю:
function LevelCard({ level, color, desc, topics }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: 10, color: color }}>{level} DEV</h3>
        <p style={{ color: '#ccc', marginBottom: 20, minHeight: '60px' }}>{desc}</p>
        
        <div style={{ textAlign: 'left', background: '#111', padding: 15, borderRadius: 5, marginBottom: 20 }}>
          <div style={{ color: '#777', fontSize: '0.8rem', marginBottom: 5 }}>MODULES_LOADED:</div>
          {topics.map(t => (
            <div key={t} style={{ color: '#eee', fontSize: '0.9rem', fontFamily: 'monospace' }}>➜ {t}</div>
          ))}
        </div>
      </div>

      {/* Кнопка тепер завжди знизу і передає параметр level */}
      <Link 
        to={`/practice?level=${level.toLowerCase()}`} 
        style={{ ...styles.levelButton, border: `1px solid ${color}`, color: color }}
      >
        Select Level
      </Link>
    </div>
  );
}

// --- СТИЛІ ---
const styles = {
  container: { fontFamily: "'Inter', sans-serif", color: 'white', overflowX: 'hidden' },
  navbar: {
    position: 'fixed', top: 0, width: '100%', height: '70px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 50px', zIndex: 100,
    background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  logo: { fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff' },
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', transition: '0.3s' },
  ctaButtonSmall: {
    padding: '8px 20px', background: '#fff', color: '#000', textDecoration: 'none',
    fontWeight: 'bold', borderRadius: '4px', fontSize: '0.9rem'
  },
  // Hero Styles
  heroSection: {
    height: '100vh', width: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
  },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,10,0.85)' },
  content: { position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', padding: '20px' },
  title: { fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', fontFamily: 'monospace' },
  subtitle: { fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', lineHeight: '1.6' },
  mainButton: {
    padding: '15px 40px', fontSize: '1.1rem', background: '#61dafb', color: '#000',
    textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(97, 218, 251, 0.3)'
  },
  // Sections Styles
  sectionDark: { padding: '80px 50px', backgroundColor: '#141414', textAlign: 'center' },
  sectionGray: { padding: '80px 50px', backgroundColor: '#1a1a1a', textAlign: 'center' },
  sectionTitle: { fontSize: '1.8rem', marginBottom: '60px', fontFamily: 'monospace', color: '#555' },
  gridThree: {
    display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto'
  },
  card: {
    backgroundColor: '#222', padding: '30px', borderRadius: '10px', width: '350px',
    textAlign: 'left', border: '1px solid #333', transition: '0.3s',
    // --- НОВІ ВЛАСТИВОСТІ ДЛЯ ВИРІВНЮВАННЯ ---
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between' // Розтягує контент по висоті
  },
  levelButton: {
    display: 'block', padding: '10px', textAlign: 'center',
    textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold',
    transition: '0.3s',
    marginTop: 'auto' // Магічна властивість: штовхає кнопку в самий низ
  },
  levelButton: {
    display: 'block', marginTop: '20px', padding: '10px', textAlign: 'center',
    textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold',
    transition: '0.3s'
  },
  footer: {
    padding: '40px', textAlign: 'center', backgroundColor: '#0a0a0a', 
    color: '#555', fontFamily: 'monospace', fontSize: '0.9rem',
    borderTop: '1px solid #222'
  }
};

export default HomePage;