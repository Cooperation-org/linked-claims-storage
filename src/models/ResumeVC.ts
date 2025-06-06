import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { customDocumentLoader } from '../utils/digitalbazaar.js';
import { v4 as uuidv4 } from 'uuid';
import * as dbVc from '@digitalbazaar/vc';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { generateDIDSchema } from '../utils/credential.js';
import { inlineResumeContext } from '../utils/context.js';

export class ResumeVC {
	public async sign({ formData, issuerDid, keyPair }: { formData: any; issuerDid: string; keyPair: any }): Promise<any> {
		// First, generate the unsigned credential with the professional summary
		const unsignedCredential = this.generateUnsignedCredential({ formData, issuerDid });

		// Create the signature suite for signing
		const suite = new Ed25519Signature2020({
			key: new Ed25519VerificationKey2020(keyPair),
			verificationMethod: keyPair.id,
		});

		try {
			// 1: Sign the professional summary VC first
			const professionalSummaryVC = unsignedCredential.credentialSubject.professionalSummary;
			const signedProfessionalSummaryVC = await dbVc.issue({
				credential: professionalSummaryVC,
				suite,
				documentLoader: customDocumentLoader,
			});

			// Replace the unsigned professional summary with the signed one
			unsignedCredential.credentialSubject.professionalSummary = signedProfessionalSummaryVC;

			// 2: Now sign the entire resume VC (which includes the signed professional summary)
			const signedResumeVC = await dbVc.issue({
				credential: unsignedCredential,
				suite,
				documentLoader: customDocumentLoader,
			});

			console.log('Signed Resume VC:', signedResumeVC);
			return signedResumeVC;
		} catch (error) {
			console.error('Error signing VC:', error.message);
			if (error.details) {
				console.error('Error details:', JSON.stringify(error.details, null, 2));
			}
			throw error;
		}
	}

	public generateProfessionalSummary = (aff: any) => {
		let cleanNarrative = aff.narrative || '';
		if (cleanNarrative.startsWith('<p>') && cleanNarrative.endsWith('</p>')) {
			// Remove the opening and closing p tags
			cleanNarrative = cleanNarrative.substring(3, cleanNarrative.length - 4);
		}

		// removing all <p> tags
		cleanNarrative = cleanNarrative.replace(/<\/?p>/g, '');

		// Replace <b> or <strong> tags with markdown bold syntax (**word**)
		cleanNarrative = cleanNarrative.replace(/<b>(.*?)<\/b>/g, '**$1**');
		cleanNarrative = cleanNarrative.replace(/<strong>(.*?)<\/strong>/g, '**$1**');

		return {
			'@context': [
				'https://www.w3.org/2018/credentials/v1',
				{
					'@vocab': 'https://schema.hropenstandards.org/4.4/',
					narrative: 'https://schema.org/narrative',
				},
			],
			type: ['VerifiableCredential', 'NarrativeCredential'],
			issuer: aff.issuer, // same DID as the issuer of the resume
			issuanceDate: new Date().toISOString(),
			credentialSubject: {
				narrative: cleanNarrative,
			},
		};
	};

