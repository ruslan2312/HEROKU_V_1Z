import {postsRepository} from "../repository/posts-repository";
import {
    PostPaginationQueryType,
    PostsType,
} from "../types/postsType";
import {blogsService} from "./blogs-service";
import {PaginationResultType} from "../helpers/paginathion";

export const postsService = {
    async findPosts(query: PostPaginationQueryType): Promise<PaginationResultType> {
        return await postsRepository.findPost(query)
    },
    async findPostByID(id: string): Promise<PostsType | null> {
        return postsRepository.findPostByID(id)
    },
    async deletePost(id: string): Promise<boolean> {
        return await postsRepository.deletePost(id)
    },
    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        return await postsRepository.updatePost(id, title, shortDescription, content, blogId)
    },
    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostsType | null> {
        const blogger = await blogsService.findBlogByID(blogId)
        if (!blogger) return null
        if (blogger) {
            const newPost: PostsType = {
                id: new Date().valueOf().toString(),
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: blogger.name,
                createdAt: new Date().toISOString()
            }
            await postsRepository.createPost({...newPost})
            console.log(newPost)
            return newPost
        }
        return null
    },
    async deleteAllPosts(): Promise<boolean> {
        return postsRepository.deleteAllPosts()
    },

}
