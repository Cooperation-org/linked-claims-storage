import { StorageContext, StorageFactory } from '../dist/index.js';

const accessToken = 'ADD_YOUR_ACCESS';
let fileId = '';
const strategy = StorageFactory.getStorageStrategy('googleDrive', { accessToken });

const storage = new StorageContext(strategy);

async function createFolderAndUploadFile() {
	try {
		const folderName = 'USER_CREDENTIALS'; // chech the engineering doc for more clarity about naming
		const folderId = await storage.createFolder(folderName);

		const fileData = {
			fileName: 'TIMESTAMP.json',
			mimeType: 'application/json',
			body: JSON.stringify({ name: 'John Doe' }),
		};
		const response = await storage.save(fileData, folderId);
		fileId = response.id;
		console.log('File uploaded successfully with ID:', fileId);
	} catch (error) {
		console.error('Error:', error);
	}
}

const getFile = async () => {
	const file = await storage.retrieve(fileId);
	console.log('File:', file);
};

const main = async () => {
	await createFolderAndUploadFile();
	await getFile();
};

main();
