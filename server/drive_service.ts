import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import firebaseConfig from '../firebase-applet-config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const TOKENS_FILE = path.join(DATA_DIR, 'drive_tokens.enc');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ENCRYPTION_SECRET = process.env.OAUTH_ENCRYPTION_KEY || 
  process.env.GEMINI_API_KEY || 
  (firebaseConfig as any).apiKey || 
  'omniz-oauth-secure-fallback-key-2026';

const HASHED_KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', HASHED_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(cipherText: string): string {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return '{}';
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', HASHED_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('[Drive Service] Decryption fallback note:', err);
    return '{}';
  }
}

export interface StoredDriveTokens {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope?: string;
  updatedAt: number;
}

function loadTokensMap(): Record<string, StoredDriveTokens> {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
    const jsonStr = decrypt(raw);
    return JSON.parse(jsonStr || '{}');
  } catch (err) {
    console.warn('[Drive Service] Failed to load tokens map:', err);
    return {};
  }
}

function saveTokensMap(map: Record<string, StoredDriveTokens>): void {
  try {
    const jsonStr = JSON.stringify(map, null, 2);
    const encrypted = encrypt(jsonStr);
    fs.writeFileSync(TOKENS_FILE, encrypted, 'utf-8');
  } catch (err) {
    console.error('[Drive Service] Failed to save tokens map:', err);
  }
}

export function getClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || (firebaseConfig as any).oAuthClientId || '';
}

export function getClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || '';
}

export function resolveRedirectUri(reqHost?: string, protocol = 'https'): string {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/drive/callback`;
  }
  if (process.env.RAILWAY_STATIC_URL) {
    const domain = process.env.RAILWAY_STATIC_URL.replace(/^https?:\/\//, '');
    return `https://${domain}/api/drive/callback`;
  }
  if (process.env.APP_URL) {
    const cleanAppUrl = process.env.APP_URL.replace(/\/+$/, '');
    return `${cleanAppUrl}/api/drive/callback`;
  }
  if (reqHost) {
    const isLocal = reqHost.includes('localhost') || reqHost.includes('127.0.0.1');
    const proto = isLocal ? 'http' : (protocol || 'https');
    return `${proto}://${reqHost}/api/drive/callback`;
  }
  return 'http://localhost:3000/api/drive/callback';
}

