#!/usr/bin/env node
const enquirer = require('enquirer');
const bcrypt = require('bcrypt');

const {
	addPassword,
	getPassword,
	updatePassword,
	listAllServices,
	asciiArt,
	removeService,
	hasMasterPassword,
	addMasterPassword,
	updateMasterPassword,
} = require('../lib/index');

async function main() {
	console.log(asciiArt);
	try {
		if (!hasMasterPassword()) {
			const masterPasswordPrompt = new enquirer.Password({
				name: 'masterPassword',
				message: 'Create your master password:',
			});

			const confirmPasswordPrompt = new enquirer.Password({
				name: 'confirmPassword',
				message: 'Confirm your master password:',
			});

			const masterPassword = await masterPasswordPrompt.run();
			const confirmPassword = await confirmPasswordPrompt.run();

			if (masterPassword === confirmPassword) {
				const masterPasswordHash = await bcrypt.hash(masterPassword, 10);
				addMasterPassword(masterPasswordHash);
				console.log(
					'Master password set up successfully. Use `mrkeys` command again'
				);
			} else {
				console.log('Passwords do not match. Please try again.');
				return;
			}
		} else {
			const prompt = new enquirer.Select({
				name: 'action',
				message: 'Namaskara👋, how can I help you?',
				choices: [
					'Add password',
					'Get password',
					'List all services',
					'Remove service',
					'Update password',
					'Update master password',
					'Exit',
				],
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
			} else if (action === 'Update password') {
				const updatePrompt = new enquirer.Input({
					name: 'service',
					message: 'Enter the service name to update:',
				});
				const service = await updatePrompt.run();

				const newPasswordPrompt = new enquirer.Password({
					name: 'newPassword',
					message: 'New password:',
				});
				const newPassword = await newPasswordPrompt.run();

				const masterPasswordPrompt = new enquirer.Password({
					name: 'masterPassword',
					message: 'Enter your master password:',
				});
				const masterPassword = await masterPasswordPrompt.run();

				updatePassword(service, newPassword, masterPassword);
			} else if (action === 'List all services') {
				const masterPasswordPrompt = new enquirer.Password({
					name: 'masterPassword',
					message: 'Enter your master password:',
				});
				const masterPassword = await masterPasswordPrompt.run();
				listAllServices(masterPassword);
			} else if (action === 'Remove service') {
				const removePrompt = new enquirer.Input({
					name: 'service',
					message: 'Enter the service name to remove:',
				});

				const service = await removePrompt.run();
				const masterPasswordPrompt = new enquirer.Password({
					name: 'masterPassword',
					message: 'Enter your master password:',
				});

				const masterPassword = await masterPasswordPrompt.run();
				removeService(service, masterPassword);
			} else if (action === 'Update master password') {
				const masterPasswordPrompt = new enquirer.Password({
					name: 'masterPassword',
					message: 'Enter your master password:',
				});
				const masterPassword = await masterPasswordPrompt.run();

				const newPasswordPrompt = new enquirer.Password({
					name: 'updatedPassword',
					message: 'New master password:',
				});

				const newPassword = await newPasswordPrompt.run();
				const masterPasswordHash = await bcrypt.hash(newPassword, 10);

				updateMasterPassword(masterPasswordHash, masterPassword);
			} else {
				console.log('Exiting.');
			}
		}
	} catch (error) {
		console.error('An error occurred:', error.message);
	}
}

main();
