import express from "express";
import fs from "fs";
import https from "https";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL certificate paths
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "dist", "cert", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "dist", "cert", "cert.pem")),
};

app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
});
