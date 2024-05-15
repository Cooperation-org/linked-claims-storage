# Linked Claims Storage

## Installation
To install the Linked Claims Storage library, you can use either npm or yarn. Run one of the following commands in your project directory:

```bash
npm install && npm run build
```
or
```bash
yarn install && yarn build
```

## Link the lib locally
To link the library locally, run the following command in the library directory:

```bash
npm link
```

Then, in your project directory, run the following command:

```bash
npm link trust-storage
```

## jsx Example
```jsx
    import { GoogleDriveStorage } from 'linked-claims-storage';

    const storage = new GoogleDriveStorage('YOUR_ACCESS_TOKEN');
    const folderName = 'USER_UNIQUE_KEY';
    const folderId = await storage.createFolder(folderName);

    const fileData = {
      fileName: 'test.json',
      mimeType: 'application/json',
      body: new Blob([JSON.stringify({ name: 'John Doe' })], {
        type: 'application/json'
      })
    };
    const fileId = await storage.save(fileData, folderId);
```

## Usage
To use the `GoogleDriveStorage` class in your application, you need to pass an access token that has appropriate permissions for Google Drive operations. You can generate an access token by following these steps:

1. Visit the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Enter the scope: `https://www.googleapis.com/auth/drive`.
3. Select your Google account. If your account is not listed in Google-console test users, please contact @0marSalah to have your account added.

The `GoogleDriveStorage` class includes two methods:

- `createFolder()`: This method should be used initially when a user needs to upload a file. It is designed to create a new folder in Google Drive.
- `uploadFile()`: This method is used to upload files to Google Drive. Ensure that the necessary folder has been created or identified where the file will be stored.

## Notes
- This library is a demonstration tool for uploading files to Google Drive.
- Since we are in a test environment, please contact Omar to add your email to the Google Drive project. This step is necessary to ensure you have the required permissions to perform file uploads.
