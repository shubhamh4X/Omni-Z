import { auth, getCachedAccessToken } from '../firebase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number | string;
  modifiedTime?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  owners?: Array<{ displayName?: string }>;
  parents?: string[];
}

export interface ListDriveFilesOptions {
  query?: string;
  tab?: 'recent' | 'my-drive' | 'shared';
  pageToken?: string;
  pageSize?: number;
  folderId?: string;
}

export interface ListDriveFilesResult {
  files: DriveFile[];
  nextPageToken?: string;
  missingReadonlyScope?: boolean;
}

export interface DriveStatusResponse {
  connected: boolean;
  email: string | null;
  hasRefreshToken: boolean;
  expiryDate?: number | null;
  hasReadonlyScope?: boolean;
  scope?: string;
  isAccountMismatched?: boolean;
}

async function getAuthHeaders(userId?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (userId) {
    headers['x-user-id'] = userId;
  }
  const driveToken = getCachedAccessToken();
  if (driveToken) {
    headers['x-drive-token'] = driveToken;
  }
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
  } catch {}
  return headers;
}

export async function checkDriveStatus(userId: string, userEmail?: string): Promise<DriveStatusResponse> {
  if (!userId) return { connected: false, email: null, hasRefreshToken: false };
  try {
    const headers = await getAuthHeaders(userId);
    const emailParam = userEmail ? `&userEmail=${encodeURIComponent(userEmail)}` : '';
    const res = await fetch(`/api/drive/status?userId=${encodeURIComponent(userId)}${emailParam}`, {
      headers,
    });
    if (res.ok) {
      return await res.json();
    }
    return { connected: false, email: null, hasRefreshToken: false };
  } catch (err) {
    console.warn('[Google Drive] Status check failed:', err);
    return { connected: false, email: null, hasRefreshToken: false };
  }
}

export async function disconnectDriveSession(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const headers = await getAuthHeaders(userId);
    headers['Content-Type'] = 'application/json';
    await fetch('/api/drive/disconnect', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
  } catch (err) {
    console.warn('[Google Drive] Disconnect call failed:', err);
  }
}

