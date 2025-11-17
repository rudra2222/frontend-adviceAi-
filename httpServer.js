import express from "express";
import http from "http";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Create HTTPS server
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
