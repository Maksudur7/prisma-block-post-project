import { CommentStatus, PostStatus } from './../../../generated/prisma/enums';
import { Payload, PostWhereInput, Result } from './../../../generated/prisma/internal/prismaNamespace';
import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })

    return result;
}

const getPosts = async ({ search, tags, isFeatured, page, limit, skip, sortBy, sortOrder }: { search?: string | undefined, tags: string[] | [], isFeatured?: boolean | undefined, page?: number, limit?: number, skip?: number, sortBy: string, sortOrder: string }): Promise<Post[]> => {
    const andConditions: PostWhereInput[] = [];
    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    content: {
                        contains: search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    tags: {
                        has: search as string
                    }
                }
            ]
        })
    }

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags as string[]
            }
        })
    }

    if (typeof isFeatured === 'boolean') {
        andConditions.push({
            isFeatured: isFeatured
        })
    }

    const posts = await prisma.post.findMany({
        take: limit,
        skip: skip,
        where: {
            AND: andConditions
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: { comments: true }
        }
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    });
    return {
        data: posts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / (limit || 4))
        }
    };
}

const getPostById = async (id: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: { id },
            data: {
                views: {
                    increment: 1
                }
            }
        });
        const postData = await tx.post.findUnique({
            where: { id },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: { createdAt: 'asc' },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: { createdAt: 'asc' },
                                }
                            }
                        },
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        });
        return postData;
    })
    return result;
}

const getMyPosts = async (authorId: string) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: 'ACTIVE'
        },
        select: {
            id: true,
        }
    })
    const result = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    // const total = await prisma.post.aggregate({
    //     _count: {
    //         id: true
    //     },
    //     where: {
    //         authorId
    //     }
    // })

    // return {
    //     data: result,
    //     total
    // }
    return result;
}

const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && (postData?.authorId !== authorId)) {
        throw new Error("You are not the owner/creator of the post!")
    }

    if (!postData) {
        throw new Error("Post not found!");
    }

    if (!isAdmin) {
        delete data.isFeatured
    }

    const Result = await prisma.post.update({
        where: {
            id: postData?.id,
        },
        data
    })

    return Result
}

const deletPost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && (postData?.authorId !== authorId)) {
        throw new Error("You are not the owner/creator of the post!")
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    })
}

const getStats = async ()=>{
return await prisma.$transaction(async (tx) =>{
    const totalPost = await tx.post.count();
    const publishedPosts = await tx.post.count({
        where:{
            status: PostStatus.PUBLISHED
        }
    })
    const draftPost = await tx.post.count({
        where:{
            status: PostStatus.DRAFT
        }
    })
    const archivedPosts = await tx.post.count({
        where:{
            status: PostStatus.ARCHIVED
        }
    })

    return{
        totalPost,
        publishedPosts,
        draftPost,
        archivedPosts
    }
})
}

export const postService = {
    createPost,
    getPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletPost,
    getStats
}