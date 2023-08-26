const fs = require('fs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const enquirer = require('enquirer');
const CryptoJS = require('crypto-js');

dotenv.config();
const passwordsFile = 'passwords.json'; // Store encrypted passwords in a JSON file

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

async function main() {
	try {
		const prompt = new enquirer.Select({
			name: 'action',
			message: 'What would you like to do?',
			choices: ['Add password', 'Get password', 'List all services', 'Exit'],
		});

		const action = await prompt.run();

		if (action === 'Add password') {
			const servicePrompt = new enquirer.Input({
				name: 'service',
				message: 'Service name:',
			});

			const usernamePrompt = new enquirer.Input({
				name: 'username',
				message: 'Username:',
			});

			const passwordPrompt = new enquirer.Password({
				name: 'password',
				message: 'Password:',
			});

			const masterPasswordPrompt = new enquirer.Password({
				name: 'masterPassword',
				message: 'Enter your master password:',
			});

			const service = await servicePrompt.run();
			const username = await usernamePrompt.run();
			const password = await passwordPrompt.run();
			const masterPassword = await masterPasswordPrompt.run();

			addPassword(service, username, password, masterPassword);
		} else if (action === 'Get password') {
			const getPrompt = new enquirer.Input({
				name: 'service',
				message: 'Enter the service name:',
			});

			const service = await getPrompt.run();
			const masterPasswordPrompt = new enquirer.Password({
				name: 'masterPassword',
				message: 'Enter your master password:',
			});
			const masterPassword = await masterPasswordPrompt.run();

			getPassword(service, masterPassword);
		} else if (action === 'List all services') {
			const masterPasswordPrompt = new enquirer.Password({
				name: 'masterPassword',
				message: 'Enter your master password:',
			});
			const masterPassword = await masterPasswordPrompt.run();
			listAllServices(masterPassword);
		} else {
			console.log('Exiting.');
		}
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

main();
