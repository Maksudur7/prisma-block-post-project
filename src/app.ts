import express, { Application } from 'express';
import { postRouter } from './modules/post/post.router';
import { auth } from './lib/auth';
import { toNodeHandler } from "better-auth/node";
import cors from "cors"
import { commentRouter } from './modules/comment/comment.router';
import errorHandler from './middelware/globalErrorHandler';
import { notFound } from './middelware/notFound';

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use(notFound)
app.use(errorHandler)
export default app;