	public generateUnsignedCredential({ formData, issuerDid }: { formData: any; issuerDid: string }): any {
		const unsignedResumeVC = {
			'@context': ['https://www.w3.org/2018/credentials/v1', inlineResumeContext['@context']],
			id: `urn:uuid:${uuidv4()}`,
			type: ['VerifiableCredential', 'LERRSCredential'],
			issuer: issuerDid,
			issuanceDate: new Date().toISOString(),
			credentialSubject: {
				type: 'Resume',
				person: {
					name: {
						formattedName: formData.name || '',
					},
					primaryLanguage: 'en',
					contact: {
						fullName: formData.contact.fullName || '',
						email: formData.contact.email || '',
						phone: formData.contact.phone || '',
						location: {
							street: formData.contact.location.street || '',
							city: formData.contact.location.city || '',
							state: formData.contact.location.state || '',
							country: formData.contact.location.country || '',
							postalCode: formData.contact.location.postalCode || '',
						},
						socialLinks: {
							linkedin: formData.contact.socialLinks.linkedin || '',
							github: formData.contact.socialLinks.github || '',
							portfolio: formData.contact.socialLinks.portfolio || '',
							twitter: formData.contact.socialLinks.twitter || '',
						},
					},
				},

				professionalSummary: this.generateProfessionalSummary({
					issuer: issuerDid,
					narrative: formData.summary || '',
				}),

				employmentHistory: formData.experience.items.map((exp: any) => ({
					id: exp.id ? `urn:uuid${exp.id}` : `urn:uuid:${uuidv4()}`, // Ensure each entry has an ID
					organization: {
						tradeName: exp.company || '',
					},
					title: exp.title || '',
					description: exp.description || '',
					duration: exp.duration || '',
					startDate: exp.startDate || '',
					endDate: exp.endDate || '',
					stillEmployed: exp.stillEmployed || false,
					verificationStatus: exp.verificationStatus || 'unverified',
					credentialLink: exp.credentialLink || null,
					verifiedCredentials: exp.verifiedCredentials || [],
				})),

				educationAndLearning: formData.education.items.map((edu: any) => ({
					id: edu.id ? `urn:uuid${edu.id}` : `urn:uuid:${uuidv4()}`,
					institution: edu.institution || '',
					degree: edu.degree || '',
					fieldOfStudy: edu.fieldOfStudy || '',
					duration: edu.duration || '',
					startDate: edu.startDate || '',
					endDate: edu.endDate || '',
					verificationStatus: edu.verificationStatus || 'unverified',
					credentialLink: edu.credentialLink || null,
					verifiedCredentials: edu.verifiedCredentials || [],
				})),

				skills: formData.skills.items.map((skill: any) => ({
					id: skill.id ? `urn:uuid${skill.id}` : `urn:uuid:${uuidv4()}`,
					name: skill.name || '',
					verificationStatus: skill.verificationStatus || 'unverified',
					credentialLink: skill.credentialLink || null,
					verifiedCredentials: skill.verifiedCredentials || [],
				})),

				certifications: formData.certifications.items.map((cert: any) => ({
					id: cert.id ? `urn:uuid:${cert.id}` : `urn:uuid:${uuidv4()}`,
					name: cert.name || '',
					issuer: cert.issuer || '',
					date: cert.date || '',
					url: cert.url || '',
					verificationStatus: cert.verificationStatus || 'unverified',
					credentialLink: cert.credentialLink || null,
					verifiedCredentials: cert.verifiedCredentials || [],
				})),

				projects: formData.projects.items.map((proj: any) => ({
					id: proj.id ? `urn:uuid${proj.id}` : `urn:uuid:${uuidv4()}`,
					name: proj.name || '',
					description: proj.description || '',
					url: proj.url || '',
					duration: proj.duration || '',
					startDate: proj.startDate || '',
					endDate: proj.endDate || '',
					verificationStatus: proj.verificationStatus || 'unverified',
					credentialLink: proj.credentialLink || null,
					verifiedCredentials: proj.verifiedCredentials || [],
				})),

				professionalAffiliations: formData.professionalAffiliations.items.map((aff: any) => ({
					id: aff.id ? `urn:uuid:${aff.id}` : `urn:uuid:${uuidv4()}`,
					name: aff.name || '',
					organization: aff.organization || '',
					startDate: aff.startDate || '',
					endDate: aff.endDate || '',
					activeAffiliation: aff.activeAffiliation || false,
					duration: aff.duration || '',
					verificationStatus: aff.verificationStatus || 'unverified',
					credentialLink: aff.credentialLink || '',
					selectedCredentials: aff.selectedCredentials || [],
				})),

				volunteerWork: formData.volunteerWork.items.map((vol: any) => ({
					id: vol.id ? `urn:uuid:${vol.id}` : `urn:uuid:${uuidv4()}`,
					role: vol.role || '',
					organization: vol.organization || '',
					location: vol.location || '',
					startDate: vol.startDate || '',
					endDate: vol.endDate || '',
					currentlyVolunteering: vol.currentlyVolunteering || false,
					description: vol.description || '',
					duration: vol.duration || '',
					verificationStatus: vol.verificationStatus || 'unverified',
					credentialLink: vol.credentialLink || '',
					selectedCredentials: vol.selectedCredentials || [],
				})),

				hobbiesAndInterests: formData.hobbiesAndInterests || [],

				languages: formData.languages.items.map((lang: any) => ({
					id: lang.id ? `urn:uuid:${lang.id}` : `urn:uuid:${uuidv4()}`,
					name: lang.name || '',
					proficiency: lang.proficiency || '',
				})),
			},
		};
		console.log('🚀 ~ ResumeVC ~ generateUnsignedCredential ~ unsignedResumeVC:', JSON.stringify(unsignedResumeVC));

		return unsignedResumeVC;
	}

	public generateKeyPair = async (address?: string) => {
		// Generate the key pair using the library's method
		const keyPair = await Ed25519VerificationKey2020.generate();

		// Configure key pair attributes
		const a = address || keyPair.publicKeyMultibase;
		keyPair.controller = `did:key:${a}`;
		keyPair.id = `${keyPair.controller}#${a}`;
		keyPair.revoked = false;

		// The `signer` is already provided by the `Ed25519VerificationKey2020` instance
		return keyPair;
	};

	/**
	 * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID({ keyPair }) {
		try {
			const didDocument = await generateDIDSchema(keyPair);

			return didDocument;
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}
}
