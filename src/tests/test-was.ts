import { Ed25519Signer } from '@did.coop/did-key-ed25519';
import { v4 as uuidv4 } from 'uuid';
import { LCWStorage } from '../models/WASStorage.js';
import { StorageClient } from '@wallet.storage/fetch-client';
import { WAS_BASE_URL } from '../../app.config.js';

async function main() {
	const appDidSigner = await Ed25519Signer.generate();
	console.log('Signer:', appDidSigner);

	const spaceUUID = uuidv4();
	const spaceId = `urn:uuid:${spaceUUID}`;
	console.log('Space ID:', spaceId);

	const storage = new StorageClient(new URL(WAS_BASE_URL));
	const space = storage.space({
		signer: appDidSigner,
		id: spaceId as `urn:uuid:${string}`,
	});

	const spaceObject = {
		id: spaceId,
		controller: appDidSigner.id.split('#')[0],
	};

	console.log('Creating space with object:', spaceObject);

	const spaceObjectBlob = new Blob([JSON.stringify(spaceObject)], { type: 'application/json' });

	// Create the space
	const response = await space.put(spaceObjectBlob, {
		signer: appDidSigner,
	});
	console.log('🚀 ~ main ~ response:', response);

	console.log('Space PUT response:', {
		status: response.status,
		ok: response.ok,
	});

	if (!response.ok) {
		throw new Error(`Failed to initialize space. Status: ${response.status}`);
	}

	// Store the signer for future connections
	const signerJson = await appDidSigner.toJSON();
	console.log('Signer JSON:', signerJson);

	const lcwStorage = new LCWStorage({ signer: appDidSigner, zcap: {}, spaceId });

	const res = await lcwStorage.add('test', { test: 'test' });
	if (res.ok) {
		console.log('Record added successfully');
	} else {
		console.error('Failed to add record');
	}

	const res2 = await lcwStorage.read('test');
	if (res2) {
		console.log('Record read successfully');
	} else {
		console.error('Failed to read record');
	}

	const res3 = await lcwStorage.update('test', { test: 'test2' });
	if (res3.ok) {
		console.log('Record updated successfully');
	} else {
		console.error('Failed to update record');
	}
}

main();
