import { saveToGoogleDrive, GoogleDriveStorage, CredentialEngine } from './dist/index.js';

// First access token (for saving recommendation)
const firstAccessToken =
	'ya29.a0AcM612wNIbzq0VJIJeqO1Ck6TTxBdAoIpyNB_QPHugjr5d0sY7nvaMCcJTmoGStj_f_jy_9Nn8seg-iSCoDmcwRxnQuHwOOwubebrpeWUuYGFoo6i_1KptQgKtn42qnJ9nvokSlbJfxuHCNBUs6FcFfdvdagsmyy6AADHABAaCgYKASgSARESFQHGX2Mi0VivnrvKAJa81XgNQW_Jmg0175';
const storage1 = new GoogleDriveStorage(firstAccessToken);

// Recommendation form data
const RecommendtaionformData = {
	expirationDate: '2025-09-18T00:00:00Z',
	fullName: 'John Doe',
	howKnow: 'Worked together at XYZ Company',
	recommendationText: 'John consistently delivered high-quality work on time.',
	portfolio: [
		{
			name: 'Project A',
			url: 'https://example.com/project-a',
		},
		{
			name: 'Project B',
			url: 'https://example.com/project-b',
		},
	],
	qualifications: "Master's in Computer Science",
	explainAnswer: 'John has strong analytical and problem-solving skills, which he demonstrated in complex projects.',
};

async function saveRecommendation() {
	try {
		// Step 1: Create DID
		const credentialEngine = new CredentialEngine();
		const { didDocument, keyPair } = await credentialEngine.createDID();
		const issuerDid = didDocument.id;

		// Step 2: Create Unsigned Recommendation VC
		const unsignedRecommendationVC = credentialEngine.createUnsignedRecommendation(RecommendtaionformData, issuerDid);

		// Step 3: Sign Recommendation VC
		const signedRecommendationVC = await credentialEngine.signVC(unsignedRecommendationVC, keyPair);

		// Step 4: Save Recommendation to Google Drive
		const savedFile = await saveToGoogleDrive(storage1, signedRecommendationVC, 'RECOMMENDATION');
		console.log('Saved recommendation file ID:', savedFile.id);

		// Return the fileId to use it in the next step
		return '1FfXzjyG5tf4QTx9y91TO1wyGU30DH4Vt';
	} catch (error) {
		console.error('Error saving recommendation:', error);
	}
}

// Run the function to save the recommendation
saveRecommendation().then((fileId) => {
	// Once the file is saved and we have the fileId, we move to step 2
	if (fileId) {
		addCommentToSavedRecommendation(fileId);
	}
});

// Second access token (for adding the comment)

async function addCommentToSavedRecommendation(fileId) {
	try {
		// The comment text that you want to add
		const commentText = 'This is a comment on the saved recommendation file.';

		// Step 2: Use the second access token to add the comment
		const result = await storage1.saveRecommendation(fileId, commentText);
		console.log('Comment added successfully:', result);
	} catch (error) {
		console.error('Error adding comment to recommendation file:', error);
	}
}
