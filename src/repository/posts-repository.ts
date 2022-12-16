import {CommentsModel, LikesModel, PostsModel} from "./db";
import {
    PostPaginationQueryType,
    PostsType
} from "../types/postsType";
import {paginationResult, PaginationResultType} from "../helpers/paginathion";

export const posts: PostsType [] = [];


export const postsRepository = {
    async findPosts(queryData: PostPaginationQueryType, userId: string | null): Promise<PaginationResultType> {
        const objectSort = {[queryData.sortBy]: queryData.sortDirection}
        const totalCount = await PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const posts = await PostsModel.aggregate([
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
                    "extendedLikesInfo.likesCount": "$likesCount",
                    "extendedLikesInfo.dislikesCount": "$dislikesCount",
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
        // const totalCount = await PostsModel.countDocuments({})
        // const page = Number(queryData.pageNumber)
        // const pageSize = Number(queryData.pageSize)
        // const items = await PostsModel.find({}, {_id: 0, __v: 0})
        //     .sort([[queryData.sortBy, queryData.sortDirection]])
        //     .skip((page - 1) * pageSize)
        //     .limit(pageSize)
        //     .lean() as []
        return paginationResult(page, pageSize, totalCount, posts)
    },
    async findPostByID(postId: string): Promise<PostsType | null> {
        return PostsModel.findOne({id: postId}, {_id: 0, __v: 0}).lean();
    },
    async deletePost(id: string): Promise<boolean> {
        const result = await PostsModel.deleteOne({id: id})
        return result.deletedCount === 1
    },
    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        const result = await PostsModel.updateOne({id: id}, {
            $set: {
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId
            }
        })
        return result.matchedCount === 1
    },
    async createPost(newPost: PostsType): Promise<PostsType> {
        await PostsModel.insertMany([newPost]);
        return newPost
    },
    async deleteAllPosts(): Promise<boolean> {
        const result = await PostsModel.deleteMany({})
        return result.deletedCount === 1
    },
    async createLikeByPost(postId: string, userId: string, likeStatus: string, login: string, createdAt: string) {
        await LikesModel.updateOne({parentId: postId, userId: userId}, {
            status: likeStatus,
            login: login,
            createdAt: createdAt
        }, {upsert: true});
        const likesCount = await LikesModel.countDocuments({parentId: postId, status: "Like"})
        const dislikesCount = await LikesModel.countDocuments({parentId: postId, status: "Dislike"})
        await PostsModel.updateOne({id: postId}, {
            "extendedLikesInfo.likesCount": likesCount,
            "extendedLikesInfo.dislikesCount": dislikesCount
        })
        return true
    }
}