#!/usr/bin/env node

const enquirer = require('enquirer');

const { addPassword, getPassword, listAllServices } = require('../lib/index');

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
