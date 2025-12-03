import { Link } from 'react-router-dom';
import { useAuth } from "./contexts/AuthContext";
import { motion } from "framer-motion";

function HomePage() {
  const { currentUser } = useAuth();
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div style={styles.container}>
      
      <motion.nav 
        style={styles.navbar}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.logo}>IT.ENGLISH_</div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.link}>Why Us</a>
          <a href="#levels" style={styles.link}>Levels</a>
          {currentUser ? (
            <Link to="/profile" style={styles.ctaButtonSmall}>
              👤 {currentUser.displayName || currentUser.email.split('@')[0]}
            </Link>
          ) : (
            <Link to="/login" style={styles.ctaButtonSmall}>Sign In</Link>
          )}
        </div>
      </motion.nav>

      <section style={styles.heroSection}>
        <div style={styles.overlay}></div>
        <div style={styles.content}>
          
          <motion.h1 
            style={styles.title}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span style={{ color: '#ccc' }}>while(</span>alive<span style={{ color: '#ccc' }}>)</span> <br/> 
            <span style={styles.gradientText}>learn_english()</span>;
          </motion.h1>

          <motion.p 
            style={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Stop learning "London is the capital". <br/>
            Start learning "Merge Conflict", "Daily Standup", and "Salary Negotiation".
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/junior" style={styles.mainButton}>
              <motion.span animate={pulseAnimation} style={{display: 'inline-block'}}>
                 Launch Terminal_
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="features" style={styles.sectionDark}>
        <motion.h2 
          style={styles.sectionTitle}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          // SYSTEM FEATURES
        </motion.h2>
        
        <div style={styles.gridThree}>
          {[
            { icon: "⚡", title: "Grammar as Code", desc: "We treat English tenses like syntax. If you use Past Simple wrong, it's a Compilation Error." },
            { icon: "🛠", title: "Real Scenarios", desc: "Practice replying to Jira tickets, writing commit messages, and arguing in Code Reviews." },
            { icon: "ue", title: "Soft Skills Patch", desc: "Special module for introverts: How to survive Small Talk before the meeting starts." }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              transition={{ delay: index * 0.2 }}
            >
              <FeatureCard {...item} />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="levels" style={styles.sectionGray}>
        <motion.h2 
          style={styles.sectionTitle}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          // CHOOSE YOUR DIFFICULTY
        </motion.h2>

        <div style={styles.gridThree}>
          <AnimatedLevelCard 
            level="JUNIOR" color="#61dafb" delay={0.1}
            desc="Level up your communication. Focus on project management, soft skills, and keeping the team updated.."
            topics={['Daily Reports', 'Error Messages', 'Git & Actions']}
          />
          <AnimatedLevelCard 
            level="MIDDLE" color="#4caf50" delay={0.3}
            desc="Communication is key. Learn how to suggest changes, conduct code reviews, and mentor juniors."
            topics={['Daily Status', 'Daily Standup Speech', 'Writing Documentation']}
          />
          <AnimatedLevelCard 
            level="SENIOR" color="#ff5252" delay={0.5}
            desc="High-level architecture discussions and client negotiations. Master the art of saying 'No' politely."
            topics={['System Design Presentation', 'Salary Negotiation', 'Crisis Management']}
          />
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={{opacity: 0.6}}>© 2025 IT.English_ Open Source Project.</div>
        <div style={{marginTop: 10, fontFamily: 'monospace', color: '#666'}}>git push --force english-skills</div>
      </footer>

    </div>
  );
}


function FeatureCard({ icon, title, desc }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: '2.5rem', marginBottom: 15 }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: 10, color: '#fff' }}>{title}</h3>
      <p style={{ color: '#aaa', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

function AnimatedLevelCard({ level, color, desc, topics, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      style={{ height: '100%' }} 
    >
      <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
        <div style={{ flex: 1 }}> 
          <h3 style={{ fontSize: '1.5rem', marginBottom: 10, color: color }}>{level} DEV</h3>
          <p style={{ color: '#ccc', marginBottom: 20, minHeight: '60px' }}>{desc}</p>
          <div style={{ textAlign: 'left', background: '#111', padding: 15, borderRadius: 5, marginBottom: 20 }}>
            <div style={{ color: '#777', fontSize: '0.8rem', marginBottom: 5 }}>MODULES_LOADED:</div>
            {topics.map(t => (
              <div key={t} style={{ color: '#eee', fontSize: '0.9rem', fontFamily: 'monospace' }}>➜ {t}</div>
            ))}
          </div>
        </div>

        <Link to={`/${level.toLowerCase()}`} style={{ ...styles.levelButton, border: `1px solid ${color}`, color: color }}>
          Select Level
        </Link>
      </div>
    </motion.div>
  );
}

const styles = {
  container: { fontFamily: "'Inter', sans-serif", color: 'white', overflowX: 'hidden', scrollBehavior: 'smooth' },
  navbar: {
    position: 'fixed', top: 0, width: '100%', height: '70px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 50px', zIndex: 100,
    background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  logo: { fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff', letterSpacing: '-1px' },
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', transition: '0.3s' },
  ctaButtonSmall: {
    padding: '8px 20px', background: '#fff', color: '#000', textDecoration: 'none',
    fontWeight: 'bold', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'
  },
  heroSection: {
    height: '100vh', width: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
  },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,10,0.85)' },
  content: { position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', padding: '20px' },
  
  title: { fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', fontFamily: 'monospace', lineHeight: '1.2' },
  
  gradientText: {
    background: 'linear-gradient(90deg, #61dafb, #d2a8ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },

  subtitle: { fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', lineHeight: '1.6' },
  mainButton: {
    padding: '15px 40px', fontSize: '1.1rem', background: '#61dafb', color: '#000',
    textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(97, 218, 251, 0.3)', transition: '0.3s', display: 'inline-block'
  },
  sectionDark: { padding: '80px 50px', backgroundColor: '#141414', textAlign: 'center' },
  sectionGray: { padding: '80px 50px', backgroundColor: '#1a1a1a', textAlign: 'center' },
  sectionTitle: { fontSize: '1.8rem', marginBottom: '60px', fontFamily: 'monospace', color: '#555' },
  gridThree: {
    display: 'flex', 
    justifyContent: 'center', 
    gap: '30px', 
    flexWrap: 'wrap', 
    maxWidth: '1200px', 
    margin: '0 auto',
    alignItems: 'stretch' 
  },

  card: {
    backgroundColor: '#222', 
    padding: '30px', 
    borderRadius: '10px', 
    width: '350px',
    textAlign: 'left', 
    border: '1px solid #333', 
    transition: '0.3s',
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%',
    boxSizing: 'border-box'
  },

  levelButton: {
    display: 'block', 
    padding: '10px', 
    textAlign: 'center',
    textDecoration: 'none', 
    borderRadius: '5px', 
    fontWeight: 'bold',
    transition: '0.3s', 
    marginTop: 'auto' 
  },
  footer: {
    padding: '40px', textAlign: 'center', backgroundColor: '#0a0a0a', 
    color: '#555', fontFamily: 'monospace', fontSize: '0.9rem',
    borderTop: '1px solid #222'
  }
};

export default HomePage;