export async function fetchDriveFiles(
  userIdOrToken: string,
  options: ListDriveFilesOptions = {}
): Promise<ListDriveFilesResult> {
  const { query = '', tab = 'my-drive', pageToken, pageSize = 40, folderId } = options;

  if (!userIdOrToken) {
    throw new Error('User identifier or token is required to browse Google Drive.');
  }

  const isDirectToken = userIdOrToken.startsWith('ya29.') || userIdOrToken.length > 80;

  if (!isDirectToken) {
    const params = new URLSearchParams({
      userId: userIdOrToken,
      query,
      tab,
      pageSize: String(pageSize),
    });
    if (pageToken) params.set('pageToken', pageToken);
    if (folderId) params.set('folderId', folderId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const headers = await getAuthHeaders(userIdOrToken);
      const response = await fetch(`/api/drive/files?${params.toString()}`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED_DRIVE_SESSION');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `Failed to fetch files from Google Drive (HTTP ${response.status})`);
      }

      const data = await response.json();
      return {
        files: data.files || [],
        nextPageToken: data.nextPageToken,
        missingReadonlyScope: data.missingReadonlyScope,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Google Drive request timed out. Please try again.');
      }
      throw err;
    }
  }

  const queryParts: string[] = [
    'trashed = false',
  ];
  if (folderId) {
    queryParts.push(`'${folderId}' in parents`);
  }
  if (tab === 'shared') {
    queryParts.push('sharedWithMe = true');
  }
  if (query.trim()) {
    const escapedQuery = query.trim().replace(/['\\]/g, '\\$&');
    queryParts.push(`name contains '${escapedQuery}'`);
  }

  const q = queryParts.join(' and ');
  const orderBy = tab === 'shared' ? 'sharedWithMeTime desc' : 'modifiedTime desc';
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, iconLink, thumbnailLink, webViewLink, owners(displayName), parents)',
    orderBy,
    q,
    spaces: 'drive',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  if (pageToken) params.set('pageToken', pageToken);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userIdOrToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED_DRIVE_SESSION');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Failed to fetch files from Google Drive (HTTP ${response.status})`);
    }

    const data = await response.json();
    const files: DriveFile[] = data.files || [];

    let missingReadonlyScope = false;
    if (files.length === 0 && !query.trim() && !folderId) {
      try {
        const tokenRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(userIdOrToken)}`);
        if (tokenRes.ok) {
          const tInfo = await tokenRes.json();
          const grantedScope = tInfo.scope || '';
          if (!grantedScope.includes('drive.readonly') && !grantedScope.includes('/auth/drive ')) {
            missingReadonlyScope = true;
          }
        }
      } catch {}
    }

    return {
      files,
      nextPageToken: data.nextPageToken,
      missingReadonlyScope,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Google Drive request timed out. Please check your network connection.');
    }
    throw err;
  }
}

export async function fetchDriveFileContent(
  userIdOrToken: string,
  file: DriveFile
): Promise<{ textContent: string; snippet: string; dataUrl?: string }> {
  const { id, name, mimeType } = file;

  const isDirectToken = userIdOrToken.startsWith('ya29.') || userIdOrToken.length > 80;

  if (!isDirectToken) {
    const headers = await getAuthHeaders(userIdOrToken);
    const res = await fetch(`/api/drive/file/${encodeURIComponent(id)}?userId=${encodeURIComponent(userIdOrToken)}`, {
      headers,
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED_DRIVE_SESSION');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to retrieve content for "${name}"`);
    }
    const data = await res.json();
    return {
      textContent: data.textContent,
      snippet: data.snippet,
      dataUrl: data.dataUrl,
    };
  }

  try {
    if (mimeType === 'application/vnd.google-apps.document') {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${userIdOrToken}` },
      });
      if (res.ok) {
        const text = await res.text();
        const snippet = text.slice(0, 150).replace(/\s+/g, ' ').trim();
        return {
          textContent: `[GOOGLE DOC: "${name}"]\n${text.slice(0, 35000)}\n[END OF GOOGLE DOC]`,
          snippet: snippet || 'Google Docs document',
        };
      }
    }

    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/csv`, {
        headers: { Authorization: `Bearer ${userIdOrToken}` },
      });
      if (res.ok) {
        const csv = await res.text();
        const firstLines = csv.split('\n').slice(0, 3).join(' | ');
        return {
          textContent: `[GOOGLE SPREADSHEET (CSV): "${name}"]\n${csv.slice(0, 30000)}\n[END OF SPREADSHEET]`,
          snippet: firstLines.slice(0, 150) || 'Google Sheets spreadsheet data',
        };
      }
    }

    if (mimeType === 'application/vnd.google-apps.presentation') {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${userIdOrToken}` },
      });
      if (res.ok) {
        const text = await res.text();
        return {
          textContent: `[GOOGLE PRESENTATION: "${name}"]\n${text.slice(0, 25000)}\n[END OF PRESENTATION]`,
          snippet: text.slice(0, 150).replace(/\s+/g, ' ').trim() || 'Google Slides presentation',
        };
      }
    }

    const isTextMime =
      mimeType.startsWith('text/') ||
      mimeType.includes('json') ||
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('xml') ||
      mimeType.includes('yaml') ||
      mimeType.includes('markdown');

    if (isTextMime) {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
        headers: { Authorization: `Bearer ${userIdOrToken}` },
      });
      if (res.ok) {
        const text = await res.text();
        return {
          textContent: `[DRIVE FILE: "${name}" (${mimeType})]:\n${text.slice(0, 30000)}\n[END OF FILE]`,
          snippet: text.slice(0, 150).replace(/\s+/g, ' ').trim() || 'Text file content',
        };
      }
    }

    return {
      textContent: `[GOOGLE DRIVE ATTACHMENT: "${name}"]\nType: ${mimeType}\nFile ID: ${id}\nView URL: ${file.webViewLink || 'Google Drive'}\n[END OF ATTACHMENT]`,
      snippet: `Drive file: ${name} (${mimeType})`,
    };
  } catch (err: any) {
    return {
      textContent: `[GOOGLE DRIVE ATTACHMENT: "${name}"]\nType: ${mimeType}\nFile ID: ${id}\n[END OF ATTACHMENT]`,
      snippet: `Attached from Google Drive: ${name}`,
    };
  }
}

export function formatDriveFileSize(bytes?: number | string): string {
  if (!bytes) return '';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num <= 0) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDriveModifiedDate(isoString?: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
