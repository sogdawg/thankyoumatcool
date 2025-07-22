import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    // Change this line:
    base: '/thankyoumatcool/', // <-- Make sure this matches your repository name with leading/trailing slashes
    build: {
        outDir: 'docs', // Or 'dist' if you switched back to that
        assetsDir: 'assets',
    },
});
