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
    const dec = new TextDecoder();
    const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );
    return dec.decode(plaintext);
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
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
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
    return btoa(String.fromCharCode(...new Uint8Array(plaintextBuffer)));
};

const encryptKey = async (symmetricKey, publicKeyStr) => {
    if (!isBase64(publicKeyStr)) {
        throw new Error("Invalid base64 public key");
    }
    const enc = new TextEncoder();
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
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        enc.encode(symmetricKey)
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
