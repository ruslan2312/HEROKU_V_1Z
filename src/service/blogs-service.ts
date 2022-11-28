import {blogsRepository} from "../repository/blogs-repository";
import {postsRepository} from "../repository/posts-repository";
import {BlogsModel} from "../repository/db";
import {BlogsType, BlogPaginationQueryType} from "../types/blogsType";
import {PostsType, FindPostByIdPaginationQueryType} from "../types/postsType"

export const blogsService = {
    async findBlog(query: BlogPaginationQueryType): Promise<BlogsType[]> {
        return blogsRepository.findBlog(query)
    },
    async findBlogByID(id: string): Promise<BlogsType | null> {
        return  blogsRepository.findBlogByID(id)
    },
    async findBlogAndPostByID(query: FindPostByIdPaginationQueryType, blogId: string): Promise<PostsType[] | any> {
        return await blogsRepository.findBlogByPostId(query, blogId)
    },
    async createBlog(name: string, websiteUrl: string, description: string): Promise<BlogsType> {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: name,
            websiteUrl: websiteUrl,
            description: description,
            createdAt: new Date().toISOString()
        }
        return await blogsRepository.createBlog(newBlog)
    },
    async createPostByBlog(blogId: string, title: string, shortDescription: string, content: string): Promise<PostsType | null> {
        const blogger: BlogsType | null = await BlogsModel.findOne({id: blogId}, {_id: 0})
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
            return await postsRepository.createPost(newPost)
        }
        return null
    },
    async updateBlog(id: string, name: string, websiteUrl: string): Promise<boolean> {
        return await blogsRepository.updateBlog(id, name, websiteUrl)
    },
    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlog(id)
    },
    async deleteAllBlogger(): Promise<boolean> {
        return blogsRepository.deleteAllBlogger()
    },

}