const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Jabalpur@1',
  database: 'online_voting_system' // ✅ Make sure this exists
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

module.exports = db;
