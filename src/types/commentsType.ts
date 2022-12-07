import mongoose from "mongoose";

export type CommentsResponseType = {
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string
    }
    createdAt: string
}
export type CommentsType = {
    id: string,
    parentId: string
    content: string,
    userId: string,
    userLogin: string,
    likesInfo: {
        "likesCount": number,
        "dislikesCount": number,
        "myStatus": string
    },
    createdAt: string
}

export type LikesType = {
    userId: string,
    parentId: string,
    status: 'None' | 'Like' | 'Dislike'
}

export type  CommentsPaginationQueryType = {
    content?: string
    postId: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}

export const newCommentsScheme = new mongoose.Schema({
    id: String,
    parentId: String,
    content: String,
    userId: String,
    userLogin: String,
    createdAt: String,
    likesInfo: {
        likesCount: { type: Number, required: true},
        dislikesCount: { type: Number, required: true},
        myStatus: { type: String, required: true},
    }
})

export const likesSchema = new mongoose.Schema({
    userId: String,
    status: String,
    parentId: String
})