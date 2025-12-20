
import http, { Server } from "http";
import app from "./app";
import config from "./app/config";

import { connectRedis } from "./app/config/redis.config";

async function bootstrap() {
    let server: Server;

    try {
        await connectRedis()

        // *  socket io ------------------
        server = http.createServer(app);
        // * Initialize Socket.IO
      


        server.listen(config.port, () => {
            console.log(`🚀 Server is running on http://localhost:${config.port}`);
        });

        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.log("Server closed gracefully.");
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        };

        process.on("unhandledRejection", (error) => {
            console.log("Unhandled Rejection detected, shutting down...");
            console.error(error);
            exitHandler();
        });

        process.on("SIGTERM", exitHandler);
        process.on("SIGINT", exitHandler);

    } catch (error) {
        console.error("Error during server startup:", error);
        process.exit(1);
    }
}

bootstrap();
