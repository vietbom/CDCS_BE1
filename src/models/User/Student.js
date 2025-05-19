import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        MaSV: {
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
        classroom:{
            type: String,
            required: false
        },
        SDT:{
            type: String,
            required: false
        },
        email:{
            type: String,
            required: false
        },
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;