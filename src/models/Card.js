import mongoose from "mongoose"

const cardSchema = new mongoose.Schema(
    {
        MaThe: {
            type: String,
            required: true,
            unique: true,
        },
        MaSV: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        ngayCap: {
            type: Date,
            default: Date.now
        },
        ngayHetHan: {
            type: Date,
            required: true,

        },
        status: {
            type: String,
            enum: ['Active', 'Overdue', 'Suspend'],
            default: 'Active'
        }
    },
    {
        timestamps: true,
    }
)

cardSchema.index({ MaSV: 1 });
cardSchema.index({ status: 1 });

const Card = mongoose.model("Card", cardSchema)
export default Card

