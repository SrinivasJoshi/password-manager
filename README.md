# Command Line Password Manager

This is a simple command-line password manager that allows you to securely store and retrieve passwords for various services. The passwords are encrypted using AES encryption with a master password.

## Tech Stack

- Node.js

- bcrypt for password hashing

- crypto-js for encryption and decryption

- enquirer for interactive command-line prompts

- dotenv for managing environment variables

## Usage

1. Clone this repository to your local machine.

2. Install the required dependencies:

```sh
 npm install
```

3. Replace `'your_actual_master_password'` with your actual master password in `genMasterPassHash.js` file.
4. Run the command :

```sh
 node genMasterPassHash.js
```

5. Copy the generated hash and save it in a `.env` file in the project's root directory. An example `.env.example` file is provided as a reference.
6. Run the password manager :

```sh
node index.js
```

Follow the prompts to add, retrieve, or list passwords for services.

## Features

- **Add Password**: Store service names, usernames, and passwords securely.
- **Get Password:** Retrieve stored passwords using the master password.
- **List All Services:** View a list of all stored services.

## Important Notes

- The master password hash should be stored securely in the `.env` file.
- Always follow security best practices when handling sensitive information.
- This password manager uses AES encryption for password storage.
- Make sure to keep your master password safe and don't share it.
- The provided `genMasterPassHash.js` script helps generate the master password hash.

## Contributing

Feel free to contribute by creating issues, suggesting enhancements, or submitting pull requests.

## License

This project is licensed under the MIT License.
