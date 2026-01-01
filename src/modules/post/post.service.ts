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

const getPosts = async (Payload: { search?: string | undefined, tags: string[] | [], isFeatured?: boolean | undefined }): Promise<Post[]> => {
    const andConditions: PostWhereInput[] = [];
    if (Payload.search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: Payload.search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    content: {
                        contains: Payload.search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    tags: {
                        has: Payload.search as string
                    }
                }
            ]
        })
    }

    if (Payload.tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: Payload.tags as string[]
            }
        })
    }

    if (typeof Payload.isFeatured === 'boolean') {
        andConditions.push({
            isFeatured: Payload.isFeatured
        })
    }

    const posts = await prisma.post.findMany({
        where: {
            AND: andConditions
        }
    });
    return posts;
}
export const postService = {
    createPost,
    getPosts
}