export function generateAuthUrl(userId: string, userEmail: string, redirectUri: string): string {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Google OAuth Client ID is not configured.');
  }

  const statePayload = JSON.stringify({ userId, userEmail, redirectUri, t: Date.now() });
  const stateHmac = crypto.createHmac('sha256', HASHED_KEY).update(statePayload).digest('hex');
  const state = Buffer.from(JSON.stringify({ p: statePayload, h: stateHmac })).toString('base64url');

  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });

  if (userEmail && userEmail.includes('@')) {
    params.set('login_hint', userEmail);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function verifyState(stateStr: string): { userId: string; userEmail: string; redirectUri: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(stateStr, 'base64url').toString('utf-8'));
    const { p, h } = decoded;
    const computedHmac = crypto.createHmac('sha256', HASHED_KEY).update(p).digest('hex');
    if (computedHmac !== h) {
      return null;
    }
    return JSON.parse(p);
  } catch (err) {
    return null;
  }
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiryDate: number; scope: string }> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  const bodyParams: Record<string, string> = {
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  if (clientSecret) {
    bodyParams.client_secret = clientSecret;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(bodyParams).toString(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const desc = errData.error_description || errData.error || `HTTP ${res.status}`;
    throw new Error(`Token exchange failed: ${desc}`);
  }

  const data = await res.json();
  const expiresIn = Number(data.expires_in) || 3600;
  const expiryDate = Date.now() + (expiresIn * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || '',
    expiryDate,
    scope: data.scope || '',
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiryDate: number }> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const bodyParams: Record<string, string> = {
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  };

  if (clientSecret) {
    bodyParams.client_secret = clientSecret;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(bodyParams).toString(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const desc = errData.error_description || errData.error || `HTTP ${res.status}`;
    if (desc.includes('invalid_grant') || desc.includes('revoked') || res.status === 400) {
      throw new Error('TOKEN_REVOKED');
    }
    throw new Error(`Token refresh failed: ${desc}`);
  }

  const data = await res.json();
  const expiresIn = Number(data.expires_in) || 3600;
  return {
    accessToken: data.access_token,
    expiryDate: Date.now() + (expiresIn * 1000),
  };
}

export function saveUserTokens(
  userId: string,
  email: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: number,
  scope?: string
): void {
  const map = loadTokensMap();
  const existing = map[userId];

  map[userId] = {
    userId,
    email: email || existing?.email || '',
    accessToken,
    refreshToken: refreshToken || existing?.refreshToken || '',
    expiryDate,
    scope: scope || existing?.scope || '',
    updatedAt: Date.now(),
  };

  saveTokensMap(map);
}

export function removeUserTokens(userId: string): void {
  const map = loadTokensMap();
  if (map[userId]) {
    delete map[userId];
    saveTokensMap(map);
  }
}

export function getUserDriveStatus(userId: string): {
  connected: boolean;
  email: string | null;
  hasRefreshToken: boolean;
  expiryDate: number | null;
} {
  const map = loadTokensMap();
  const record = map[userId];
  if (!record || !record.accessToken) {
    return { connected: false, email: null, hasRefreshToken: false, expiryDate: null };
  }
  return {
    connected: true,
    email: record.email || null,
    hasRefreshToken: Boolean(record.refreshToken),
    expiryDate: record.expiryDate,
  };
}

export async function getValidAccessTokenForUser(userId: string): Promise<string> {
  const map = loadTokensMap();
  const record = map[userId];

  if (!record || !record.accessToken) {
    throw new Error('GOOGLE_DRIVE_NOT_CONNECTED');
  }

  if (record.expiryDate && Date.now() >= record.expiryDate - 120000) {
    if (!record.refreshToken) {
      if (Date.now() < record.expiryDate) {
        return record.accessToken;
      }
      removeUserTokens(userId);
      throw new Error('GOOGLE_DRIVE_SESSION_EXPIRED');
    }

    try {
      const refreshed = await refreshAccessToken(record.refreshToken);
      record.accessToken = refreshed.accessToken;
      record.expiryDate = refreshed.expiryDate;
      record.updatedAt = Date.now();
      map[userId] = record;
      saveTokensMap(map);
      return refreshed.accessToken;
    } catch (err: any) {
      if (err.message === 'TOKEN_REVOKED') {
        removeUserTokens(userId);
        throw new Error('GOOGLE_DRIVE_REVOKED');
      }
      throw err;
    }
  }

  return record.accessToken;
}

export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number | string;
  modifiedTime?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  owners?: Array<{ displayName?: string }>;
}

export async function listUserDriveFiles(
  userId: string,
  options: { query?: string; tab?: 'recent' | 'my-drive' | 'shared'; pageToken?: string; pageSize?: number } = {}
): Promise<{ files: DriveApiFile[]; nextPageToken?: string }> {
  const token = await getValidAccessTokenForUser(userId);
  const { query = '', tab = 'recent', pageToken, pageSize = 35 } = options;

  const queryParts: string[] = ['trashed = false'];
  if (tab === 'shared') {
    queryParts.push('sharedWithMe = true');
  }
  if (query.trim()) {
    const escapedQuery = query.trim().replace(/['\\]/g, '\\$&');
    queryParts.push(`name contains '${escapedQuery}'`);
  }

  const q = queryParts.join(' and ');
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, iconLink, thumbnailLink, webViewLink, owners(displayName))',
    orderBy: tab === 'recent' ? 'modifiedTime desc' : 'name asc',
    q,
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 401) {
        removeUserTokens(userId);
        throw new Error('GOOGLE_DRIVE_SESSION_EXPIRED');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Failed to fetch files (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Drive request timed out. Please try again.');
    }
    throw err;
  }
}

export async function fetchUserDriveFileContent(
  userId: string,
  fileId: string
): Promise<{ id: string; name: string; mimeType: string; size?: number; textContent: string; snippet: string; webViewLink?: string; dataUrl?: string }> {
  const token = await getValidAccessTokenForUser(userId);

  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!metaRes.ok) {
    if (metaRes.status === 401) {
      removeUserTokens(userId);
      throw new Error('GOOGLE_DRIVE_SESSION_EXPIRED');
    }
    throw new Error(`File not found or permission denied (HTTP ${metaRes.status})`);
  }

  const meta = await metaRes.json();
  const { name, mimeType, webViewLink, size } = meta;

  try {
    if (mimeType === 'application/vnd.google-apps.document') {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expRes.ok) {
        const text = await expRes.text();
        const snippet = text.slice(0, 160).replace(/\s+/g, ' ').trim();
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : text.length,
          webViewLink,
          textContent: `[GOOGLE DOC: "${name}"]\n${text.slice(0, 40000)}\n[END OF GOOGLE DOC]`,
          snippet: snippet || 'Google Docs document',
        };
      }
    }

    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expRes.ok) {
        const csv = await expRes.text();
        const firstLines = csv.split('\n').slice(0, 3).join(' | ');
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : csv.length,
          webViewLink,
          textContent: `[GOOGLE SPREADSHEET (CSV): "${name}"]\n${csv.slice(0, 35000)}\n[END OF SPREADSHEET]`,
          snippet: firstLines.slice(0, 160) || 'Google Sheets spreadsheet data',
        };
      }
    }

    if (mimeType === 'application/vnd.google-apps.presentation') {
      const expRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expRes.ok) {
        const text = await expRes.text();
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : text.length,
          webViewLink,
          textContent: `[GOOGLE SLIDES: "${name}"]\n${text.slice(0, 30000)}\n[END OF GOOGLE SLIDES]`,
          snippet: text.slice(0, 160).replace(/\s+/g, ' ').trim() || 'Google Slides presentation',
        };
      }
    }

    if (mimeType.startsWith('image/')) {
      const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dlRes.ok) {
        const arrayBuf = await dlRes.arrayBuffer();
        if (arrayBuf.byteLength <= 12 * 1024 * 1024) {
          const base64 = Buffer.from(arrayBuf).toString('base64');
          const dataUrl = `data:${mimeType};base64,${base64}`;
          return {
            id: fileId,
            name,
            mimeType,
            size: size ? Number(size) : arrayBuf.byteLength,
            webViewLink,
            dataUrl,
            textContent: `[GOOGLE DRIVE IMAGE: "${name}" (${mimeType})]\nFile ID: ${fileId}\nLink: ${webViewLink || ''}`,
            snippet: `Image: ${name}`,
          };
        }
      }
    }

    const isText = 
      mimeType.startsWith('text/') || 
      mimeType === 'application/json' || 
      mimeType === 'application/javascript' || 
      mimeType === 'application/typescript' ||
      mimeType === 'application/xml';

    const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
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
          textContent: `[FILE: "${name}" (${mimeType})]\n${text.slice(0, 35000)}\n[END OF FILE]`,
          snippet: text.slice(0, 160).replace(/\s+/g, ' ').trim() || `${name} text file`,
        };
      } else {
        return {
          id: fileId,
          name,
          mimeType,
          size: size ? Number(size) : 0,
          webViewLink,
          textContent: `[ATTACHED GOOGLE DRIVE FILE: "${name}"]\nFile ID: ${fileId}\nType: ${mimeType}\nLink: ${webViewLink || ''}\n[END OF ATTACHMENT]`,
          snippet: `${name} (${mimeType})`,
        };
      }
    }
  } catch (err: any) {
    console.warn(`[Drive Service] Could not export content for ${fileId}:`, err);
  }

  return {
    id: fileId,
    name,
    mimeType,
    size: size ? Number(size) : 0,
    webViewLink,
    textContent: `[ATTACHED GOOGLE DRIVE FILE: "${name}"]\nFile ID: ${fileId}\nType: ${mimeType}\nLink: ${webViewLink || ''}\n[END OF ATTACHMENT]`,
    snippet: `${name} (${mimeType})`,
  };
}
