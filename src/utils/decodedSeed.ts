import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { base58btc } from 'multiformats/bases/base58';

export async function decodeSeed(encodedSeed: string): Promise<Uint8Array> {
	try {
		// Ensure the seed has the 'z' prefix
		const seedWithPrefix = encodedSeed.startsWith('z') ? encodedSeed : `z${encodedSeed}`;

		// Decode the entire string including the prefix
		const decoded = base58btc.decode(seedWithPrefix);

		// The decoded data includes a multicodec header (2 bytes: 0x00 0x20)
		// We need to remove this header to get the actual 32-byte seed
		if (decoded.length === 34 && decoded[0] === 0x00 && decoded[1] === 0x20) {
			// Skip the first 2 bytes to get the actual seed
			const seed = new Uint8Array(decoded.slice(2));
			console.log('Decoded seed (removed 2-byte header):', Buffer.from(seed).toString('hex'));
			return seed;
		}

		// If it's already 32 bytes, return as is
		if (decoded.length === 32) {
			console.log('Decoded seed (already 32 bytes):', Buffer.from(decoded).toString('hex'));
			return new Uint8Array(decoded);
		}

		throw new Error(`Invalid seed length: ${decoded.length} bytes (expected 32 bytes after removing any headers)`);
	} catch (error) {
		console.error('Error decoding seed:', error);
		throw error;
	}
}

export const getDidFromEnvSeed = async (encodedSeed: string) => {
	// Get seed from environment variable
	if (!encodedSeed) {
		throw new Error('SEED environment variable not set');
	}

	console.log('Using seed from environment:', encodedSeed);

	// Decode the seed (this will remove the 2-byte header if present)
	const seed = await decodeSeed(encodedSeed);
	console.log('Decoded seed length:', seed.length);

	// Create key pair from seed
	const verificationKeyPair = await (Ed25519VerificationKey2020 as any).generate({
		seed: seed,
		type: 'Ed25519VerificationKey2020',
	});

	console.log('Generated public key:', verificationKeyPair.publicKeyMultibase);

	// Create DID manually to avoid key agreement issues
	const fingerprint = verificationKeyPair.fingerprint();
	const did = `did:key:${fingerprint}`;

	// Create a proper DID document
	const didDocument = {
		'@context': [
			'https://www.w3.org/ns/did/v1',
			'https://w3id.org/security/suites/ed25519-2020/v1',
			'https://w3id.org/security/suites/x25519-2020/v1',
		],
		id: did,
		verificationMethod: [
			{
				id: `${did}#${fingerprint}`,
				type: 'Ed25519VerificationKey2020',
				controller: did,
				publicKeyMultibase: verificationKeyPair.publicKeyMultibase,
			},
		],
		authentication: [`${did}#${fingerprint}`],
		assertionMethod: [`${did}#${fingerprint}`],
		capabilityDelegation: [`${did}#${fingerprint}`],
		capabilityInvocation: [`${did}#${fingerprint}`],
	};

	// Set the key ID and controller on the key pair
	verificationKeyPair.id = `${did}#${fingerprint}`;
	verificationKeyPair.controller = did;

	console.log('Generated DID:', did);

	return {
		keyPair: verificationKeyPair,
		didDocument,
	};
};
