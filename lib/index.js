const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');
const os = require('os');
const CryptoJS = require('crypto-js');

const passwordsFile = path.join(
	os.homedir(),
	'.password-manager',
	'passwords.json'
);

function generateEncryptionKey(masterPassword) {
	return CryptoJS.SHA256(masterPassword).toString();
}

function encrypt(data, key) {
	const encrypted = CryptoJS.AES.encrypt(data, key).toString();
	return encrypted;
}

function decrypt(encryptedData, key) {
	const bytes = CryptoJS.AES.decrypt(encryptedData, key);
	const decrypted = bytes.toString(CryptoJS.enc.Utf8);
	return decrypted;
}

async function verifyPassword(password) {
	let master_pass = process.env.MASTER_PASSWORD_HASH;
	try {
		const res = await bcrypt.compare(password, master_pass);
		return res;
	} catch (err) {
		console.error(err.message);
		throw err;
	}
}

async function addPassword(service, username, password, masterPassword) {
	try {
		const isMasterPasswordValid = await verifyPassword(masterPassword);
		if (!isMasterPasswordValid) {
			console.log('Invalid master password.');
			return;
		}

		const encryptionKey = generateEncryptionKey(masterPassword);
		const encryptedPassword = encrypt(password, encryptionKey);
		const data = fs.existsSync(passwordsFile)
			? JSON.parse(fs.readFileSync(passwordsFile))
			: {};
		data[service] = { username, password: encryptedPassword };
		fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
		console.log('Password added.');
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

async function getPassword(service, masterPassword) {
	try {
		const isMasterPasswordValid = await verifyPassword(masterPassword);
		if (!isMasterPasswordValid) {
			console.log('Invalid master password.');
			return;
		}

		if (fs.existsSync(passwordsFile)) {
			const data = JSON.parse(fs.readFileSync(passwordsFile));
			if (data[service]) {
				const { username, password: encryptedPassword } = data[service];
				const encryptionKey = generateEncryptionKey(masterPassword);
				const decryptedPassword = decrypt(encryptedPassword, encryptionKey);
				if (decryptedPassword) {
					console.log(`Username: ${username}`);
					console.log(`Password: ${decryptedPassword}`);
				} else {
					console.log('Password decryption failed.');
				}
			} else {
				console.log('Service not found.');
			}
		} else {
			console.log('No passwords stored.');
		}
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

async function listAllServices(masterPassword) {
	try {
		const isMasterPasswordValid = await verifyPassword(masterPassword);
		if (!isMasterPasswordValid) {
			console.log('Invalid master password.');
			return;
		}

		if (fs.existsSync(passwordsFile)) {
			const data = JSON.parse(fs.readFileSync(passwordsFile));
			const services = Object.keys(data);
			if (services.length > 0) {
				console.log('List of services:');
				services.forEach((service) => {
					console.log(`- ${service}`);
				});
			} else {
				console.log('No services stored.');
			}
		} else {
			console.log('No passwords stored.');
		}
	} catch (error) {}
}

module.exports = {
	generateEncryptionKey,
	encrypt,
	decrypt,
	verifyPassword,
	addPassword,
	getPassword,
	listAllServices,
};
