import { Request, Response } from "express";
import { postService } from "./post.service";
import pageinationSortingHelper from "../../helpers/paginationSortingHelper";

const createPost = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(req.user);
        const result = await postService.createPost(req.body, req.user?.id as string);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: "Failed to create post", details: error });
    }
}

const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        console.log(search);
        const searchString = typeof search === 'string' ? search : undefined;
        const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
        const isFeatured = req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined;
        const page = Number(req.query.page ?? 1);
        const { limit, skip, sortBy, sortOrder } = pageinationSortingHelper(req.query);
        const posts = await postService.getPosts({ search: searchString, tags, isFeatured, page, limit, skip, sortBy, sortOrder });
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).json({ error: "Failed to fetch posts", details: error });
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: "Post ID is required" });
        }
        const result = await postService.getPostById(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: "Failed to fetch post", details: error });
    }
}

export const postController = {
    createPost,
    getAllPosts,
    getPostById
}