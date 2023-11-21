import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./todo/todo.db";
import { todoRouter } from "./todo/todo.routes";

dotenv.config();

const { MONG_URL } = process.env;

if (!MONG_URL) {
    console.error("No MONG_URL environment variable has been defined in config.env");
    process.exit(1);
}

connectToDatabase(MONG_URL)
    .then(() => {
        const app = express();
        app.use(cors());
        app.use("/todos", todoRouter);

        // start the Express server
        app.listen(5200, () => {
            console.log(`Server running at http://localhost:5200...`);
        });

    })
    .catch(error => console.error(error));
