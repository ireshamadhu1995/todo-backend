import * as mongodb from "mongodb";

export interface Todo {
    title: string;
    description: string;
    status:boolean;
    _id?: mongodb.ObjectId;
}
