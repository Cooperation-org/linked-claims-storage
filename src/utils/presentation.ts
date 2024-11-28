import { CredentialEngine } from '../models/CredentialEngine.js';
import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';
import { extractGoogleDriveFileId } from './google.js';

/**
 * Create and sign a Verifiable Presentation (VP) from a given Verifiable Credential (VC) file and any associated recommendations.
 * @param {string} accessTokens - The access tokens for the user.
 * @param {string} vcFileId - The ID of the Verifiable Credential (VC) file in Google Drive.
 * @returns {Promise<{ signedPresentation: object } | null>} - The signed Verifiable Presentation (VP) or null if an error occurs.
 * @throws Will throw an error if the VC is not found, a matching key pair cannot be located, or any part of the signing process fails.
 */
export const createAndSignVerifiablePresentation = async (
	accessTokens: string,
	vcFileId: string
): Promise<{ signedPresentation: object } | null> => {
	if (!accessTokens || !vcFileId) {
		console.error('Invalid input: Access tokens and VC file ID are required.');
		return null;
	}

	try {
		// const storage = new GoogleDriveStorage(accessTokens);
		// const engine = new CredentialEngine(accessTokens);
		// // Fetch Verifiable Credential (VC)
		// const verifiableCredential = await storage.retrieve(vcFileId);
		// if (!verifiableCredential) {
		// 	throw new Error('Verifiable Credential not found.');
		// }
		// // Fetch VC comments (potential recommendations)
		// const verifiableCredentialComments = await storage.getFileComments(vcFileId);
		// let recommendations: object[] = [];
		// // Extract recommendations from comments if present
		// if (verifiableCredentialComments.length > 0) {
		// 	for (const comment of verifiableCredentialComments) {
		// 		console.log('🚀 ~ createAndSignVerifiablePresentation ~ comment', comment);
		// 		const recommendationFile = await storage.retrieve(extractGoogleDriveFileId(comment.content));
		// 		console.log('🚀 ~ createAndSignVerifiablePresentation ~ recommendationFile', recommendationFile);
		// 		if (recommendationFile) {
		// 			recommendations.push(recommendationFile);
		// 		}
		// 	}
		// }
		// // Create Verifiable Presentation (VP) with the retrieved VC
		// const presentation = await engine.createPresentation([verifiableCredential.data, ...recommendations]); //! do not edit the array order!!
		// // Use the key pair to sign the presentation
		// const signedPresentation = await engine.signPresentation(presentation);
		// return {};
	} catch (error) {
		console.error('Error during Verifiable Presentation creation and signing:', error);
		return null;
	}
};
