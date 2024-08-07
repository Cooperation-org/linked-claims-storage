declare module 'did-method-key' {
	export function driver(): any;
}

declare module '@digitalbazaar/ed25519-verification-key-2020' {
	export class Ed25519VerificationKey2020 {
		static generate(): Promise<any>;
		static from(params: any): Promise<any>;
	}
}

declare module '@digitalbazaar/ed25519-signature-2020' {
	export class Ed25519Signature2020 {
		constructor(params: { key: any; verificationMethod: string });
		static from(params: any): Promise<any>;
	}
}

declare module '@digitalbazaar/vc' {
	export function issue(options: any): Promise<any>;
	export function defaultDocumentLoader(url: string): Promise<any>;
}
