import {blogsRepository} from "../repository/blogs-repository";
import {postsRepository} from "../repository/posts-repository";
import {BlogsCollection} from "../repository/db";
import { BlogsResponseType, BlogPaginationQueryType} from "../types/blogsType";
import {PostsResponseType, FindPostByIdPaginationQueryType} from "../types/postsType"

export const blogsService = {
    async findBlog(query: BlogPaginationQueryType): Promise<BlogsResponseType[]> {
        return blogsRepository.findBlog(query)
    },
    async findBlogByID(id: string): Promise<BlogsResponseType | null> {
        return blogsRepository.findBlogByID(id)
    },
    async findBlogAndPostByID(query: FindPostByIdPaginationQueryType, blogId: string): Promise<PostsResponseType[] | any> {
        return await blogsRepository.findBlogByPostId(query, blogId)
    },
    async createBlog(name: string, youtubeUrl: string): Promise<BlogsResponseType> {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: name,
            youtubeUrl: youtubeUrl,
            createdAt: new Date().toISOString()
        }
        return await blogsRepository.createBlog(newBlog)
    },
    async createPostByBlog(blogId: string, title: string, shortDescription: string, content: string): Promise<PostsResponseType | null> {
        const blogger = await BlogsCollection.findOne({id: blogId})
        debugger
        if (blogger) {
            const newPost: PostsResponseType = {
                id: new Date().valueOf().toString(),
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: blogger.name,
                createdAt: new Date().toISOString()
            }
            return await postsRepository.createPost(newPost)
        }
        return null
    },
    async updateBlog(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        return await blogsRepository.updateBlog(id, name, youtubeUrl)
    },
    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlog(id)
    },
    async deleteAllBlogger(): Promise<boolean> {
        return blogsRepository.deleteAllBlogger()
    },

}