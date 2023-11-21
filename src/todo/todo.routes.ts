import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./todo.db";

export const todoRouter = express.Router();
todoRouter.use(express.json());

todoRouter.get("/", async (_req, res) => {
    try {
        const todos = await collections.todos.find({}).toArray();
        res.status(200).send(todos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

todoRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const todo = await collections.todos.findOne(query);

        if (todo) {
            res.status(200).send(todo);
        } else {
            res.status(404).send(`Failed to find an todo: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an todo: ID ${req?.params?.id}`);
    }
});

todoRouter.post("/", async (req, res) => {
    try {
        const todo = req.body;
        const result = await collections.todos.insertOne(todo);

        if (result.acknowledged) {
            res.status(201).send(`Created a new todo: ID ${result.insertedId}.`);
        } else {
            res.status(500).send("Failed to create a new todo.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

todoRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const todo = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.todos.updateOne(query, { $set: todo });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated an todo: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an todo: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an todo: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

todoRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.todos.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed an todo: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an todo: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an todo: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
