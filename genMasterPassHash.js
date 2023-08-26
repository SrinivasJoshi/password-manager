const bcrypt = require('bcrypt');

// Your master password (replace this with your actual master password)
const masterPassword = 'your_actual_master_password';

// Hash the master password
const masterPasswordHash = bcrypt.hashSync(masterPassword, 10); // 10 is the number of salt rounds

console.log('MASTER_PASSWORD_HASH:', masterPasswordHash);
