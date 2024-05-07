import { google } from 'googleapis';

import { DataToSaveI, GoogleAuthI, StorageStrategy } from './interfaces';

export class GoogleDriveStorage implements StorageStrategy {
  public oauth2Client;

  constructor(authCred: GoogleAuthI) {
    this.oauth2Client = new google.auth.OAuth2(
      authCred.clientId,
      authCred.clientSecret,
      authCred.redirectUri
    );
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async authenticate(code: any) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    // TODO store the tokens
  }

  initiateAuth(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      prompt: 'consent'
    });
  }

  async finalizeAuth(code: string): Promise<void> {
    await this.authenticate(code);
  }
  async save(data: DataToSaveI) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    const fileMetadata = {
      name: data.fileName,
      mimeType: data.mimeType
    };

    const media = {
      mimeType: data.mimeType,
      body: data.body
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });
    // TODO store the file ID
  }

  // TODO implement retrieve and delete methods
  async retrieve(id: string): Promise<any> {
    return;
  }

  async delete(id: string) {
    return;
  }
}
export { GoogleAuthI };
