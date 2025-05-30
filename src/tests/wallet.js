import { saveToGoogleDrive, CredentialEngine, StorageContext, StorageFactory } from '../../dist/index.js';
import { ethers } from 'ethers';

const accessToken = 'your-google-drive-access-token';
const credentialEngine = new CredentialEngine(accessToken);
const storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));

class Wallet {
	constructor() {
		if (!window.ethereum) {
			throw new Error('MetaMask is not installed');
		}
		this.provider = new ethers.providers.Web3Provider(window.ethereum);
		this.signer = this.provider.getSigner();
	}

	// Method to retrieve the Ethereum address (can be used as a DID)
	async getAddress() {
		const address = await this.signer.getAddress();
		return `did:ethr:${address}`;
	}

	// Simulating the getKeyPair method to return the address and signing capability
	async getKeyPair() {
		const address = await this.getAddress();

		// Normally, a keyPair object would include public and private keys.
		// For Ethereum-based signing, we're only retrieving the address
		// and providing a sign method using MetaMask.

		return {
			id: address,
			address,
			sign: async (data) => {
				const signature = await this.signer.signMessage(data);
				return signature;
			},
		};
	}
}

async function main() {
	const formData = {
		fullName: 'Alice Smith',
		criteriaNarrative: 'Team members are nominated for this badge by their peers and recognized upon review by Example Corp management.',
		achievementDescription: 'This badge recognizes the development of the capacity to collaborate within a group environment.',
		achievementName: 'Teamwork Achievement',
		expirationDate: '2025-01-01T00:00:00Z', // Use a valid ISO 8601 date string
	};

	const wallet = new Wallet();
	const keyPair = await wallet.getKeyPair();

	// Step 1: Create DID using the wallet's key pair
	const didDocument = await credentialEngine.generateDIDSchema(keyPair);
	await saveToGoogleDrive(
		storage,
		{
			...didDocument,
			keyPair: { ...keyPair },
		},
		'DID'
	);

	const issuerDid = didDocument.id;

	// Step 2: Create Unsigned VC
	const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	await saveToGoogleDrive(storage, unsignedVC, 'UnsignedVC');
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC using the wallet's key pair
	try {
		const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
		await saveToGoogleDrive(storage, signedVC, 'VC');
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}

	// Retrieve and log all claims
	const claims = await storage.getAllClaims();
	console.log('🚀 ~ claims:', claims);

	// Retrieve specific claim content
	const claim = await storage.getFileContent('16Nl0dmo2E20Ika1ft_bfzY0tBE6gwrk2');
	console.log('claim', claim);
}

main().catch(console.error);
