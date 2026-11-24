export interface GoogleDriveAccount {
  accessToken: string;
  email: string;
  expiresAt: number;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient(options: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback: (error: { message?: string }) => void;
          }): GoogleTokenClient;
        };
      };
    };
  }
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const BACKUP_FILE_NAME = 'kotlin-interview-trainer-backup.json';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else reject(new Error('Google sign-in loaded without its authorization API.'));
    };
    script.onerror = () => reject(new Error('Google sign-in could not be loaded. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
}

export async function signInToGoogleDrive(clientId: string, prompt = 'select_account'): Promise<GoogleDriveAccount> {
  const tokenClientFactory = window.google?.accounts?.oauth2?.initTokenClient;
  if (!tokenClientFactory) throw new Error('Google sign-in is not ready yet. Refresh the page and try again.');

  const tokenResponse = await new Promise<GoogleTokenResponse>((resolve, reject) => {
    const tokenClient = tokenClientFactory({
      client_id: clientId,
      scope: `openid email profile ${DRIVE_SCOPE}`,
      callback: resolve,
      error_callback: (error) => reject(new Error(error.message || 'Google sign-in was cancelled or failed.')),
    });
    tokenClient.requestAccessToken(prompt ? { prompt } : {});
  });

  if (!tokenResponse.access_token) {
    throw new Error(tokenResponse.error_description || tokenResponse.error || 'Google did not provide an access token.');
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
  });
  if (!profileResponse.ok) throw await getGoogleApiError(profileResponse, 'Could not read the Google account profile.');
  const profile = await profileResponse.json() as { email?: string };
  if (!profile.email) throw new Error('Google did not return an email address for this account.');

  return {
    accessToken: tokenResponse.access_token,
    email: profile.email,
    expiresAt: Date.now() + Math.max(0, tokenResponse.expires_in ?? 3600) * 1000,
  };
}

export async function saveGoogleDriveBackup(accessToken: string, serializedBackup: string): Promise<void> {
  const existingFile = await findGoogleDriveBackup(accessToken);
  const response = existingFile
    ? await fetch(`${DRIVE_UPLOAD_URL}/${encodeURIComponent(existingFile.id)}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: serializedBackup,
    })
    : await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=revisionBackupBoundary',
      },
      body: [
        '--revisionBackupBoundary',
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify({ name: BACKUP_FILE_NAME, parents: ['appDataFolder'] }),
        '--revisionBackupBoundary',
        'Content-Type: application/json',
        '',
        serializedBackup,
        '--revisionBackupBoundary--',
        '',
      ].join('\r\n'),
    });

  if (!response.ok) throw await getGoogleApiError(response, 'Could not save the backup to Google Drive.');
}

export async function restoreGoogleDriveBackup(accessToken: string): Promise<{ fileName: string; serializedBackup: string }> {
  const backupFile = await findGoogleDriveBackup(accessToken);
  if (!backupFile) throw new Error('No Google Drive backup was found for this app and account.');

  const response = await fetch(`${DRIVE_FILES_URL}/${encodeURIComponent(backupFile.id)}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw await getGoogleApiError(response, 'Could not download the backup from Google Drive.');

  return { fileName: backupFile.name, serializedBackup: await response.text() };
}

async function findGoogleDriveBackup(accessToken: string): Promise<GoogleDriveFile | undefined> {
  const parameters = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${BACKUP_FILE_NAME}' and trashed = false`,
    fields: 'files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });
  const response = await fetch(`${DRIVE_FILES_URL}?${parameters}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw await getGoogleApiError(response, 'Could not check Google Drive for an existing backup.');

  const result = await response.json() as { files?: GoogleDriveFile[] };
  return result.files?.[0];
}

async function getGoogleApiError(response: Response, fallback: string): Promise<Error> {
  let detail = '';
  try {
    const body = await response.json() as { error?: { message?: string } };
    detail = body.error?.message ?? '';
  } catch {
    detail = '';
  }
  return new Error(detail ? `${fallback} ${detail}` : `${fallback} (HTTP ${response.status})`);
}
