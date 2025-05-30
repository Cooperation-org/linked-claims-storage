export declare function decodeSeed(encodedSeed: string): Promise<Uint8Array>;
export declare const getDidFromEnvSeed: (encodedSeed: string) => Promise<{
    keyPair: any;
    didDocument: {
        '@context': string[];
        id: string;
        verificationMethod: {
            id: string;
            type: string;
            controller: string;
            publicKeyMultibase: any;
        }[];
        authentication: string[];
        assertionMethod: string[];
        capabilityDelegation: string[];
        capabilityInvocation: string[];
    };
}>;
