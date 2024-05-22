# Trust Storage Library
Store your files using up to three strategies. Currently, we offer the GoogleDriveStorage class, which is designed for storing files in Google Drive. Stay tuned for additional methods coming soon 😊

## Installation
To install the Trust Storage library, you can use either npm or yarn. Run one of the following commands in your project directory:

```bash
npm install trust_storage
```
or
```bash
yarn add trust_storage
```

## Usage
To use the `GoogleDriveStorage` class in your application, you need to pass an access token that has appropriate permissions for Google Drive operations. You can generate an access token by following these steps:

1. Visit the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Enter the scope: `https://www.googleapis.com/auth/drive`.
3. Copy the accessToken and pass it to the `GoogleDriveStorage` class.


The `GoogleDriveStorage` class includes two methods:

- `createFolder()`: It is designed to create a new folder in Google Drive.
- `uploadFile()`: Ensure that the necessary folder has been created or identified where the file will be stored.

## Notes
- This library is a demonstration tool for uploading files to Google Drive.
