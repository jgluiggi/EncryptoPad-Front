// Constants for AES-GCM configuration
const ALGORITHM = {
    NAME: "AES-GCM",
    LENGTH: 256,
    IV_BYTE_LEN: 12,
    TAG_LENGTH: 128,
    SALT_BYTE_LEN: 16
};

// Helper functions for Base64 conversion
function ab2b64(arrayBuffer) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}

function b642ab(base64string){
      return Uint8Array.from(atob(base64string), c => c.charCodeAt(0));
}


// Generate a random IV
const getIV = () => window.crypto.getRandomValues(new Uint8Array(ALGORITHM.IV_BYTE_LEN));

// Generate a random AES-GCM key
export const getRandomKey = async () => {
    return await window.crypto.subtle.generateKey(
        { name: ALGORITHM.NAME, length: ALGORITHM.LENGTH },
        true,
        ["encrypt", "decrypt"]
    );
};

// Generate a random salt
export const getSalt = () => {
    return window.crypto.getRandomValues(new Uint8Array(ALGORITHM.SALT_BYTE_LEN));
};

// Derive an AES-GCM key from a password using PBKDF2
export const getKeyFromPassword = async (password, salt) => {
    const passwordBuffer = typeof password === "string"
        ? new TextEncoder().encode(password)
        : password;
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        { name: ALGORITHM.NAME, length: ALGORITHM.LENGTH },
        true,
        ["encrypt", "decrypt"]
    );
};

// Encrypt a message and return Base64 string
export const encrypt = async (messagetext, key) => {
    const iv = getIV();
    const encoder = new TextEncoder();
    const data = typeof messagetext === "string" ? encoder.encode(messagetext) : messagetext;

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: ALGORITHM.NAME, iv: iv, tagLength: ALGORITHM.TAG_LENGTH },
        key,
        data
    );

    const encryptedDataBase64 = ab2b64(encryptedBuffer);
    const ivBase64 = ab2b64(iv);

    return `${encryptedDataBase64}.${ivBase64}`; // Return Base64 string
};

// Decrypt a Base64 string
export const decrypt = async (ciphertextBase64, key) => {
    const { 0: data, 1: iv } = ciphertextBase64.split(".");
    const initializationVector = b642ab(iv); // Convert back to Uint8Array
    const _data = b642ab(data);

    const decryptedData = await window.crypto.subtle.decrypt(
        { name: ALGORITHM.NAME, iv: initializationVector, tagLength: ALGORITHM.TAG_LENGTH },
        key,
        _data
    );

    return new TextDecoder().decode(decryptedData); // Return plaintext string
};

// Export and import key (optional)
export const exportKey = async (key) => {
    return await window.crypto.subtle.exportKey("jwk", key);
};

export const importKey = async (jwk) => {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: ALGORITHM.NAME },
        true,
        ["encrypt", "decrypt"]
    );
};
