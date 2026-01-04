import { Payload, PostWhereInput } from './../../../generated/prisma/internal/prismaNamespace';
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
            where: { id }
        });
        return postData;
    })
    return result;
}
export const postService = {
    createPost,
    getPosts,
    getPostById
}