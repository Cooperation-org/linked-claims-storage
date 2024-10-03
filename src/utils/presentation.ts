import { KeyPair } from '../../types';
import { CredentialEngine } from '../models/CredentialEngine.js';
import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';

/**
 * get user's VCs with the comments on it
 * make presentation for the vc and the recommendations from the comments
 */
export const getVP = async (accessTokens: string, fileId: string) => {
	try {
		const storage = new GoogleDriveStorage(accessTokens);
		const engine = new CredentialEngine(accessTokens);

		// Fetch VC
		const vc = await storage.retrieve(fileId);
		console.log('🚀 ~ getVP ~ vc:', vc);
		if (!vc) {
			throw new Error('VC not found');
		}

		const vcComments = await storage.getFileComments(fileId);
		console.log('🚀 ~ getVP ~ vcComments:', vcComments);

		let recommendations = null;

		// Step 3: Check if any comments contain a Google Drive link for recommendations
		if (vcComments.length > 0) {
			for (const comment of vcComments) {
				console.log('🚀 ~ getVP ~ comment:', comment);
				// Process the comments for any recommendations if needed
			}
		}
		console.log('🚀 ~ getVP ~ recommendations:', recommendations);

		// Create presentation
		const presentation = await engine.createPresentation([vc]);
		console.log('🚀 ~ getVP ~ presentation:', presentation);

		// Fetch all keypair files
		const keys = await storage.getAllFilesByType('KEYPAIRs');
		console.log('🚀 ~ getVP ~ KEYPAIRs:', keys);

		// Extract UUID, type, and timestamp from vc.id and match with key pair file name
		const vcIdParts = vc.id.split(':');
		if (vcIdParts.length >= 3) {
			const uuidFromVC = vcIdParts[2]; // Extract UUID part
			const keyPairFile = keys.find((key) => {
				// Match file name pattern like `${uuid ? uuid + '_' : ''}${type}_${timestamp}.json`
				const keyParts = key.name.split('_');
				const uuidPart = keyParts[0];
				const typePart = keyParts[1]; // assuming key type part is after the underscore

				// Check if UUID in key file matches UUID in vc.id
				return uuidPart === uuidFromVC;
			});

			if (!keyPairFile) {
				throw new Error('KeyPair not found matching vc.id');
			}

			console.log('🚀 ~ getVP ~ keyPairFile:', keyPairFile);

			// Continue with processing the key pair and signing the presentation
			const keyPair = keyPairFile.content as KeyPair;
			console.log('🚀 ~ getVP ~ keyPair:', keyPair);

			const signedPresentation = await engine.signPresentation(presentation, keyPair);
			console.log('🚀 ~ getVP ~ signedPresentation:', signedPresentation);

			return { signedPresentation };
		} else {
			console.error('Invalid vc.id format:', vc.id);
		}
	} catch (error) {
		console.error('Error fetching user VCs', error);
		return;
	}
};
