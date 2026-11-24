import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { restoreGoogleDriveBackup, saveGoogleDriveBackup, signInToGoogleDrive } from './google-drive-backup';

describe('Google Drive backup', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests a private Drive scope and returns the signed-in account', async () => {
    let requestedScopes = '';
    let requestedPrompt: string | undefined;
    vi.stubGlobal('window', {
      google: {
        accounts: {
          oauth2: {
            initTokenClient: (options: {
              scope: string;
              callback: (response: { access_token: string; expires_in: number }) => void;
            }) => {
              requestedScopes = options.scope;
              return { requestAccessToken: (request: { prompt?: string }) => {
                requestedPrompt = request.prompt;
                options.callback({ access_token: 'token', expires_in: 3600 });
              } };
            },
          },
        },
      },
    });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ email: 'user@example.com' }) });

    const account = await signInToGoogleDrive('client-id');

    expect(requestedScopes).toContain('https://www.googleapis.com/auth/drive.appdata');
    expect(requestedScopes).not.toContain('https://www.googleapis.com/auth/drive ');
    expect(requestedPrompt).toBe('select_account');
    expect(account.email).toBe('user@example.com');
    expect(account.accessToken).toBe('token');
  });

  it('can request a new access token without asking the user to select an account', async () => {
    let requestedPrompt: string | undefined;
    vi.stubGlobal('window', {
      google: {
        accounts: {
          oauth2: {
            initTokenClient: (options: {
              callback: (response: { access_token: string; expires_in: number }) => void;
            }) => {
              return { requestAccessToken: (request: { prompt?: string }) => {
                requestedPrompt = request.prompt;
                options.callback({ access_token: 'token', expires_in: 3600 });
              } };
            },
          },
        },
      },
    });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ email: 'user@example.com' }) });

    const account = await signInToGoogleDrive('client-id', '');

    expect(requestedPrompt).toBeUndefined();
    expect(account.email).toBe('user@example.com');
  });

  it('creates a private app-data backup when none exists', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) })
      .mockResolvedValueOnce({ ok: true });

    await saveGoogleDriveBackup('token', '{"version":3}');

    const uploadCall = fetchMock.mock.calls[1];
    expect(String(uploadCall[0])).toContain('uploadType=multipart');
    expect(uploadCall[1].body).toContain('"parents":["appDataFolder"]');
    expect(uploadCall[1].body).toContain('{"version":3}');
  });

  it('restores the latest named backup from the app data folder', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'backup-id', name: 'kotlin-interview-trainer-backup.json' }] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => '{"version":3}' });

    const backup = await restoreGoogleDriveBackup('token');

    expect(backup).toEqual({ fileName: 'kotlin-interview-trainer-backup.json', serializedBackup: '{"version":3}' });
    expect(String(fetchMock.mock.calls[1][0])).toContain('/backup-id?alt=media');
  });
});
