import setupServer from "./configs/server.config";

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;

setupServer().then(server => {
  const appServer = server.listen(PORT, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });

  process.on('unhandledRejection', (err: any) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('Error:', err.name, err.message);
    appServer.close(() => {
      process.exit(1);
    });
  });

}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});