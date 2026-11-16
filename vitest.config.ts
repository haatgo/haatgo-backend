import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/**/*.test.ts'], env:{QUEUE_MODE:'dummy',MEDIA_PROVIDER:'disabled',CLOUDINARY_CLOUD_NAME:'',CLOUDINARY_UPLOAD_PRESET:''}, testTimeout: 60000, hookTimeout: 180000, fileParallelism: false } });
