export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://hypixel-notifier-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ... rest of your config
}) 