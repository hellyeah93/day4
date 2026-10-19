import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // './' is required: Electron loads dist/index.html via file://, where absolute
  // '/assets/...' URLs resolve to the drive root and the app hangs on a blank screen.
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
  server: { host: '0.0.0.0', port: 3000 },
});
