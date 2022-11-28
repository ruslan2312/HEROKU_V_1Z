import mongoose from "mongoose";


export const newReqScheme = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    ip: String,
    url: String,
    date: String
})