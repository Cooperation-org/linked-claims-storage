import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';

const LOCAL_STORAGE_KEY = 'AppInstanceDID';

export interface AppInstanceKeyPair {
	controller: string;
	id: string;
	publicKeyMultibase: string;
	privateKeyMultibase: string;
}

export async function getOrCreateAppInstanceDid(): Promise<{
	did: string;
	keyPair: Ed25519VerificationKey2020;
}> {
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

	if (stored) {
		const parsed = JSON.parse(stored);
		const keyPair = await Ed25519VerificationKey2020.from(parsed);
		return { did: keyPair.controller, keyPair };
	}

	const keyPair = await Ed25519VerificationKey2020.generate();
	keyPair.controller = `did:key:${keyPair.publicKeyMultibase}`;
	keyPair.id = `${keyPair.controller}#${keyPair.publicKeyMultibase}`;
	keyPair.revoked = false;

	const did = keyPair.controller;

	localStorage.setItem(
		LOCAL_STORAGE_KEY,
		JSON.stringify({
			controller: keyPair.controller,
			id: keyPair.id,
			publicKeyMultibase: keyPair.publicKeyMultibase,
			privateKeyMultibase: keyPair.privateKeyMultibase,
		})
	);

	return { did, keyPair };
}
