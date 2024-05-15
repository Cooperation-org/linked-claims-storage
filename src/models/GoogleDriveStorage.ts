import { google } from 'googleapis';

import { DataToSaveI, GoogleAuthI, StorageStrategy } from './interfaces';
import { PassThrough } from 'stream';

export class GoogleDriveStorage implements StorageStrategy {
	public oauth2Client;

	constructor(authCred: GoogleAuthI) {
		this.oauth2Client = new google.auth.OAuth2(authCred.clientId, authCred.clientSecret, authCred.redirectUri);
	}

	async authenticate(authCode: string) {
		const { tokens } = await this.oauth2Client.getToken(authCode);
		this.oauth2Client.setCredentials(tokens);
		console.log('Authenticated successfully');
	}

	async save(data: DataToSaveI) {
		try {
			if (!data.fileName.endsWith('.json') || data.mimeType !== 'application/json') {
				throw new Error('Only .json files are allowed');
			}

			const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

			const fileMetadata = {
				name: data.fileName,
				mimeType: data.mimeType,
			};

			// Check if buffer is not empty
			if (data.body.length === 0) {
				throw new Error('File buffer is empty.');
			}

			// Convert buffer to stream
			const bufferStream = new PassThrough();
			bufferStream.end(data.body);

			const media = {
				mimeType: data.mimeType,
				body: bufferStream,
			};

			const file = await drive.files.create({
				requestBody: fileMetadata,
				media: media,
				fields: 'id',
			});

			console.log('File uploaded:', file.data.id); // Logging file ID
		} catch (error: any) {
			console.error('Error uploading file:', error);
			throw new Error(`Failed to upload file: ${error.message}`);
		}
	}

	// TODO implement retrieve and delete methods
	async retrieve(id: string): Promise<any> {
		return;
	}

	async delete(id: string) {
		return;
	}
}
