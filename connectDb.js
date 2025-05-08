import mongoose from "mongoose";

export async function connectDb(URL){
    return mongoose.connect(URL);
}