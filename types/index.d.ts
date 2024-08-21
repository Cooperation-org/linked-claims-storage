export interface StorageStrategy {
	save(data: any, folderId: string): Promise<{ id: string } | null>;
	createFolder(folderName: string, parentFolderId?: string | null): Promise<string>;
	retrieve(id: string): Promise<any>;
	findFolders(id?: string): Promise<any[]>;
	findLastFile(folderId: string): Promise<any[]>;
	getAllClaims(): Promise<any[]>;
	getFileContent(fileId: string): Promise<any>;
	getAllSessions(): Promise<any[]>;
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

export type StorageType = 'googleDrive' | 'digitalWallet';

export { credentialsTypes } from './Credentials';
