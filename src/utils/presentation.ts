import { KeyPair } from '../../types';
import { CredentialEngine } from '../models/CredentialEngine.js';
import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';
import { extractKeyPairFromCredential } from './credential.js';
import { extractFileIdFromDriveLink } from './google.js';

/**
 * get user's VCs with the comments on it
 * make presentation for th vc and the recommendations from the comments
 */
export const getVP = async (accessTokens: string, fileId: string) => {
	try {
		const storage = new GoogleDriveStorage(accessTokens);
		const engine = new CredentialEngine();

		// fetch VC
		const VC = await storage.retrieve(fileId);
		console.log('🚀 ~ getVP ~ VC:', VC);
		if (!VC) {
			throw new Error('VC not found');
		}
		const vcComments = await storage.getFileComments(fileId);
		console.log('🚀 ~ getVP ~ vcComments:', vcComments);

		let recommendations = null;

		// Step 3: Check if any comments contain a Google Drive link for recommendations
		if (vcComments.length > 0) {
			for (const comment of vcComments) {
				const recommendationFileId = extractFileIdFromDriveLink(comment.content);
				// Fetch the file containing the recommendations
				recommendations = await storage.retrieve(recommendationFileId);
			}
		}
		console.log('🚀 ~ getVP ~ recommendations:', recommendations);

		// Step 4: Sign the VC and recommendations
		const presentation = await engine.createPresentation([vcComments, recommendations]);
		console.log('🚀 ~ getVP ~ presentation:', presentation);
		// reuseoriginal vc KeyPair
		const keyPair = await extractKeyPairFromCredential(VC);
		const signedPresentation = await engine.signPresentation(presentation, keyPair);
		console.log('🚀 ~ getVP ~ signedPresentation:', signedPresentation);

		return { signedPresentation, presentation };
	} catch (error) {
		console.error('Error fetching user VCs', error);
		return;
	}
};
