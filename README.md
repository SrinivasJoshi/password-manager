# Command Line Password Manager

This is a simple command-line password manager that allows you to securely store and retrieve passwords for various services. The passwords are encrypted using AES encryption with a master password.

## Tech Stack

- Node.js

- bcrypt for password hashing

- crypto-js for encryption and decryption

- enquirer for interactive command-line prompts

## Usage

### I

```sh
npm i mrkeys
```

### II

1. Clone this repository to your local machine.

2. Install the required dependencies:

```sh
 npm install
```

3. Run the password manager :

```sh
mrkeys
```

Follow the prompts to add, retrieve, or list passwords for services.

## Important Notes

- The master password hash should be stored securely in the `.env` file.
- Always follow security best practices when handling sensitive information.
- This password manager uses AES encryption for password storage.
- Make sure to keep your master password safe and don't share it.

## Plans for V2

- Integrate macos finger-print and make master-password redundant
- File permissions for file storing passwords

## License

This project is licensed under the MIT License.
