import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import { createHandler } from 'graphql-http/lib/use/express';
import cors from "cors"
import connectDB from "./config/db.js"
import schema from "./schema/schema.js"

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// connect to database
connectDB()

app.use(cors());

app.use('/graphql',createHandler({
    schema,
    context:  (req) => {
         return req.headers.authorization
      },
    
}))


app.listen(port, () => console.log(`server listening on ${port}`));