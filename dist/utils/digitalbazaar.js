import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { driver as didKeyDriver } from '@digitalbazaar/did-method-key';
import { defaultDocumentLoader } from '@digitalbazaar/vc';
import { localOBContext, localED25519Context } from '../utils/context.js';
// Initialize the DID method key driver
const didKeyDriverInstance = didKeyDriver();
didKeyDriverInstance.use({
    multibaseMultikeyHeader: 'z6Mk',
    fromMultibase: Ed25519VerificationKey2020.from,
});
// Custom document loader
export const customDocumentLoader = async (url) => {
    // Context map for local contexts
    const contextMap = {
        'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json': localOBContext,
        'https://w3id.org/security/suites/ed25519-2020/v1': localED25519Context,
    };
    // Return local context if it matches the URL
    if (contextMap[url]) {
        return {
            contextUrl: null,
            documentUrl: url,
            document: contextMap[url],
        };
    }
    // Handle did:key resolution
    if (url.startsWith('did:key:')) {
        const didDocument = await didKeyDriverInstance.get({ did: url });
        return {
            contextUrl: null,
            documentUrl: url,
            document: didDocument,
        };
    }
    // Fallback to the default document loader for unknown URLs
    return defaultDocumentLoader(url);
};
