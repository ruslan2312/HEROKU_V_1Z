import {BlogsCollection, PostsCollection} from "./db";
import {PostsType, FindPostByIdPaginationQueryType} from "../types/postsType";
import {BlogsType, BlogPaginationQueryType} from "../types/blogsType";
import {PaginationResultType} from "../helpers/paginathion";

export const blogs: BlogsType [] = [];

export const blogsRepository = {
    async findBlog(queryData: BlogPaginationQueryType): Promise<any> {
        let filter: any = {}
        if (queryData.searchNameTerm) {
            filter.name = {$regex: queryData.searchNameTerm, $options: 'i'}
        }
        const totalCount = await BlogsCollection.countDocuments({
            name: {
                $regex: queryData.searchNameTerm,
                $options: 'i'
            }
        })
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await BlogsCollection.find(filter, {projection: {_id: 0}})
            .sort(queryData.sortBy, queryData.sortDirection)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        return Promise.resolve({pagesCount, page, pageSize, totalCount, items,})
    },
    async findBlogByID(id: string): Promise<BlogsType | null> {
        return await BlogsCollection.findOne({id: id}, {projection: {_id: 0}});
    },
    async findBlogByPostId(queryData: FindPostByIdPaginationQueryType, blogId: string): Promise<PaginationResultType | null> {
        let filter: any = {}
        if (blogId) {
            filter.blogId = {$regex: blogId, $options: 'i'}
        }
        const totalCount = await PostsCollection.countDocuments({
            blogId: {
                $regex: blogId,
                $options: 'i'
            }
        })
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await PostsCollection.find({blogId: blogId}, {projection: {_id: 0}})
            .sort(queryData.sortBy, queryData.sortDirection)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        if (await PostsCollection.findOne({blogId: blogId}) === null) {
            return null
        }
        return Promise.resolve({pagesCount, page, pageSize, totalCount, items})
    },
    async createBlog(newBlog: BlogsType): Promise<BlogsType> {
        await BlogsCollection.insertOne({...newBlog});
        return newBlog
    },
    async createPostByBlog(newPost: PostsType): Promise<PostsType> {
        await PostsCollection.insertOne({...newPost});
        return newPost
    },
    async updateBlog(id: string, name: string, websiteUrl: string): Promise<boolean> {
        const result = await BlogsCollection.updateOne({id: id}, {$set: {name: name, websiteUrl: websiteUrl}})
        return result.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await BlogsCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },
    async deleteAllBlogger(): Promise<boolean> {
        const result = await BlogsCollection.deleteMany({})
        return result.deletedCount === 1
    },

}