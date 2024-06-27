// const GoogleDriveStorage = require('./dist/models/GoogleDriveStorage.js');
import { GoogleDriveStorage } from './dist/models/GoogleDriveStorage.js';
async function createFolderAndUploadFile() {
  try {
    const storage = new GoogleDriveStorage('ya29.a0AXooCguNqk5IUs9xc1jn9jMOgUW6PBTEHnZE7LKX8cBNzVlCPR7gY0TOVwtIPD0ndzSRLLqaVhzddms71_lOVSPWsuB3k_PPFuoqx96Q-SfktdltqetZrIiUIsIhkeE70xc1Kzx8ddRwIJO3fYVWdnojGx6gFIFSrh_laCgYKATMSARMSFQHGX2MixLYPoX6_RxW_0sTnVCvqpA0171'); // please contact to @0marSalah to add your account to the project
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
