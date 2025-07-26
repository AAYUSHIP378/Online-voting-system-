const bcrypt = require('bcrypt');

async function generateHash() {
  const hash = await bcrypt.hash("admin123", 10);  // You can change the password here
  console.log("Hashed Password:", hash);
}

generateHash();
