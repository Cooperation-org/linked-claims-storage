import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleAuthI, StorageContext, StorageFactory } from './index.js';

dotenv.config();

const authCred: GoogleAuthI = {
	clientId: process.env.CLIENT_ID as string,
	clientSecret: process.env.CLIENT_SECRET as string,
	redirectUri: process.env.REDIRECT_URI as string,
};
const storageContext = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', authCred)); // 1
const upload = multer({
	// limit to 2mb and only JSON files
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype !== 'application/json') {
			cb(null, false);
		}
		cb(null, true);
	},
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
	res.render('index', { url: '/auth/google' });
});

app.get('/auth/google', (req, res) => {
	const authUrl = storageContext.strategy.oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/drive.file'], // Restrict to file access only
		prompt: 'consent',
	});
	res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
	const code = req.query.code;
	console.log('🚀 ~ app.get ~ code:', code);
	if (code) {
		try {
			await storageContext.strategy.authenticate(code as string);
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
	const authCode = req.query.code;
	console.log('🚀 ~ app.post ~ authCode:', authCode);
	try {
		await storageContext.strategy.save({
			fileName: file.originalname,
			mimeType: file.mimetype,
			body: file.buffer,
			authCode,
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
