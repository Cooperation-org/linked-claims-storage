export interface StorageStrategy {
	save(data: any): Promise<void>;
	retrieve(id: string): Promise<any>;
	delete(id: string): Promise<void>;
	authenticate(authCode: string): any;
	oauth2Client: any;
}

export interface GoogleAuthI {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

export interface DataToSaveI {
	fileName: string;
	mimeType: string;
	body: any;
	authCode: string;
}

export type StorageType = 'googleDrive';
