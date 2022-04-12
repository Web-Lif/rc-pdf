import { defineConfig } from 'dumi';
import { join } from 'path'

export default defineConfig({
    title: 'ms-pdf',
    favicon:
        'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
    logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
    outputPath: 'docs-dist',
    mode: 'site',
    copy: [
        { from: join('node_modules', 'pdfjs-dist', 'build'), to: '/' },
    ]
    // more config: https://d.umijs.org/config
});
