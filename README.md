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

### Your First Code Contribution

1. Clone the repository.
2. Run yarn or npm install to install dependencies.
3. Create a new branch for your feature or bugfix.
4. Make your changes.
5. Commit your changes and push your branch to your fork.
6. Open a pull request.

### Pull Requests

When you're ready to submit your pull request:

1. Ensure your work is aligned with the project's coding standards.
2. Fill out the pull request template.
3. Include a clear and detailed description of the changes.
4. Link any related issues.
5. Wait for review and address any feedback.

## Development Workflow

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```
2. Navigate to the project directory:
   ```bash
   cd your-repo-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

Certainly! Here is the provided text rewritten in `.md` format:

````markdown
## Publishing Flow

If you want to publish a new version of the package, please follow these steps:

### Request Access

Ask for access to publish the package in the Slack. Mention the version and any significant changes.

### Update Version

Ensure you update the version in `package.json` according to [Semantic Versioning](https://semver.org/). You can do this manually or using the npm command:

```bash
npm version [patch|minor|major]
```
````

### Ensure Tests Pass

Run all tests to make sure they are passing:

```bash
npm test
```

### Build the Project

Build the project to ensure all changes are compiled:

```bash
npm run build
```

### Commit and Push

Commit and push your changes to the main branch:

```bash
git add .
git commit -m "Prepare for release vX.Y.Z"
git push origin main
```

### Login to npm

If you are not already logged in, log in to npm using your credentials:

```bash
npm login
```

### Publish the Package

Once you have access and everything is set, publish the package:

```bash
npm publish
```

### Notify Team

Inform the team in the Slack channel that the new version has been published.
