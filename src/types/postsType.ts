import mongoose from "mongoose";

export type NewestLikesType = {
    addedAt: string,
    userId: string,
    login: string
}

export type PostsType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes: NewestLikesType[]
    }
}
export type PostPaginationQueryType = {
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}
export type FindPostByIdPaginationQueryType = {
    blogId: string,
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}

const newestLikesSchema = new mongoose.Schema<NewestLikesType>({
    addedAt: {type: String},
    userId: {type: String},
    login: {type: String}
})

export const newPostsScheme = new mongoose.Schema<PostsType>({
    id: {type: String},
    title: {type: String},
    shortDescription: {type: String},
    content: {type: String},
    blogId: {type: String},
    blogName: {type: String},
    createdAt: {type: String},
    extendedLikesInfo: {
        likesCount: {type: Number},
        dislikesCount: {type: Number},
        myStatus: {type: String},
        newestLikes: {type: [newestLikesSchema]}
    }
})