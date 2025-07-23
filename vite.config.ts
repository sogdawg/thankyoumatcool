// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/thankyoumatcool/',
    build: {
        outDir: 'docs',
        assetsDir: 'assets',
        // --- NEW: Explicitly define main.css as an entry point ---
        rollupOptions: {
            input: {
                main: './index.html', // Your main HTML entry
                style: './src/main.css', // Explicitly include your CSS file
            },
        },
    },
});
