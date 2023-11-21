import * as mongodb from "mongodb";
import { Todo } from "./todo.interface";
import { Collection, IndexSpecification } from 'mongodb';

export const collections: {
    todos?: mongodb.Collection<Todo>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("todoApp");
    await applySchemaValidation(db);

    const todosCollection = db.collection<Todo>("todos");
    collections.todos = todosCollection;
}

async function applySchemaValidation(db: mongodb.Db) {
    const collection: Collection = db.collection('todos');

    // Create a unique index on the "title" field
    const indexSpec: IndexSpecification = { title: 1 };
    const options = { unique: true };

    await collection.createIndex(indexSpec, options);
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "description", "status"],
            additionalProperties: false,
            properties: {
                _id: {},
                title: {
                    bsonType: "string",
                    description: "'title' is required and is a string",
                    unique: true,
                },
                description: {
                    bsonType: "string",
                    description: "'description' is required and is a string",
                    minLength: 5
                },
                status: {
                    bsonType: "boolean",
                    description: "status is required and default value is false(pending), true for completed",
                },
            },
        },
    };

   await db.command({
        collMod: "todos",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("todos", {validator: jsonSchema});
        }
    });
}
