import { StorageContext, StorageFactory } from './dist/index.js';

const accessToken =
	'ya29.a0AXooCguLHaKYRd1m3oc-bNvh9Q8kBbSFgfrM_ULtXt_l7wdMcyyRU31IgQAygNEOeimWlVMlbXLwyEyAowXAABUElGUiftTf-YhUiruW2VGg04k2X4-0n1ZU_hy7cukRIzUmjH5Smcbps2Yyb3p82PCJcimB5m_a3Tu8aCgYKAQ4SARMSFQHGX2Mi1330b5sRzCjyQrDomrNFYw0171';
let fileId = '';
const strategy = StorageFactory.getStorageStrategy('googleDrive', { accessToken });

const storage = new StorageContext(strategy);

async function createFolderAndUploadFile() {
	try {
		const folderName = 'USER_UNIQUE_KEY'; // need to discuss with team how we will set the folder name
		const folderId = await storage.createFolder(folderName);

		const fileData = {
			fileName: 'test.json',
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
