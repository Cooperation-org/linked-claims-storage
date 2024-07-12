export interface StorageStrategy {
	save(data: any, folderId: string): Promise<{ id: string } | null>;
	createFolder(folderName: string, parentFolderId?: string): Promise<string>;
	retrieve(id: string): Promise<any>;
	getRootFolders(): Promise<any[]>;
	getSubFolders(id: string): Promise<any[]>;
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
