import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
class GoogleDriveUploader {
    constructor(auth) {
        this.auth = auth;
    }
    async uploadFile({ filePath, mimeType, }) {
        const drive = google.drive({ version: 'v3', auth: this.auth });
        const fileMetadata = {
            name: path.basename(filePath),
            mimeType: mimeType,
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };
        try {
            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
            });
            console.log('File ID:', response.data.id);
        }
        catch (error) {
            console.error('The API returned an error: ' + error);
            throw error;
        }
    }
}
export default GoogleDriveUploader;
