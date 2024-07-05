export interface StorageStrategy {
	save(data: any, folderId: string): Promise<string | null>;
	createFolder(folderName: string): Promise<string>;
	retrieve(id: string): Promise<any>;
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
}

export type StorageType = 'googleDrive';
