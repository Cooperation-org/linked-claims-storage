import { Ed25519Signer } from '@did.coop/did-key-ed25519';
/**
 * Create a new WAS space
 * @returns {Promise<{ signer: InstanceType<typeof Ed25519Signer>; spaceId: `urn:uuid:${string}` }>}
 */
export declare function createSpace(): Promise<{
    signer: InstanceType<typeof Ed25519Signer>;
    spaceId: `urn:uuid:${string}`;
}>;
