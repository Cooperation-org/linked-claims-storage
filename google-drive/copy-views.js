import { ensureDir, copy } from 'fs-extra';
import { join } from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

const srcDir = join(__dirname, 'src', 'views');
const destDir = join(__dirname, 'dist', 'views');

// Ensure the destination directory exists; if not, copy from source
ensureDir(destDir)
  .then(() => {
    copy(srcDir, destDir)
      .then(() => console.log('Views directory copied to dist.'))
      .catch(err => console.error('Error copying views directory:', err));
  })
  .catch(err => console.error('Error ensuring directory exists:', err));
