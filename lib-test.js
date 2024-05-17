// const GoogleDriveStorage = require('./dist/models/GoogleDriveStorage.js');
import { GoogleDriveStorage } from './dist/models/GoogleDriveStorage.js';
async function createFolderAndUploadFile() {
  try {
    const storage = new GoogleDriveStorage('ADD_YOUR_ACCESS_TOKEN'); // please contact to @0marSalah to add your account to the project
    const folderName = 'USER_UN(IQUE_KEY'; // need to discussed with team how we sill set the folder name
    const folderId = await storage.createFolder(folderName);

    const fileData = {
      fileName: 'test.json',
      mimeType: 'application/json',
      body: new Blob([JSON.stringify({ name: 'John Doe' })], {
        type: 'application/json'
      })
    };
    const fileId = await storage.save(fileData, folderId);
    console.log('File uploaded successfully with ID:', fileId);
  } catch (error) {
    console.error('Error:', error);
  }
}

createFolderAndUploadFile();
