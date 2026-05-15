import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const conn = await connectDB();
    console.log("Db connected to host: " + conn.connection.host);
    
    const server = http.createServer(app);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();