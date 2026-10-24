import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let firebaseConfig = {};
try {
  const configPath = path.resolve(__dirname, "../firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch {
  firebaseConfig = {};
}
const DATA_DIR = path.join(__dirname, "data");
const TOKENS_FILE = path.join(DATA_DIR, "drive_tokens.enc");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const ENCRYPTION_SECRET = process.env.OAUTH_ENCRYPTION_KEY || process.env.GEMINI_API_KEY || firebaseConfig.apiKey || "omniz-oauth-secure-fallback-key-2026";
const HASHED_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", HASHED_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
function decrypt(cipherText) {
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return "{}";
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    const decipher = crypto.createDecipheriv("aes-256-gcm", HASHED_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("[Drive Service] Decryption fallback note:", err);
    return "{}";
  }
}
function loadTokensMap() {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(TOKENS_FILE, "utf-8");
    const jsonStr = decrypt(raw);
    return JSON.parse(jsonStr || "{}");
  } catch (err) {
    console.warn("[Drive Service] Failed to load tokens map:", err);
    return {};
  }
}
function saveTokensMap(map) {
  try {
    const jsonStr = JSON.stringify(map, null, 2);
    const encrypted = encrypt(jsonStr);
    fs.writeFileSync(TOKENS_FILE, encrypted, "utf-8");
  } catch (err) {
    console.error("[Drive Service] Failed to save tokens map:", err);
  }
}
function getClientId() {
  return process.env.GOOGLE_CLIENT_ID || firebaseConfig.oAuthClientId || "";
}
function getClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}
function resolveRedirectUri(reqHost, protocol = "https") {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/drive/callback`;
  }
  if (process.env.RAILWAY_STATIC_URL) {
    const domain = process.env.RAILWAY_STATIC_URL.replace(/^https?:\/\//, "");
    return `https://${domain}/api/drive/callback`;
  }
  if (process.env.APP_URL) {
    const cleanAppUrl = process.env.APP_URL.replace(/\/+$/, "");
    return `${cleanAppUrl}/api/drive/callback`;
  }
  if (reqHost) {
    const isLocal = reqHost.includes("localhost") || reqHost.includes("127.0.0.1");
    const proto = isLocal ? "http" : protocol || "https";
    return `${proto}://${reqHost}/api/drive/callback`;
  }
  return "http://localhost:3000/api/drive/callback";
}
function generateAuthUrl(userId, userEmail, redirectUri) {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("Google OAuth Client ID is not configured.");
  }
  const statePayload = JSON.stringify({ userId, userEmail, redirectUri, t: Date.now() });
  const stateHmac = crypto.createHmac("sha256", HASHED_KEY).update(statePayload).digest("hex");
  const state = Buffer.from(JSON.stringify({ p: statePayload, h: stateHmac })).toString("base64url");
  const scopes = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ].join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent select_account",
    include_granted_scopes: "false",
    state
  });
  if (userEmail && userEmail.includes("@")) {
    params.set("login_hint", userEmail);
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
function verifyState(stateStr) {
  try {
    const decoded = JSON.parse(Buffer.from(stateStr, "base64url").toString("utf-8"));
    const { p, h } = decoded;
    const computedHmac = crypto.createHmac("sha256", HASHED_KEY).update(p).digest("hex");
    if (computedHmac !== h) {
      return null;
    }
    return JSON.parse(p);
  } catch (err) {
    return null;
  }
}
async function exchangeCodeForTokens(code, redirectUri) {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const bodyParams = {
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  };
  if (clientSecret) {
    bodyParams.client_secret = clientSecret;
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(bodyParams).toString()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const desc = errData.error_description || errData.error || `HTTP ${res.status}`;
    throw new Error(`Token exchange failed: ${desc}`);
  }
  const data = await res.json();
  const expiresIn = Number(data.expires_in) || 3600;
  const expiryDate = Date.now() + expiresIn * 1e3;
  let email = "";
  if (data.id_token) {
    try {
      const parts = data.id_token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        if (payload?.email) {
          email = payload.email;
        }
      }
    } catch {
    }
  }
  if (!email && data.access_token) {
    try {
      const uRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      if (uRes.ok) {
        const uinfo = await uRes.json();
        if (uinfo?.email) {
          email = uinfo.email;
        }
      }
    } catch {
    }
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || "",
    expiryDate,
    scope: data.scope || "",
    email
  };
}
async function refreshAccessToken(refreshToken) {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const bodyParams = {
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  };
  if (clientSecret) {
    bodyParams.client_secret = clientSecret;
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(bodyParams).toString()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const desc = errData.error_description || errData.error || `HTTP ${res.status}`;
    if (desc.includes("invalid_grant") || desc.includes("revoked") || res.status === 400) {
      throw new Error("TOKEN_REVOKED");
    }
    throw new Error(`Token refresh failed: ${desc}`);
  }
  const data = await res.json();
  const expiresIn = Number(data.expires_in) || 3600;
  return {
    accessToken: data.access_token,
    expiryDate: Date.now() + expiresIn * 1e3
  };
}
function saveUserTokens(userId, email, accessToken, refreshToken, expiryDate, scope) {
  const map = loadTokensMap();
  const existing = map[userId];
  map[userId] = {
    userId,
    email: email || existing?.email || "",
    accessToken,
    refreshToken: refreshToken || existing?.refreshToken || "",
    expiryDate,
    scope: scope || existing?.scope || "",
    updatedAt: Date.now()
  };
  saveTokensMap(map);
}
function removeUserTokens(userId) {
  const map = loadTokensMap();
  if (map[userId]) {
    delete map[userId];
    saveTokensMap(map);
  }
}
function getUserDriveStatus(userId, expectedEmail) {
  const map = loadTokensMap();
  const record = map[userId];
  if (!record || !record.accessToken) {
    return { connected: false, email: null, hasRefreshToken: false, expiryDate: null, hasReadonlyScope: false, isAccountMismatched: false };
  }
  const scope = record.scope || "";
  const hasReadonlyScope = scope.includes("drive.readonly") || scope.includes("/auth/drive");
  const isAccountMismatched = Boolean(
    expectedEmail && record.email && expectedEmail.toLowerCase().trim() !== record.email.toLowerCase().trim()
  );
  if (!hasReadonlyScope) {
    return {
      connected: false,
      email: record.email || null,
      hasRefreshToken: Boolean(record.refreshToken),
      expiryDate: record.expiryDate,
      scope,
      hasReadonlyScope: false,
      isAccountMismatched
    };
  }
  return {
    connected: true,
    email: record.email || null,
    hasRefreshToken: Boolean(record.refreshToken),
    expiryDate: record.expiryDate,
    scope,
    hasReadonlyScope: true,
    isAccountMismatched
  };
}
async function getValidAccessTokenForUser(userId) {
  if (userId && (userId.startsWith("ya29.") || userId.length > 80)) {
    return userId;
  }
  const map = loadTokensMap();
  const record = map[userId];
  if (!record || !record.accessToken) {
    throw new Error("GOOGLE_DRIVE_NOT_CONNECTED");
  }
  if (record.expiryDate && Date.now() >= record.expiryDate - 12e4) {
    if (!record.refreshToken) {
      if (Date.now() < record.expiryDate) {
        return record.accessToken;
      }
      removeUserTokens(userId);
      throw new Error("GOOGLE_DRIVE_SESSION_EXPIRED");
    }
    try {
      const refreshed = await refreshAccessToken(record.refreshToken);
      record.accessToken = refreshed.accessToken;
      record.expiryDate = refreshed.expiryDate;
      record.updatedAt = Date.now();
      map[userId] = record;
      saveTokensMap(map);
      return refreshed.accessToken;
    } catch (err) {
      if (err.message === "TOKEN_REVOKED") {
        removeUserTokens(userId);
        throw new Error("GOOGLE_DRIVE_REVOKED");
      }
      throw err;
    }
  }
  return record.accessToken;
}
async function listUserDriveFiles(userId, options = {}) {
  const token = await getValidAccessTokenForUser(userId);
  const { query = "", tab = "my-drive", pageToken, pageSize = 40, folderId } = options;
  const queryParts = [
    "trashed = false"
  ];
  if (folderId) {
    queryParts.push(`'${folderId}' in parents`);
  }
  if (tab === "shared") {
    queryParts.push("sharedWithMe = true");
  }
  if (query.trim()) {
    const escapedQuery = query.trim().replace(/['\\]/g, "\\$&");
    queryParts.push(`name contains '${escapedQuery}'`);
  }
  const q = queryParts.join(" and ");
  const orderBy = tab === "shared" ? "sharedWithMeTime desc" : "modifiedTime desc";
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, iconLink, thumbnailLink, webViewLink, owners(displayName), parents)",
    orderBy,
    q,
    spaces: "drive",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true"
  });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15e3);
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 401) {
        removeUserTokens(userId);
        throw new Error("GOOGLE_DRIVE_SESSION_EXPIRED");
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Failed to fetch files (HTTP ${res.status})`);
    }
    const data = await res.json();
    const files = data.files || [];
    let missingReadonlyScope = false;
    if (files.length === 0 && !query.trim() && !folderId) {
      try {
        const tokenRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`);
        if (tokenRes.ok) {
          const tInfo = await tokenRes.json();
          const grantedScope = tInfo.scope || "";
          if (!grantedScope.includes("drive.readonly") && !grantedScope.includes("/auth/drive ")) {
            missingReadonlyScope = true;
          }
        }
      } catch {
      }
    }
    return {
      files,
      nextPageToken: data.nextPageToken,
      missingReadonlyScope
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Drive request timed out. Please try again.");
    }
    throw err;
  }
}
async function fetchUserDriveFileContent(userId, fileId) {
  const token = await getValidAccessTokenForUser(userId);
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!metaRes.ok) {
    if (metaRes.status === 401) {
      removeUserTokens(userId);
      throw new Error("GOOGLE_DRIVE_SESSION_EXPIRED");
    }
    throw new Error(`File not found or permission denied (HTTP ${metaRes.status})`);
  }
  const meta = await metaRes.json();
  const { name, mimeType, webViewLink, size } = meta;
  try {
    if (mimeType === "application/vnd.google-apps.document") {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (expRes.ok) {
        const text = await expRes.text();
        const snippet = text.slice(0, 160).replace(/\s+/g, " ").trim();
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : text.length,
          webViewLink,
          textContent: `[GOOGLE DOC: "${name}"]
${text.slice(0, 4e4)}
[END OF GOOGLE DOC]`,
          snippet: snippet || "Google Docs document"
        };
      }
    }
    if (mimeType === "application/vnd.google-apps.spreadsheet") {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (expRes.ok) {
        const csv = await expRes.text();
        const firstLines = csv.split("\n").slice(0, 3).join(" | ");
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : csv.length,
          webViewLink,
          textContent: `[GOOGLE SPREADSHEET (CSV): "${name}"]
${csv.slice(0, 35e3)}
[END OF SPREADSHEET]`,
          snippet: firstLines.slice(0, 160) || "Google Sheets spreadsheet data"
        };
      }
    }
    if (mimeType === "application/vnd.google-apps.presentation") {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (expRes.ok) {
        const text = await expRes.text();
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : text.length,
          webViewLink,
          textContent: `[GOOGLE SLIDES: "${name}"]
${text.slice(0, 3e4)}
[END OF GOOGLE SLIDES]`,
          snippet: text.slice(0, 160).replace(/\s+/g, " ").trim() || "Google Slides presentation"
        };
      }
    }
    if (mimeType.startsWith("image/")) {
      const dlRes2 = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dlRes2.ok) {
        const arrayBuf = await dlRes2.arrayBuffer();
        if (arrayBuf.byteLength <= 12 * 1024 * 1024) {
          const base64 = Buffer.from(arrayBuf).toString("base64");
          const dataUrl = `data:${mimeType};base64,${base64}`;
          return {
            id: fileId,
            name,
            mimeType,
            size: size ? Number(size) : arrayBuf.byteLength,
            webViewLink,
            dataUrl,
            textContent: `[GOOGLE DRIVE IMAGE: "${name}" (${mimeType})]
File ID: ${fileId}
Link: ${webViewLink || ""}`,
            snippet: `Image: ${name}`
          };
        }
      }
    }
    const isText = mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "application/javascript" || mimeType === "application/typescript" || mimeType === "application/xml";
    const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (dlRes.ok) {
      if (isText) {
        const text = await dlRes.text();
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : text.length,
          webViewLink,
          textContent: `[FILE: "${name}" (${mimeType})]
${text.slice(0, 35e3)}
[END OF FILE]`,
          snippet: text.slice(0, 160).replace(/\s+/g, " ").trim() || `${name} text file`
        };
      } else {
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : 0,
          webViewLink,
          textContent: `[ATTACHED GOOGLE DRIVE FILE: "${name}"]
File ID: ${fileId}
Type: ${mimeType}
Link: ${webViewLink || ""}
[END OF ATTACHMENT]`,
          snippet: `${name} (${mimeType})`
        };
      }
    }
  } catch (err) {
    console.warn(`[Drive Service] Could not export content for ${fileId}:`, err);
  }
  return {
    id: fileId,
    name,
    mimeType,
    size: size ? Number(size) : 0,
    webViewLink,
    textContent: `[ATTACHED GOOGLE DRIVE FILE: "${name}"]
File ID: ${fileId}
Type: ${mimeType}
Link: ${webViewLink || ""}
[END OF ATTACHMENT]`,
    snippet: `${name} (${mimeType})`
  };
}
export {
  exchangeCodeForTokens,
  fetchUserDriveFileContent,
  generateAuthUrl,
  getClientId,
  getClientSecret,
  getUserDriveStatus,
  getValidAccessTokenForUser,
  listUserDriveFiles,
  refreshAccessToken,
  removeUserTokens,
  resolveRedirectUri,
  saveUserTokens,
  verifyState
};
