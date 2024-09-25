import { defaultDocumentLoader } from '@digitalbazaar/vc';
import { localOBContext, localED25519Context } from '../utils/context.js';

// Custom document loader
export const customDocumentLoader = async (url: string) => {
	const contextMap = {
		'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json': localOBContext,
		'https://w3id.org/security/suites/ed25519-2020/v1': localED25519Context,
	};

	if (contextMap[url]) {
		return {
			contextUrl: null,
			documentUrl: url,
			document: contextMap[url],
		};
	}
	return defaultDocumentLoader(url); // Fallback to default loader for unknown URLs
};
