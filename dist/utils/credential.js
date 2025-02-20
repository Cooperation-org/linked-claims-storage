import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
/**
 * Utility function to generate a hashed ID for a credential.
 * Excludes the `id` field when hashing.
 * @param {object} credential - The credential object to hash.
 * @returns {string} The generated hashed ID.
 */
function generateHashedId(credential) {
    // Exclude the `id` field from the hash
    const credentialWithoutId = { ...credential, id: undefined };
    const serialized = JSON.stringify(credentialWithoutId);
    return CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex);
}
/**
 * Create a DID document using the provided key pair.
 * @param {KeyPair} keyPair - The key pair used to create the DID document.
 * @returns {Promise<DidDocument>} The created DID document.
 * @throws Will throw an error if the DID document generation fails.
 */
export const generateDIDSchema = async (keyPair) => {
    try {
        const DID = keyPair.controller;
        return {
            '@context': ['https://www.w3.org/ns/did/v1'],
            id: DID,
            publicKey: [
                {
                    id: keyPair.id,
                    type: 'Ed25519VerificationKey2020',
                    controller: DID,
                    publicKeyMultibase: keyPair.publicKeyMultibase,
                },
            ],
            authentication: [keyPair.id],
            assertionMethod: [keyPair.id],
            capabilityDelegation: [keyPair.id],
            capabilityInvocation: [keyPair.id],
            keyAgreement: [
                {
                    id: `${keyPair.id}-keyAgreement`,
                    type: 'X25519KeyAgreementKey2020',
                    controller: DID,
                    publicKeyMultibase: keyPair.publicKeyMultibase,
                },
            ],
        };
    }
    catch (error) {
        console.error('Error creating DID document:', error);
        throw error;
    }
};
/**
 * Generate an unsigned Verifiable Credential (VC).
 * Hashes the credential to create a unique ID.
 * @param {FormDataI} params
 * @param {string} params.FormData - The form dta to include in the VC.
 * @param {string} params.issuerDid - The DID of the issuer.
 * @returns {Credential} The created unsigned VC.
 * @throws Will throw an error if the VC creation fails or if issuance date exceeds expiration date.
 */
export function generateUnsignedVC({ formData, issuerDid }) {
    const issuanceDate = new Date().toISOString();
    if (issuanceDate > formData.expirationDate)
        throw new Error('issuanceDate cannot be after expirationDate');
    const unsignedCredential = {
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
            {
                duration: 'https://schema.org/duration',
                fullName: 'https://schema.org/name',
                portfolio: 'https://schema.org/portfolio',
                evidenceLink: 'https://schema.org/evidenceLink',
                evidenceDescription: 'https://schema.org/evidenceDescription',
                credentialType: 'https://schema.org/credentialType',
            },
        ],
        id: '', // Will be set after hashing
        type: ['VerifiableCredential', 'OpenBadgeCredential'],
        issuer: {
            id: issuerDid,
            type: ['Profile'],
        },
        issuanceDate,
        expirationDate: formData.expirationDate,
        credentialSubject: {
            type: ['AchievementSubject'],
            name: formData.fullName,
            portfolio: formData.portfolio.map((item) => ({
                '@type': 'schema:CreativeWork',
                name: item.name,
                url: item.url,
            })),
            evidenceLink: formData.evidenceLink,
            evidenceDescription: formData.achievementDescription,
            duration: formData.duration,
            credentialType: formData.credentialType,
            achievement: [
                {
                    id: `urn:uuid:${uuidv4()}`,
                    type: ['Achievement'],
                    criteria: {
                        narrative: formData.criteriaNarrative,
                    },
                    description: formData.achievementDescription,
                    name: formData.achievementName,
                    image: formData.evidenceLink
                        ? {
                            id: formData.evidenceLink,
                            type: 'Image',
                        }
                        : undefined,
                },
            ],
        },
    };
    // Generate the hashed ID
    unsignedCredential.id = 'urn:' + generateHashedId(unsignedCredential);
    return unsignedCredential;
}
/**
 * Generate an unsigned Recommendation Credential.
 * Uses the hash of the VC to set the `id` for consistency.
 * @param {object} params
 * @param {VerifiableCredential} params.vc - The Verifiable Credential to base the recommendation on.
 * @param {RecommendationFormDataI} params.recommendation - The recommendation form data.
 * @param {string} params.issuerDid - The DID of the issuer.
 * @returns {RecommendationCredential} The created unsigned Recommendation Credential.
 * @throws Will throw an error if the recommendation creation fails or if issuance date exceeds expiration date.
 */
export function generateUnsignedRecommendation({ vcId, recommendation, issuerDid, }) {
    console.log('🚀 ~ vcId:', vcId);
    const issuanceDate = new Date().toISOString();
    if (issuanceDate > recommendation.expirationDate)
        throw new Error('issuanceDate cannot be after expirationDate');
    const unsignedRecommendation = {
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
            {
                howKnow: 'https://schema.org/howKnow',
                recommendationText: 'https://schema.org/recommendationText',
                qualifications: 'https://schema.org/qualifications',
                explainAnswer: 'https://schema.org/explainAnswer',
                portfolio: 'https://schema.org/portfolio',
            },
        ],
        id: `urn:${generateHashedId({ id: vcId })}`,
        type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
        issuer: {
            id: issuerDid,
            type: ['Profile'],
        },
        issuanceDate,
        expirationDate: recommendation.expirationDate,
        credentialSubject: {
            name: recommendation.fullName,
            howKnow: recommendation.howKnow,
            recommendationText: recommendation.recommendationText,
            qualifications: recommendation.qualifications,
            explainAnswer: recommendation.explainAnswer,
            portfolio: recommendation.portfolio.map((item) => ({
                name: item.name,
                url: item.url,
            })),
        },
    };
    return unsignedRecommendation;
}
/**
 * Extracts the keypair from a Verifiable Credential
 * @param {Object} credential - The signed Verifiable Credential
 * @returns {Ed25519VerificationKey2020} keyPair - The generated keypair object
 */
export async function extractKeyPairFromCredential(credential) {
    const verificationMethod = credential.proof.verificationMethod;
    const issuer = credential.issuer.id;
    // Example of extracting the public key from the DID fragment (verification method)
    const publicKeyMultibase = verificationMethod.split('#')[1];
    // Generate the keypair using Ed25519VerificationKey2020
    const keyPair = await Ed25519VerificationKey2020.from({
        id: verificationMethod,
        controller: issuer,
        publicKeyMultibase: publicKeyMultibase,
    });
    return keyPair;
}
