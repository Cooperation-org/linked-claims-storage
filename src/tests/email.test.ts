import { CredentialEngine } from '../models/CredentialEngine.js';
import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';

async function testEmailVC() {
	try {
		// Get Google Drive access token from environment
		const accessToken = 'your access token';

		// Initialize storage and engine
		const storage = new GoogleDriveStorage(accessToken);
		const engine = new CredentialEngine(storage);

		// Test email
		const testEmail = 'test@example.com';

		console.log('Starting email VC generation test...');
		console.log('Test email:', testEmail);

		// Generate and sign the email VC
		const result = await engine.generateAndSignEmailVC(testEmail);

		console.log('\nTest Results:');
		console.log('-------------');
		console.log('File ID:', result.fileId);
		console.log('Signed VC:', JSON.stringify(result.signedVC, null, 2));

		// Test retrieving the VC from storage
		console.log('\nRetrieving VC from storage...');
		const retrievedVC = await storage.retrieve(result.fileId);
		console.log('Retrieved VC:', retrievedVC ? 'Success' : 'Failed');

		console.log('\nTest completed successfully!');
	} catch (error) {
		console.error('Test failed:', error);
	}
}

// Run the test
testEmailVC().catch(console.error);
