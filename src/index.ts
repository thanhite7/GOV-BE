import setupServer from "./configs/server.config";

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;

setupServer().then(server => {
  server.listen(PORT, () => console.log(`Server running on ${HOST}:${PORT}`));
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});