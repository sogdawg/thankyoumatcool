import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev.config/
export default defineConfig({
    plugins: [vue()],
    base: './', // Keep this, it's good for GitHub Pages
    build: {
        outDir: 'docs', // <--- ADD THIS LINE
        assetsDir: 'assets',
    },
});
