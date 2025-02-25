export declare class ResumeVC {
    sign({ formData, issuerDid, keyPair }: {
        formData: any;
        issuerDid: string;
        keyPair: any;
    }): Promise<any>;
    generateUnsignedCredential({ formData, issuerDid }: {
        formData: any;
        issuerDid: string;
    }): any;
    generateKeyPair: (address?: string) => Promise<any>;
    /**
     * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
     * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
     * @throws Will throw an error if DID creation fails.
     */
    createDID({ keyPair }: {
        keyPair: any;
    }): Promise<import("../../types/credential.js").DidDocument>;
}
