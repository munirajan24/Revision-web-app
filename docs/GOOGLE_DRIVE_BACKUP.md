# Google Drive backup setup

The app's Google Drive backup is optional. It uses Google Identity Services in the browser and stores one JSON backup in the signed-in user's private Drive `appDataFolder`. The app does not run a backend or automatically sync data. Existing local JSON export/import remains available.

## Configure Google OAuth

1. In Google Cloud Console, create or select a project and enable the **Google Drive API**.
2. Configure the OAuth consent screen / Google Auth Platform for the app. Add the `openid`, `email`, `profile`, and `https://www.googleapis.com/auth/drive.appdata` scopes.
3. Create an OAuth 2.0 client ID of type **Web application**.
4. Add the app's origins under **Authorized JavaScript origins**. For local Vite development, include the exact origin you use, for example `http://localhost:4176` or `http://127.0.0.1:4176`. Add the production origin when deploying.
5. Copy `.env.example` to `.env.local`, set `VITE_GOOGLE_CLIENT_ID` to the client ID, and restart Vite. The client ID is public browser configuration; never put a client secret in this frontend app.

## Configure the deployed Render build

The local `.env.local` file is not sent to Render. In the Render dashboard, open the service serving `trainer.mojeemo.com`, then go to **Environment**. Add `VITE_GOOGLE_CLIENT_ID` with the OAuth **Web client ID**, save, and trigger a new production deployment so Vite can embed it in the static build.

In Google Cloud Console, add `https://trainer.mojeemo.com` (origin only: no path or trailing slash) to that OAuth client's **Authorized JavaScript origins**. The production deployment must be rebuilt after changing the Render environment variable; refreshing the old deployment cannot load it retroactively.

Google Drive backup controls are in **Settings → Data**. Sign in to check whether a Drive backup exists; the UI shows the filename, last-updated time, and size when available. Choose **Refresh backup status** to check again, **Save to Google Drive** to create/update it, or **Restore from Google Drive**. Restore validates the downloaded backup and uses the same **Merge / Add** or **Replace** confirmation as local import. The app remembers the Google account email on this device so after a page refresh you can continue as that account without selecting it again. OAuth access tokens are not stored in browser storage; Google issues a fresh short-lived token when reconnecting. **Forget account** / **Sign out** clears the remembered email and in-memory token, but does not delete the Drive backup or revoke the app's Google consent.

The backup includes all data currently included in the app's full JSON export, including saved coding drafts, notes, interview records, and Mobile Interview active/completed sessions, schedules, and per-question attended/correct/wrong/skipped statistics. The user must explicitly choose to upload or restore; no data is sent to Google before that action.
