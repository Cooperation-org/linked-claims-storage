import { GoogleDriveStorage, Resume } from './dist/index.js';

// Replace with a valid Google Drive API access token
const accessToken =
	'ya29.a0ARW5m74P4K_YjvEuc3HHi_D0VIF__moJ_GyjLGluwxDon0WkFUXi0I48jJ4CtTYh7oaUyLUSA9YveVXD599rsDfpjGf0ilKV0SwpYXzadrumcEGc8Ya1QWyj2YDDrMlYRLWyS1Kka6ZTkm_2pOr7bwhVzgQ2PIZ6BBcwJKDtaCgYKAXQSARMSFQHGX2MixFuP82mcP6U-WNGO5PS_sg0175';

const main = async () => {
	const storage = new GoogleDriveStorage(accessToken);
	const resumeManager = new Resume(storage);

	console.log('--- Testing saveResume ---');
	const fakeResume = {
		name: 'John Doe',
		email: 'johndoe@example.com',
		fileName: 'JohnDoeResume.json',
		mimeType: 'application/json',
		body: JSON.stringify({
			name: 'John Doe',
			email: 'johndoe@example.com',
			experience: [
				{ company: 'Company A', role: 'Developer', years: 2 },
				{ company: 'Company B', role: 'Engineer', years: 3 },
			],
		}),
	};

	try {
		// Save the resume
		const savedResume = await resumeManager.saveResume({ resume: fakeResume });
		console.log('Resume saved successfully:', savedResume);
		const savedSResume = await resumeManager.saveResume({ resume: fakeResume, type: 'sign' });
		console.log('Resume saved successfully:', savedSResume);
	} catch (error) {
		console.error('Error saving resume:', error.message);
	}

	console.log('\n--- Testing getSignedResumes ---');
	try {
		const signedResumes = await resumeManager.getSignedResumes();
		console.log('Signed resumes:', signedResumes);
	} catch (error) {
		console.error('Error fetching signed resumes:', error.message);
	}

	console.log('\n--- Testing getNonSignedResumes ---');
	try {
		const nonSignedResumes = await resumeManager.getNonSignedResumes();
		console.log('Non-signed resumes:', nonSignedResumes);
	} catch (error) {
		console.error('Error fetching non-signed resumes:', error.message);
	}

	console.log('\n--- Testing find (specific resume) ---');
	try {
		// Fetch a specific resume by ID (use an ID from the allResumes result)
		const specificResume = await resumeManager.find({});
		console.log('Specific resume:', specificResume);
	} catch (error) {
		console.error('Error finding specific resume:', error.message);
	}
};

// Run the script
main().catch(console.error);
