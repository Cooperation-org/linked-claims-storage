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
        // First check if email VC exists
        console.log('\nChecking if email VC exists...');
        const existingVC = await storage.checkEmailExists(testEmail);
        console.log('🚀 ~ testEmailVC ~ existingVC:', existingVC);
        console.log('Existing VC check:', existingVC ? 'Found' : 'Not found');
        const encodedSeed = 'z1AdiEjvNdC18HdruehySWKe4HnsXdUqCXMYPEs1fQ8cY2S'; // Replace with your actual encoded seed
        // Generate and sign the email VC
        const result = await engine.generateAndSignEmailVC(testEmail, encodedSeed);
        console.log('\nTest Results:');
        console.log('-------------');
        console.log('File ID:', result.fileId);
        console.log('Signed VC:', JSON.stringify(result.signedVC, null, 2));
        // Test retrieving the VC from storage
        console.log('\nRetrieving VC from storage...');
        const retrievedVC = await storage.retrieve(result.fileId);
        console.log('Retrieved VC:', retrievedVC ? 'Success' : 'Failed');
        // Test checkEmailExists again after creation
        console.log('\nChecking if email VC exists after creation...');
        const newExistingVC = await storage.checkEmailExists(testEmail);
        console.log('Existing VC check after creation:', newExistingVC ? 'Found' : 'Not found');
        if (newExistingVC) {
            console.log('VC Content:', JSON.stringify(newExistingVC.data, null, 2));
            console.log('VC ID:', newExistingVC.id);
        }
        // Test with non-existent email
        console.log('\nTesting with non-existent email...');
        const nonExistentEmail = 'nonexistent@example.com';
        const nonExistentVC = await storage.checkEmailExists(nonExistentEmail);
        console.log('Non-existent email check:', nonExistentVC ? 'Found (unexpected)' : 'Not found (expected)');
        console.log('\nTest completed successfully!');
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
// Run the test
testEmailVC().catch(console.error);
