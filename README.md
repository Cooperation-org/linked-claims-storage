# @cooperation/vc-storage

**Version**: 1.0.0

## Overview

`@cooperation/vc-storage` is a TypeScript library that allows you to sign and store Verifiable Credentials (VCs) in various storage strategies. This library provides flexibility and security by allowing you to choose where your VCs are stored, whether on cloud services like Google Drive, on your local device, or in your digital wallet. Support for Dropbox and wallet storage is currently under development.

## Features

- **Sign and Store VCs**: Securely sign your Verifiable Credentials and store them in your preferred storage medium.
- **Google Drive Integration**: Seamlessly store your VCs on Google Drive.
- **Local Device Storage**: Store your VCs directly on your device.
- **Future Integrations**:
  - **Wallet Storage**: Integration for storing VCs directly in your digital wallet (under development).
  - **Dropbox Storage**: Integration for storing VCs in Dropbox (under development).

## Installation

You can install this package via npm:

```bash
npm install @cooperation/vc-storage
```

## Usage

### Basic Example

Here’s how you can use the `@cooperation/vc-storage` library to sign and store your VCs:

```typescript
import { saveToGoogleDrive, CredentialEngine, GoogleDriveStorage } from '@cooperation/vc-storage';

const accessToken = 'your-google-drive-access-token';
const credentialEngine = new CredentialEngine();
const storage = new GoogleDriveStorage(accessToken);

async function main(useWallet = false, walletAddress = '') {
	const formData = {
		expirationDate: '2025-12-31T23:59:59Z',
		fullName: 'John Doe',
		duration: '1 year',
		criteriaNarrative: 'This is a narrative',
		achievementDescription: 'This is an achievement',
		achievementName: 'Achievement Name',
		portfolio: [
			{ name: 'Portfolio 1', url: 'https://example.com/portfolio1' },
			{ name: 'Portfolio 2', url: 'https://example.com/portfolio2' },
		],
		evidenceLink: 'https://example.com/evidence',
		evidenceDescription: 'This is an evidence description',
		credentialType: 'Credential Type',
	};

	let didDocument, keyPair;

	// Step 1: Create DID based on the selected method
	if (useWallet && walletAddress) {
		({ didDocument, keyPair } = await credentialEngine.createWalletDID(walletAddress));
	} else {
		({ didDocument, keyPair } = await credentialEngine.createDID());
	}

	await saveToGoogleDrive(storage, { ...didDocument, keyPair }, 'DID');

	const issuerDid = didDocument.id;

	// Step 2: Create an Unsigned VC
	const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	await saveToGoogleDrive(storage, unsignedVC, 'UnsignedVC');
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign the VC
	try {
		const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
		await saveToGoogleDrive(storage, signedVC, 'VC');
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}

	// Retrieve all stored claims
	const claims = await storage.getAllClaims();
	console.log('Stored Claims:', claims);
}

// Example usage:
// 1. For Google Drive storage with standard DID creation
main().catch(console.error);

// 2. For Google Drive storage with wallet-based DID creation
// main(true, 'your-wallet-address').catch(console.error);
```

### Available Storage Strategies

1. **Google Drive**: Store your VCs on Google Drive.
2. **Local Device**: Store your VCs on your local device.
3. **Wallet Storage**: (Under Development) Store your VCs directly in your digital wallet.
4. **Dropbox**: (Under Development) Store your VCs in Dropbox.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs or feature requests.

## License

This project is licensed under the ISC License.
