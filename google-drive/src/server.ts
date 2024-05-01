import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import GoogleDriveUploader from './uploader'; // Assuming this class is in a separate file

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

google.options({ auth: oauth2Client });

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

app.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  res.render('index', { url });
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code as string);
  oauth2Client.setCredentials(tokens);
  res.redirect('/upload');
});

app.get('/upload', async (req, res) => {
  const uploader = new GoogleDriveUploader(oauth2Client);

  try {
    await uploader.uploadFile({
      filePath: path.join(__dirname, 'credentials.json'),
      mimeType: 'application/json'
    });
    res.send('File uploaded successfully to Google Drive.');
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).send('Failed to upload file.');
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
