import mongoose from "mongoose";

export type BlogsType = {
    id: string,
    name: string,
    websiteUrl: string,
    description: string,
    createdAt: string;
}
export type BlogPaginationQueryType = {
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc"; //todo Enum
}
export const newBloggersScheme = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    description: String,
    createdAt: {type: String, required: true},
})
