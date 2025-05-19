import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        MaAD: {
            type: String,
            required: true, 
            unique: true
        },
        userName: {
            type: String,
            required: true 
        },
        password: {
            type: String,
            required: true, 
            minLength: 6
        },
        email:{
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;