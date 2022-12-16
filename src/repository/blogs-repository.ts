import {BlogsModel, PostsModel} from "./db";
import {FindPostByIdPaginationQueryType} from "../types/postsType";
import {BlogsType, BlogPaginationQueryType} from "../types/blogsType";
import {paginationResult, PaginationResultType} from "../helpers/paginathion";

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
        const items = await BlogsModel.find(filter, {_id: 0, __v: 0})
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize).lean() as []
        return {pagesCount, page, pageSize, totalCount, items}
    },
    async findBlogByID(id: string): Promise<BlogsType | null> {
        return BlogsModel.findOne({id: id}, {_id: 0, __v: 0});
    },
    async findBlogByPostId(queryData: FindPostByIdPaginationQueryType, blogId: string, userId: string): Promise<PaginationResultType | null> {
        const objectSort = {[queryData.sortBy]: queryData.sortDirection}
        const totalCount = await PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const posts = await PostsModel.aggregate([
            {$match: {blogId: blogId}},
            {
                $lookup: {
                    from: "likes",
                    localField: "id",
                    foreignField: "parentId",
                    pipeline: [{
                        $match: {"userId": userId}
                    }, {
                        $project: {_id: 0, "status": 1}
                    }],
                    as: "myStatus"
                }
            }, {
                $lookup: {
                    from: "likes",
                    localField: "id",
                    foreignField: "parentId",
                    pipeline: [{
                        $match: {
                            "status": "Like"
                        },
                    }, {
                        $sort: {
                            "createdAt": -1
                        },
                    }, {
                        $limit: 3
                    }, {
                        $project: {
                            addedAt: '$createdAt',
                            login: 1,
                            userId: 1,
                            _id: 0
                        }
                    }],
                    as: "newestLikes"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    "title": 1,
                    "shortDescription": 1,
                    "content": 1,
                    "blogId": 1,
                    "blogName": 1,
                    "createdAt": 1,
                    "extendedLikesInfo.likesCount": 1,
                    "extendedLikesInfo.dislikesCount": 1,
                    "extendedLikesInfo.myStatus": {
                        $cond: {
                            if: {$eq: [{$size: "$myStatus"}, 0]},
                            then: "None",
                            else: "$myStatus.status"
                        }
                    },
                    "extendedLikesInfo.newestLikes": "$newestLikes"
                }
            }, {$unwind: "$extendedLikesInfo.myStatus"}])
            .sort(objectSort)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
        return paginationResult(page, pageSize, totalCount, posts)
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