// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/thankyoumatcool/', // This must match your GitHub repository name
    build: {
        outDir: 'docs', // This must match the folder GitHub Pages is serving from
        assetsDir: 'assets',
    },
});
