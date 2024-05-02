import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

interface UploadOptions {
  fileName: string;
  mimeType: string;
  body: any;
}

class GoogleDriveUploader {
  constructor(private auth: any) {}

  public async uploadFile({
    fileName,
    mimeType,
    body
  }: UploadOptions): Promise<void> {
    const drive = google.drive({ version: 'v3', auth: this.auth });
    const fileMetadata = {
      name: fileName,
      mimeType
    };
    const media = {
      mimeType,
      body
    };

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id'
      });
      console.log('File ID:', response.data.id);
    } catch (error) {
      console.error('The API returned an error: ' + error);
      throw error;
    }
  }
}

export default GoogleDriveUploader;
