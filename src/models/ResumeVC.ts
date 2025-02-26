import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { customDocumentLoader } from '../utils/digitalbazaar.js';
import { v4 as uuidv4 } from 'uuid';
import * as dbVc from '@digitalbazaar/vc';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { generateDIDSchema } from '../utils/credential.js';
import { inlineResumeContext } from '../utils/context.js';

export class ResumeVC {
	public async sign({ formData, issuerDid, keyPair }: { formData: any; issuerDid: string; keyPair: any }): Promise<any> {
		const unsignedCredential = this.generateUnsignedCredential({ formData, issuerDid });

		const suite = new Ed25519Signature2020({
			key: new Ed25519VerificationKey2020(keyPair), // Ensure proper initialization
			verificationMethod: keyPair.id,
		});

		try {
			const signedVC = await dbVc.issue({
				credential: unsignedCredential,
				suite,
				documentLoader: customDocumentLoader,
			});
			console.log('Signed VC:', signedVC);
		} catch (error) {
			console.error('Error signing VC:', error.message);
			if (error.details) {
				console.error('Error details:', JSON.stringify(error.details, null, 2));
			}
			throw error;
		}

		return unsignedCredential;
	}

	public generateUnsignedCredential({ formData, issuerDid }: { formData: any; issuerDid: string }): any {
		const unsignedResumeVC = {
			'@context': [
				'https://www.w3.org/2018/credentials/v1',
				inlineResumeContext['@context'], // Inline context
			],
			id: `urn:uuid:${uuidv4()}`, // Generate a unique UUID
			type: ['VerifiableCredential', 'LERRSCredential'], // LER-RS compliant credential type
			issuer: issuerDid,
			issuanceDate: new Date().toISOString(), // Current date/time in ISO format
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

				narrative: {
					text: formData.summary || '',
				},

				// Employment History
				employmentHistory: formData.experience.items.map((exp: any) => ({
					organization: {
						tradeName: exp.company || '',
					},
					title: exp.title || '',
					description: exp.description || '',
					startDate: exp.startDate || '',
					endDate: exp.endDate || '',
					stillEmployed: exp.stillEmployed || false,
				})),

				// Duplicated Experience (Raw)
				experience: formData.experience.items.map((exp: any) => ({
					company: exp.company || '',
					title: exp.title || '',
					description: exp.description || '',
					startDate: exp.startDate || '',
					endDate: exp.endDate || '',
					stillEmployed: exp.stillEmployed || false,
				})),

				// Skills
				skills: formData.skills.items.map((skill: any) => ({
					name: skill.name || '',
				})),

				// Education
				educationAndLearning: formData.education.items.map((edu: any) => ({
					institution: edu.institution || '',
					degree: edu.degree || '',
					fieldOfStudy: edu.fieldOfStudy || '',
					startDate: edu.startDate || '',
					endDate: edu.endDate || '',
				})),

				// Awards
				awards: formData.awards.items.map((award: any) => ({
					title: award.title || '',
					issuer: award.issuer || '',
					date: award.date || '',
					description: award.description || '',
				})),

				// Publications
				publications: formData.publications.items.map((pub: any) => ({
					title: pub.title || '',
					publisher: pub.publisher || '',
					date: pub.date || '',
					url: pub.url || '',
				})),

				// Certifications
				certifications: formData.certifications.items.map((cert: any) => ({
					name: cert.name || '',
					issuer: cert.issuer || '',
					date: cert.date || '',
					url: cert.url || '',
				})),

				// Professional Affiliations
				professionalAffiliations: formData.professionalAffiliations.items.map((aff: any) => ({
					organization: aff.organization || '',
					role: aff.role || '',
					startDate: aff.startDate || '',
					endDate: aff.endDate || '',
				})),

				// Volunteer Work
				volunteerWork: formData.volunteerWork.items.map((vol: any) => ({
					organization: vol.organization || '',
					role: vol.role || '',
					description: vol.description || '',
					startDate: vol.startDate || '',
					endDate: vol.endDate || '',
				})),

				// Hobbies and Interests
				hobbiesAndInterests: formData.hobbiesAndInterests || [],

				// Languages
				languages: formData.languages.items.map((lang: any) => ({
					language: lang.language || '',
					proficiency: lang.proficiency || '',
				})),

				// Testimonials
				testimonials: formData.testimonials.items.map((testi: any) => ({
					author: testi.author || '',
					text: testi.text || '',
					date: testi.date || '',
				})),

				// Projects
				projects: formData.projects.items.map((proj: any) => ({
					name: proj.name || '',
					description: proj.description || '',
					url: proj.url || '',
					startDate: proj.startDate || '',
					endDate: proj.endDate || '',
				})),
			},
		};

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
