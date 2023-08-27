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

function hasMasterPassword() {
	if (fs.existsSync(passwordsFile)) {
		const data = JSON.parse(fs.readFileSync(passwordsFile));
		return data.hasOwnProperty('masterPassword');
	}
	return false;
}

function addMasterPassword(masterPassword) {
	try {
		const data = fs.existsSync(passwordsFile)
			? JSON.parse(fs.readFileSync(passwordsFile))
			: {};
		data['masterPassword'] = masterPassword;
		fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

async function verifyPassword(password) {
	const data = JSON.parse(fs.readFileSync(passwordsFile));
	const masterPasswordHash = data['masterPassword'];
	try {
		const res = await bcrypt.compare(password, masterPasswordHash);
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

async function updatePassword(service, newPassword, masterPassword) {
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
					const updatedEncryptedPassword = encrypt(newPassword, encryptionKey);
					data[service].password = updatedEncryptedPassword;
					fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
					console.log(`Password for service "${service}" updated.`);
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
			if (services.length > 1) {
				console.log('List of services:');
				services.forEach((service) => {
					console.log(`- ${service}`);
				});
			} else {
				console.log('No passwords stored.');
			}
		} else {
			console.log('No passwords stored.');
		}
	} catch (error) {}
}

async function removeService(service, masterPassword) {
	try {
		const isMasterPasswordValid = await verifyPassword(masterPassword);
		if (!isMasterPasswordValid) {
			console.log('Invalid master password.');
			return;
		}
		if (service === 'masterPassword') {
			console.log('Cannot delete master password.');
			return;
		}

		if (fs.existsSync(passwordsFile)) {
			const data = JSON.parse(fs.readFileSync(passwordsFile));
			if (data[service]) {
				delete data[service];
				fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
				console.log(`Service "${service}" removed.`);
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

async function updateMasterPassword(newMasterPassword, currentMasterPassword) {
	try {
		const isCurrentMasterPasswordValid = await verifyPassword(
			currentMasterPassword
		);
		if (!isCurrentMasterPasswordValid) {
			console.log('Invalid current master password.');
			return;
		}

		const data = JSON.parse(fs.readFileSync(passwordsFile));
		data['masterPassword'] = newMasterPassword;
		fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
		console.log('Master password updated.');
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

const asciiArt = `
          .         .                                                                                            
         ,8.       ,8.          8 888888888o.   8 8888     ,88' 8 8888888888   \`8.\`8888.      ,8'    d888888o.   
        ,888.     ,888.         8 8888    \`88.  8 8888    ,88'  8 8888          \`8.\`8888.    ,8'   .\`8888:' \`88. 
       .\`8888.   .\`8888.        8 8888     \`88  8 8888   ,88'   8 8888           \`8.\`8888.  ,8'    8.\`8888.   Y8 
      ,8.\`8888. ,8.\`8888.       8 8888     ,88  8 8888  ,88'    8 888888888888     \`8.\`8888.,8'     \`8.\`8888.     
     ,8'8.\`8888,8^8.\`8888.      8 8888.   ,88'  8 8888 ,88'     8 8888              \`8.\`88888'       \`8.\`8888.    
    ,8' \`8.\`8888' \`8.\`8888.     8 888888888P'   8 8888 88'      8 8888               \`8 8888         \`8.\`8888.   
   ,8'   \`8.\`88'   \`8.\`8888.    8 8888\`8b       8 888888<       8 8888               \`8 8888          \`8.\`8888.  
  ,8'     \`8.\`'     \`8.\`8888.   8 8888 \`8b.     8 8888 \`Y8.     8 8888                8 8888      8b   \`8.\`8888. 
 ,8'       \`8        \`8.\`8888.  8 8888   \`8b.   8 8888   \`Y8.   8 8888                8 8888      \`8b.  ;8.\`8888 
,8'         \`         \`8.\`8888. 8 8888     \`88. 8 8888     \`Y8. 8 888888888888        8 8888       \`Y8888P ,88P' 
`;

module.exports = {
	generateEncryptionKey,
	encrypt,
	decrypt,
	verifyPassword,
	hasMasterPassword,
	updateMasterPassword,
	addMasterPassword,
	addPassword,
	getPassword,
	updatePassword,
	listAllServices,
	asciiArt,
	removeService,
};
