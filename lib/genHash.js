const bcrypt = require('bcrypt');

// Your master password
const masterPassword = process.argv[2];

if (!masterPassword) {
	console.error('Please provide a master password.');
	process.exit(1);
}
// Hash the master password
const masterPasswordHash = bcrypt.hashSync(masterPassword, 10); // 10 is the number of salt rounds

console.log('MASTER_PASSWORD_HASH:', masterPasswordHash);
