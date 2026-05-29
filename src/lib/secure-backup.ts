// 加密備份檔：使用者輸入 passphrase → PBKDF2 推導 AES-GCM 256 金鑰 → 加密備份內容
// 威脅模型：保護備份檔被誤傳（Email、Drive、聊天）後仍無法被讀取

const PBKDF2_ITERATIONS = 200_000;

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export type EncryptedEnvelope = {
  v: 1;
  encrypted: true;
  app: "caretaiwan";
  algo: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iter: number;
  salt: string;
  iv: string;
  ct: string;
  exportedAt: number;
};

export function isEncryptedEnvelope(obj: unknown): obj is EncryptedEnvelope {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    o.encrypted === true &&
    o.app === "caretaiwan" &&
    typeof o.salt === "string" &&
    typeof o.iv === "string" &&
    typeof o.ct === "string"
  );
}

export async function encryptBackup(
  plaintext: string,
  passphrase: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext)
  );
  const envelope: EncryptedEnvelope = {
    v: 1,
    encrypted: true,
    app: "caretaiwan",
    algo: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iter: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(ct),
    exportedAt: Date.now(),
  };
  return JSON.stringify(envelope, null, 2);
}

export async function decryptBackup(
  envelopeJson: string,
  passphrase: string
): Promise<{ ok: true; plaintext: string } | { ok: false; error: "PARSE" | "WRONG_PASSPHRASE" }> {
  let obj: unknown;
  try {
    obj = JSON.parse(envelopeJson);
  } catch {
    return { ok: false, error: "PARSE" };
  }
  if (!isEncryptedEnvelope(obj)) return { ok: false, error: "PARSE" };
  try {
    const salt = fromBase64(obj.salt);
    const iv = fromBase64(obj.iv);
    const ct = fromBase64(obj.ct);
    const key = await deriveKey(passphrase, salt);
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ct as BufferSource
    );
    return { ok: true, plaintext: new TextDecoder().decode(pt) };
  } catch {
    return { ok: false, error: "WRONG_PASSPHRASE" };
  }
}
