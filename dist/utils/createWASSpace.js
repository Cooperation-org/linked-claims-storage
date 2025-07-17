import { StorageClient } from '@wallet.storage/fetch-client';
import { Ed25519Signer } from '@did.coop/did-key-ed25519';
import { v4 as uuidv4 } from 'uuid';
import { WAS_BASE_URL } from '../../app.config.js';
/**
 * Create a new WAS space
 * @returns {Promise<{ signer: InstanceType<typeof Ed25519Signer>; spaceId: `urn:uuid:${string}` }>}
 */
export async function createSpace() {
    const signer = await Ed25519Signer.generate();
    const controller = signer.id.split('#')[0];
    const spaceUUID = uuidv4();
    const spaceId = `urn:uuid:${spaceUUID}`;
    const client = new StorageClient(new URL(WAS_BASE_URL));
    const space = client.space({ signer, id: spaceId });
    const spaceObject = {
        id: spaceId,
        controller,
    };
    const blob = new Blob([JSON.stringify(spaceObject)], { type: 'application/json' });
    const res = await space.put(blob, { signer });
    if (!res.ok) {
        throw new Error(`Failed to initialize WAS space. Status: ${res.status}`);
    }
    console.log('✅ Provisioned and saved new WAS space');
    return { signer, spaceId };
}
