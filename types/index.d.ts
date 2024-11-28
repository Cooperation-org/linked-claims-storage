export interface DataToSaveI {
	fileName: string;
	mimeType: string;
	body: any;
}

export type FilesType = 'KEYPAIRs' | 'MEDIAs' | 'VCs' | 'VPs' | 'RECOMMENDATIONs' | 'DIDs' | 'RELATIONS';

export * from './credential';
