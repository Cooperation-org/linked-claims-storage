export interface StorageStrategy {
  save(data: any): Promise<void>;
  retrieve(id: string): Promise<any>;
  delete(id: string): Promise<void>;
  initiateAuth?: () => string;
  finalizeAuth?: (code: string) => Promise<void>;
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
