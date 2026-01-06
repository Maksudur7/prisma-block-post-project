import { CommentStatus } from './../../../generated/prisma/enums';
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string;
}) => {
    await prisma.post.findUniqueOrThrow({
        where: { id: payload.postId }
    });

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: { id: payload.parentId }
        });
    }
    const result = await prisma.comment.create({
        data: payload
    })
    return result;
}

const getCommentById = async (commentId: string) => {
    const result = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            post: {
                select: {
                    id: true, title: true, views: true
                }
            },
        }
    });
    return result;
}

const getCommentByAuthor = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                select: {
                    id: true, title: true, views: true
                }
            },
        }
    });
    return result;
}

const deletComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: { id: commentId, authorId },
        select: { id: true }
    })
    if (!commentData) {
        throw new Error('Comment not found or unauthorized');
    }

    const result = await prisma.comment.delete({
        where: { id: commentData.id }
    });
    return result;
}

const updateComment = async (commentId: string, data: { content?: string, status?: CommentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: { id: commentId, authorId },
        select: { id: true }
    })

    if (!commentData) {
        throw new Error('Comment not found or unauthorized');
    }
    const result = await prisma.comment.update({
        where: { id: commentData.id },
        data
    });
    return result;

}

export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deletComment,
    updateComment
};