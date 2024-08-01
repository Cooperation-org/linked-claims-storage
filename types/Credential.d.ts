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
	publicKey: {
		id: string;
		type: string;
		controller: string;
		publicKeyMultibase: string;
	}[];
	authentication: string[];
	assertionMethod: string[];
	capabilityDelegation: string[];
	capabilityInvocation: string[];
	keyAgreement: {
		id: string;
		type: string;
		controller: string;
		publicKeyMultibase: string;
	}[];
}

export interface FormData {
	issuanceDate: string;
	expirationDate: string;
	credentialName: string;
	fullName: string;
	postalCode: string;
	criteriaNarrative: string;
	achievementDescription: string;
	achievementName: string;
	imageLink?: string;
}

export interface Credential {
	'@context': string[];
	id: string; // Add the id property
	type: string[];
	issuer: {
		id: string;
		type: string[];
	};
	issuanceDate: string;
	expirationDate: string;
	credentialSubject: {
		type: string[];
		name: string;
		achievement: {
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
		}[];
	};
}
