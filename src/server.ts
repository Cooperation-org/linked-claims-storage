import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { StorageContext, StorageFactory } from './models/StorageContext.js';
import { GoogleAuthI } from './models/interfaces';
import dotenv from 'dotenv';

dotenv.config();

const authCred: GoogleAuthI = {
  clientId: process.env.CLIENT_ID as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  redirectUri: process.env.REDIRECT_URI as string
};

const storageContext = new StorageContext(
  StorageFactory.getStorageStrategy('googleDrive', authCred)
);

const upload = multer();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { url: '/auth/google' });
});

app.get('/auth/google', (req, res) => {
  if (storageContext.strategy.initiateAuth) {
    const url = storageContext.strategy.initiateAuth();
    res.redirect(url);
  } else {
    res.status(400).send('Authentication method not supported.');
  }
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      if (!storageContext.strategy.finalizeAuth) {
        throw new Error('Authentication method not supported.');
      }
      await storageContext.strategy.finalizeAuth(code as string);
      res.redirect('/upload');
    } catch (error: any) {
      res.status(500).send('Authentication failed: ' + error.message);
    }
  } else {
    res.status(400).send('Authentication failed: No code received.');
  }
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    await storageContext.strategy.save({
      fileName: file.originalname,
      mimeType: file.mimetype,
      body: file.stream
    });
    res.send('File uploaded successfully.');
  } catch (error: any) {
    console.log(error);
    res.status(500).send('Failed to upload file: ' + error.message);
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
