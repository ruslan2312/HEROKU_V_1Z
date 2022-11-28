import {BlogsModel, PostsModel} from "./db";
import { FindPostByIdPaginationQueryType} from "../types/postsType";
import {BlogsType, BlogPaginationQueryType} from "../types/blogsType";
import {PaginationResultType} from "../helpers/paginathion";

export const blogs: BlogsType [] = [];

export const blogsRepository = {
    async findBlog(queryData: BlogPaginationQueryType): Promise<any> {
        let filter: any = {}
        if (queryData.searchNameTerm) {
            filter.name = {$regex: queryData.searchNameTerm, $options: 'i'}
        }
        const totalCount = await BlogsModel.countDocuments({
            name: {
                $regex: queryData.searchNameTerm,
                $options: 'i'
            }
        })
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await BlogsModel.find(filter, {_id: 0, __v:0})
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize).lean() as []
        return {pagesCount, page, pageSize, totalCount, items}
    },
    async findBlogByID(id: string): Promise<BlogsType | null> {
        return BlogsModel.findOne({id: id}, {_id: 0, __v:0});
    },
    async findBlogByPostId(queryData: FindPostByIdPaginationQueryType, blogId: string): Promise<PaginationResultType | null> {
        let filter: any = {}
        if (blogId) {
            filter.blogId = {$regex: blogId, $options: 'i'}
        }
        const totalCount = await PostsModel.countDocuments({
            blogId: {
                $regex: blogId,
                $options: 'i'
            }
        })
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await PostsModel.find({blogId: blogId}, {_id: 0, __v:0})
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize).lean() as []
        if (await PostsModel.findOne({blogId: blogId}) === null) {
            return null
        }
        return Promise.resolve({pagesCount, page, pageSize, totalCount, items})
    },
    async createBlog(newBlog: BlogsType): Promise<BlogsType> {
        await BlogsModel.insertMany([{...newBlog}]);
        return newBlog
    },
    async updateBlog(id: string, name: string, websiteUrl: string): Promise<boolean> {
        const result = await BlogsModel.updateOne({id: id}, {$set: {name: name, websiteUrl: websiteUrl}})
        return result.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await BlogsModel.deleteOne({id: id})
        return result.deletedCount === 1
    },
    async deleteAllBlogger(): Promise<boolean> {
        const result = await BlogsModel.deleteMany({})
        return result.deletedCount === 1
    },

}