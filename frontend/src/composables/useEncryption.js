function isBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (e) {
        return false;
    }
}

const encryptMessage = async (content, keyString) => {
    if (!isBase64(keyString)) {
        throw new Error("Invalid base64 key");
    }
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(keyString), c => c.charCodeAt(0)),
        'AES-GCM',
        false,
        ['encrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(content)
    );
    return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(ciphertext)));
};

const decryptMessage = async (ciphertextB64, keyString) => {
    if (!isBase64(keyString)) {
        throw new Error("Invalid base64 key");
    }
    const data = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    const key = await window.crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(keyString), c => c.charCodeAt(0)),
        'AES-GCM',
        false,
        ['decrypt']
    );
    
    const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );
    let decoded = new TextDecoder('utf-8').decode(new Uint8Array(plaintext));
    return decoded;
};

const generateSymmetricKey = async () => {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
    const rawKey = await window.crypto.subtle.exportKey("raw", key);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    return keyBase64;
};

const generateKeyPair = async () => {
    try {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
        const [publicKeyData, privateKeyData] = await Promise.all([
            window.crypto.subtle.exportKey("spki", keyPair.publicKey),
            window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
        ]);

        const publicKeyStr = arrayBufferToBase64(publicKeyData);
        const privateKeyStr = arrayBufferToBase64(privateKeyData);

        localStorage.setItem('publicKey', publicKeyStr);
        localStorage.setItem('privateKey', privateKeyStr);
        return publicKeyStr;
    } catch (e) {
        console.error("Erreur lors de la génération des clés :", e);
        throw e;
    }
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const decryptKey = async (ciphertextB64) => {
    const privateKeyStr = localStorage.getItem('privateKey');
    if (!privateKeyStr) {
        throw new Error("Private key not found in localStorage");
    }
    if (!isBase64(privateKeyStr)) {
        throw new Error("Invalid base64 private key");
    }
    const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        Uint8Array.from(atob(privateKeyStr), c => c.charCodeAt(0)),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["decrypt"]
    );
    const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
    const plaintextBuffer = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        ciphertext
    );
    // Retournez directement la clé symétrique en base64
    return btoa(String.fromCharCode(...new Uint8Array(plaintextBuffer)));
};

const encryptKey = async (symmetricKey, publicKeyStr) => {
    if (!isBase64(publicKeyStr)) {
        throw new Error("Invalid base64 public key");
    }
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(publicKeyStr), c => c.charCodeAt(0)),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"]
    );
    // Décodez la clé symétrique de base64 en bytes
    const symmetricKeyBytes = Uint8Array.from(atob(symmetricKey), c => c.charCodeAt(0));
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        symmetricKeyBytes
    );
    return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
};

export default {
    encryptMessage,
    decryptMessage,
    generateSymmetricKey,
    generateKeyPair,
    decryptKey,
    encryptKey
};

async function testFullFlow() {
    try {
        const symmetricKey = await generateSymmetricKey();
        const publicKey = localStorage.getItem('publicKey');

        console.log("Symmetric key:", symmetricKey);
        console.log("Public key:", publicKey);

        const encryptedKey = await encryptKey(symmetricKey, publicKey);
        console.log("Encrypted key:", encryptedKey);

        const decryptedKey = await decryptKey(encryptedKey);
        console.log("Decrypted key:", decryptedKey);

        if (symmetricKey !== decryptedKey) {
            console.error("Keys do not match!");
        } else {
            console.log("Success: keys match!");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
// testFullFlow(); // Décommentez pour exécuter le test complet