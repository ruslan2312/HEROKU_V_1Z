import {CommentsPaginationQueryType, CommentsResponseType, CommentsType} from "../types/commentsType";
import {CommentsModel, LikesModel} from "./db";
import {Filter} from "mongodb";
import {PaginationResultType} from "../helpers/paginathion";

export const commentsRepository = {
    async findCommentsByID(id: string, userId: number | string): Promise<CommentsResponseType | null> {
        const items = await CommentsModel
            .aggregate([
                {$match: {id: id}},
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Like',
                                },
                            },
                            {$count: 'count'},
                        ],
                        as: 'likesCount',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Dislike',
                                },
                            },
                            {
                                $count: 'count',
                            },
                        ],
                        as: 'dislikesCount',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {userId: userId},
                            },
                            {
                                $project: {_id: 0, status: 1},
                            },
                        ],
                        as: 'myStatus',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        content: 1,
                        userId: 1,
                        userLogin: 1,
                        createdAt: 1,
                        'likesInfo.likesCount': {
                            $cond: {
                                if: {$eq: [{$size: "$likesCount"}, 0]},
                                then: 0,
                                else: "$likesCount.count"
                            }
                        },
                        'likesInfo.dislikesCount': {
                            $cond: {
                                if: {$eq: [{$size: "$dislikesCount"}, 0]},
                                then: 0,
                                else: "$dislikesCount.count"
                            }
                        },
                        'likesInfo.myStatus': {
                            $cond: {
                                if: {$eq: [{$size: "$myStatus"}, 0]},
                                then: "None",
                                else: "$myStatus.status"
                            }
                        },
                    },
                },
                {$unwind: "$likesInfo.likesCount"},
                {$unwind: "$likesInfo.dislikesCount"},
                {$unwind: "$likesInfo.myStatus"}
            ])
        console.log(items[0])
        return items[0]
    },
    async updateComments(commentId: string, content: string, userId: string): Promise<boolean | null> {
        try {
            const result = await CommentsModel.updateOne({id: commentId, userId}, {$set: {content}})
            return result.modifiedCount === 1
        } catch (e) {
            return null
        }
    },
    async deleteComment(id: string): Promise<boolean | null> {
        try {
            const result = await CommentsModel.deleteOne({id})
            return result.deletedCount === 1
        } catch (error) {
            return null
        }
    },
    async deleteAllComments() {
        return CommentsModel.deleteMany({})
    },
    async findCommentsByPostId(queryData: CommentsPaginationQueryType, postId: string, userId: string | number): Promise<PaginationResultType | null> {
        const filter: Filter<CommentsType> = {parentId: postId}
        const objectSort = {[queryData.sortBy]: queryData.sortDirection}
        const totalCount = await CommentsModel.countDocuments({parentId: postId});
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize))
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const items = await CommentsModel
            .aggregate([
                {$match: {parentId: postId}},
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Like',
                                },
                            },
                            {$count: 'count'},
                        ],
                        as: 'likesCount',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Dislike',
                                },
                            },
                            {
                                $count: 'count',
                            },
                        ],
                        as: 'dislikesCount',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {userId: userId},
                            },
                            {
                                $project: {_id: 0, status: 1},
                            },
                        ],
                        as: 'myStatus',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        content: 1,
                        userId: 1,
                        userLogin: 1,
                        createdAt: 1,
                        'likesInfo.likesCount': {
                            $cond: {
                                if: {$eq: [{$size: "$likesCount"}, 0]},
                                then: 0,
                                else: "$likesCount.count"
                            }
                        },
                        'likesInfo.dislikesCount': {
                            $cond: {
                                if: {$eq: [{$size: "$dislikesCount"}, 0]},
                                then: 0,
                                else: "$dislikesCount.count"
                            }
                        },
                        'likesInfo.myStatus': {
                            $cond: {
                                if: {$eq: [{$size: "$myStatus"}, 0]},
                                then: "None",
                                else: "$myStatus.status"
                            }
                        },
                    },
                },
                {$unwind: "$likesInfo.likesCount"},
                {$unwind: "$likesInfo.dislikesCount"},
                {$unwind: "$likesInfo.myStatus"}
            ])
            .sort(objectSort)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
        return ({pagesCount, page, pageSize, totalCount, items,})
    }
    ,
    async createComment(newComment: CommentsType): Promise<boolean | null> {
        try {
            const createdComment = await CommentsModel.insertMany([newComment]);
            if (!createdComment) return null
            return true
        } catch (e) {
            return null
        }
    },
    async createLikeByComment(commentId: string, userId: string, likeStatus: string) {
        return LikesModel.updateOne({parentId: commentId, userId: userId}, {status: likeStatus}, {upsert: true});
    },
    async deleteAllLike() {
        return LikesModel.deleteMany({})
    }
}

