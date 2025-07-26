
// server.js (Promise-based and Secure)
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const app = express();
const PORT = 3000;
// Multer storage for voter ID uploads
const idUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/voter_ids'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
  })
});

// MySQL Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Jabalpur@1',
  database: 'online_voting_system'
});
const db = pool;
console.log('✅ MySQL pool created.');


// Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/symbols', express.static(path.join(__dirname, 'public/image/symbols')));

// Rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Session
app.use(session({
  secret: 'voting_secret_key',
  resave: false,
  saveUninitialized: false
}));



// Multer storage
const symbolUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/image/symbols'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
  })
});



// Auth middleware
const requireAdminAuth = (req, res, next) => req.session.adminId ? next() : res.redirect('/admin-login.html');
const requireVoterAuth = (req, res, next) => req.session.voter ? next() : res.redirect('/voter-login.html');



app.post('/admin-register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. पहले check करो कि user पहले से है या नहीं
    const [existing] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).send("⚠️ Admin already registered");
    }

    // 2. Password encrypt करो
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. New admin insert करो
    await db.query("INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)", [
      username, email, hashedPassword
    ]);

    console.log("🟢 Admin registered successfully");
    res.redirect('/admin-login.html'); // ✅ Login page पर redirect करो

  } catch (err) {
    console.error("❌ Admin registration error:", err);
    res.status(500).send("Server error. Please try again later.");
     res.status(500).send("Server Error"); // 🔴 Error आने पर भी return करो
  }
});



app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).send('❌ Admin not found');
    }

    const isValid = await bcrypt.compare(password, rows[0].password_hash);

    if (!isValid) {
      return res.status(401).send('❌ Invalid password');
    }

    req.session.adminId = rows[0].id;
    res.redirect('/admin-dashboard.html');

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).send('❌ Server error during admin login');
  }
});


// Voter Registration
app.post('/register-voter', idUpload.single('voter_id_image'), async (req, res) => {
  console.log("📥 Received voter registration body:", req.body); // ⬅️ Add this line
  const { email, full_name, password, voter_id } = req.body;
  const image = req.file?.filename;
  if (!image) return res.status(400).send('Voter ID required');

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO Voters (full_name, email, password_hash, voter_id, voter_id_image, is_verified) VALUES (?, ?, ?, ?, ?, false)',
      [full_name, email, hash, voter_id, image]
    );
    res.send('✅ Registration successful!');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

app.post('/voter-login', async (req, res) => {
  const { voter_id, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM voters WHERE voter_id = ?', [voter_id]);

    if (rows.length === 0) {
      return res.status(401).send('❌ Voter not found');
    }

    const isValid = await bcrypt.compare(password, rows[0].password_hash);

    if (!isValid) {
      return res.status(401).send('❌ Invalid password');
    }

    req.session.voterId = rows[0].id;
    res.redirect('/voter-dashboard.html');

  } catch (err) {
    console.error('Voter login error:', err);
    res.status(500).send('❌ Server error during voter login');
  }
});



// Get candidates
app.get('/get-candidates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM candidates');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Candidate fetch failed');
  }
});

app.post('/add-candidate', symbolUpload.single('symbolFile'), async (req, res) => {
  try {
    const { name, party, type } = req.body;
    const symbol = req.file ? req.file.filename : req.body.symbol;
    
    await pool.query(
      'INSERT INTO candidates (name, party, type, symbol, votes) VALUES (?, ?, ?, ?, 0)',
      [name, party, type, symbol]
    );
    console.log("🟢 Candidate added successfully");  
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error adding candidate:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});


// Edit candidate
app.post('/edit-candidate/:id', symbolUpload.single('symbolFile'), async (req, res) => {
  const { id } = req.params;
  const { name, party, type } = req.body;
  const symbol = req.file ? req.file.filename : req.body.symbol;

  try {
    await pool.query('UPDATE candidates SET name = ?, party = ?, symbol = ?, type = ? WHERE id = ?', [name, party, symbol, type, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update error' });
  }
});

// Delete candidate
app.delete('/delete-candidate/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete error' });
  }
});

app.post('/cast-vote', async (req, res) => {
  const { candidateId } = req.body;
  const voterId = req.session.voterId;

  if (!voterId) {
    return res.status(401).send('Unauthorized. Please login as voter.');
  }

  try {
    await pool.query('INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)', [voterId, candidateId]);
    res.redirect('/thank-you.html');
  } catch (err) {
    console.error('❌ Error casting vote:', err);
    res.status(500).send('Server error while casting vote');
  }
});

// View results
app.get('/api/results', requireAdminAuth, async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT candidates.name, candidates.party, COUNT(votes.id) as vote_count
      FROM candidates
      LEFT JOIN votes ON candidates.id = votes.candidate_id
      GROUP BY candidates.id
      ORDER BY vote_count DESC
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load results' });
  }
});

app.get('/api/voters', async (req, res) => {
  try {
    const [voters] = await pool.query('SELECT * FROM voters');
    res.json(voters);
  } catch (err) {
    console.error('❌ Error fetching voters:', err);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
});
app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, party FROM candidates');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});



// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Serve static HTML pages
const pages = [
  'voter-login', 'voter-register', 'vote-cast', 'admin-login',
  'admin-dashboard', 'manage-candidates', 'view-voters', 'results',
  'thank-you', 'admin-register','voter-dashboard'
];
pages.forEach(page => {
  app.get(`/${page}.html`, (req, res) =>
    res.sendFile(path.join(__dirname, 'public', `${page}.html`))
  );
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
