import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await commentService.createComment(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const result = await commentService.getCommentById(commentId as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: 'comment fetch failed' });
    }
}

const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params;
        const result = await commentService.getCommentByAuthor(authorId as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: 'comment fetch failed' });
    }
}
const deletComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.deletComment(commentId as string, user?.id as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: 'comment delet failed' });
    }
}

const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: 'comment delet failed' });
    }
}



export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deletComment,
    updateComment
};