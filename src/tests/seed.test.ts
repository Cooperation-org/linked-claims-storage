import { decodeSecretKeySeed } from 'bnid';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { driver as keyDriver } from '@digitalbazaar/did-method-key';
import { CryptoLD } from 'crypto-ld';

// EXACT SAME SETUP AS YOUR WORKING SCRIPT
const cryptoLd = new CryptoLD();
cryptoLd.use(Ed25519VerificationKey2020);

// Reference decodeSeed implementation
const decodeSeed = async (secretKeySeed) => {
    let secretKeySeedBytes;
    if (secretKeySeed.startsWith('z')) {
        secretKeySeedBytes = decodeSecretKeySeed({ secretKeySeed });
    } else if (secretKeySeed.length >= 32) {
        secretKeySeedBytes = new TextEncoder().encode(secretKeySeed).slice(0, 32);
    } else {
        throw TypeError(
            '"secretKeySeed" must be at least 32 bytes, preferably multibase-encoded.'
        );
    }
    return secretKeySeedBytes;
};

// EXACT SAME FUNCTION AS YOUR WORKING generateSeed BUT WITH PREDEFINED SEEDS
async function testGenerateSeed(encodedSeed) {
    const seed = await decodeSeed(encodedSeed);
    let didDocument;
    
    // EXACT SAME CODE AS YOUR WORKING SCRIPT
    const didKeyDriver = keyDriver();
    didKeyDriver.use({
        multibaseMultikeyHeader: 'z6Mk',
        fromMultibase: Ed25519VerificationKey2020.from
    });
    
    const verificationKeyPair = await Ed25519VerificationKey2020.generate({
        seed
    });
    
    ({ didDocument } = await didKeyDriver.fromKeyPair({ verificationKeyPair }));
    
    const did = didDocument.id;
    return { seed: encodedSeed, decodedSeed: seed, did, didDocument, publicKey: verificationKeyPair.publicKeyMultibase };
}

// Test with different seeds
async function testDifferentSeeds() {
    console.log('Testing different seeds with EXACT working script approach:\n');
    
    const testSeeds = [
        'z1AjjnVSNmZot5TJcgtFYhn83WASAcphrqgE95AQ436hrGR',
        'z1AibHGc5Zek2kvdSyC22xGLZCvV7b77KWBFWiQmZGnD6rV',
        'z1AgfwVqaN3zX1kw2iTvLLekCbXNRJA7XbiFZCQv9TfgKCT',
        
    ];
    
    const results = [];
    
    for (const testSeed of testSeeds) {
        console.log(`Testing seed: ${testSeed}`);
        console.log(`Decoded hex: ${Buffer.from(await decodeSeed(testSeed)).toString('hex')}`);
        
        try {
            const result = await testGenerateSeed(testSeed);
            console.log(`Generated DID: ${result.did}`);
            console.log(`Public key: ${result.publicKey}`);
            results.push(result);
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
        console.log('---');
    }
    
    console.log('\nResults:');
    const uniqueDids = new Set(results.map(r => r.did));
    const uniqueKeys = new Set(results.map(r => r.publicKey));
    
    console.log(`Total results: ${results.length}`);
    console.log(`Unique DIDs: ${uniqueDids.size}`);
    console.log(`Unique public keys: ${uniqueKeys.size}`);
    console.log(`Expected unique: ${testSeeds.length}`);
    console.log(`Success: ${uniqueDids.size === testSeeds.length ? '✓ YES' : '✗ NO'}`);
    
    results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.seed} -> ${result.did}`);
    });
}

testDifferentSeeds().catch(console.error);