import { Router } from 'express';
import { commentController } from './comment.controller';
import { auth } from '../../lib/auth';
import { UserRole } from '../../middelware/auth';

const router = Router();

router.get(
    '/:commentId',
    commentController.getCommentById
);

router.get(
    '/author/:authorId',
    commentController.getCommentByAuthor
);


router.post(
    '/',
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.createComment
);

router.delete(
    '/:commentId',
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.deletComment
);

router.patch(
    '/:commentId',
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.updateComment
);

export const commentRouter: Router = router;