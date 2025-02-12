/**
 * Create and sign a Verifiable Presentation (VP) from a given Verifiable Credential (VC) file and any associated recommendations.
 * @param {string} accessTokens - The access tokens for the user.
 * @param {string} vcFileId - The ID of the Verifiable Credential (VC) file in Google Drive.
 * @returns {Promise<{ signedPresentation: object } | null>} - The signed Verifiable Presentation (VP) or null if an error occurs.
 * @throws Will throw an error if the VC is not found, a matching key pair cannot be located, or any part of the signing process fails.
 */
export declare const createAndSignVerifiablePresentation: (accessTokens: string, vcFileId: string) => Promise<{
    signedPresentation: object;
} | null>;
