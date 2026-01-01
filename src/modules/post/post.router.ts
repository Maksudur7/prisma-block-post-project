import express, { Router } from "express";
import { postController } from "./post.controller";
import Mauth, { UserRole } from "../../middelware/auth";

const router = express.Router();

router.get("/", postController.getAllPosts);

router.post(
    "/",
    Mauth(UserRole.ADMIN),
    postController.createPost
)

export const postRouter: Router = router;