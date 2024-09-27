interface PublicKey {
	id: string;
	type: string;
	controller: string;
	publicKeyMultibase: string;
}

interface PortfolioItem {
	name: string;
	url: string;
}

interface Achievement {
	id: string;
	type: string[];
	criteria: {
		narrative: string;
	};
	description: string;
	name: string;
	image?: {
		id: string;
		type: string;
	};
}

export interface KeyPair {
	id: string;
	controller: string;
	fingerprint: () => string;
	revoked: boolean;
	publicKeyMultibase: string;
}

export interface DidDocument {
	'@context': string[];
	id: string;
	publicKey: PublicKey[];
	authentication: string[];
	assertionMethod: string[];
	capabilityDelegation: string[];
	capabilityInvocation: string[];
	keyAgreement: PublicKey[];
}

export interface FormDataI {
	expirationDate: string;
	fullName: string;
	duration: string;
	criteriaNarrative: string;
	achievementDescription: string;
	achievementName: string;
	portfolio: { name: string; url: string }[];
	evidenceLink: string;
	evidenceDescription: string;
	credentialType: string;
}

export interface Credential {
	'@context': any[];
	id: string;
	type: string[];
	issuer: {
		id: string;
		type: string[];
	};
	issuanceDate: string;
	expirationDate: string;
	credentialSubject: {
		evidenceLink: string;
		evidenceDescription: string;
		portfolio: PortfolioItem[];
		credentialType: string;
		type: string[];
		duration: string;
		name: string;
		achievement: Achievement[];
	};
}

export interface RecommendationFormDataI {
	recommendationText: string;
	qualifications: string;
	expirationDate: string;
	fullName: string;
	howKnow: string;
	explainAnswer: string;
	portfolio: { name: string; url: string }[];
}

export interface RecommendationCredential {
	'@context': any[];
	id: string;
	type: string[];
	issuer: {
		id: string;
		type: string[];
	};
	issuanceDate: string;
	expirationDate: string;
	credentialSubject: {
		name: string;
		howKnow: string;
		recommendationText: string;
		qualifications: string;
		explainAnswer: string;
		portfolio: PortfolioItem[];
	};
}

export interface Proof {
	type: string;
	created: string;
	verificationMethod: string;
	proofPurpose: string;
	proofValue: string;
}

// Define the structure of the Verifiable Credential (partial based on what was provided)
export interface VerifiableCredential {
	'@context': string[];
	id: string;
	type: string[];
	issuer: { id: string; type: string[] };
	issuanceDate: string;
	expirationDate: string;
	credentialSubject: { [key: string]: any };
	proof: Proof;
}
