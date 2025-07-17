import { StorageClient } from '@wallet.storage/fetch-client';
import { WAS_BASE_URL } from '../../app.config.js';

export class LCWStorage {
	private static storageClient: InstanceType<typeof StorageClient>;
	private signer: any;
	private zcap: any;
	private spaceId: string;

	constructor({ signer, zcap, spaceId }: { signer: any; zcap: any; spaceId: string }) {
		this.signer = signer;
		this.zcap = zcap;
		this.spaceId = spaceId as `urn:uuid:${string}`;
	}

	private getStorageClient(): InstanceType<typeof StorageClient> {
		if (!LCWStorage.storageClient) {
			LCWStorage.storageClient = new StorageClient(new URL(WAS_BASE_URL));
		}
		return LCWStorage.storageClient;
	}

	private getResource(key: string) {
		const space = this.getStorageClient().space({
			signer: this.signer,
			id: this.spaceId as `urn:uuid:${string}`,
		});
		return space.resource(key);
	}

	async add(key: string, value: any) {
		const resource = this.getResource(key);
		const blob = new Blob([JSON.stringify(value)], {
			type: 'application/json',
		});

		const res = await resource.put(blob, {
			signer: this.signer,
		});

		if (!res.ok) {
			throw new Error(`Failed to add resource. Status: ${res.status}`);
		}

		return res;
	}

	async read(key: string) {
		const resource = this.getResource(key);
		const res = await resource.get({ signer: this.signer });

		if (!res.ok) {
			if (res.status === 404) return null;
			throw new Error(`Failed to read resource. Status: ${res.status}`);
		}

		return await res.json();
	}

	async update(key: string, value: any) {
		return this.add(key, value); // Overwrite = update
	}

	async delete(key: string) {
		const resource = this.getResource(key);
		const res = await resource.delete({ signer: this.signer });

		if (!res.ok && res.status !== 404) {
			throw new Error(`Failed to delete resource. Status: ${res.status}`);
		}

		return true;
	}

	async list() {
		// const space = this.getStorageClient().space({
		//   signer: this.signer,
		//   id: this.spaceId as `urn:uuid:${string}`,
		// });
		// const res = await space.resources().list({ signer: this.signer });
		// if (!res.ok) {
		//   throw new Error(`Failed to list resources. Status: ${res.status}`);
		// }
		// return await res.json(); // Should contain list of resource IDs or summaries
	}
}
