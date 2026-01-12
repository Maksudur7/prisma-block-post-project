import express, { Router } from "express";
import { postController } from "./post.controller";
import Mauth, { UserRole } from "../../middelware/auth";

const router = express.Router();

router.get(
    "/",
    postController.getAllPosts
);

router.get(
    "/stats",
    Mauth(UserRole.ADMIN),
    postController.getStats
);

router.get("/my-posts",
    Mauth(UserRole.USER, UserRole.ADMIN),
    postController.getMyPosts
);

router.post(
    "/",
    Mauth(UserRole.ADMIN,
        UserRole.USER
    ),
    postController.createPost
)

router.patch(
    '/:postId',
    Mauth(UserRole.ADMIN, UserRole.USER),
    postController.updatePost
)

router.get(
    "/:id",
    postController.getPostById
);

router.delete(
    '/:postId'
)

export const postRouter: Router = router;