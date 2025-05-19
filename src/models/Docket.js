import mongoose from "mongoose";

const docketSchema  = new mongoose.Schema(
    {
        IdDocket:{
            type: String,
            required: true,
            unique: true  
        },
        books: [
            {
                IdBook: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Book',
                    required: true
                },
                soLuongMuon: {
                    type: Number,
                    required: true,
                    min: 1
                },
            }
        ],
        MaThe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Card',
            required: true
        },
        ngayMuon: {
            type: Date,
            required: true
        },
        ngayHenTra: {
            type: Date,
            required: true
        },
        ngayTra: {
            type: Date,
            required: false
        },
        status: {
            type: String,
            enum: ['active', 'overdue', 'returned'],
            default: 'active'  
        },

    }
)

const Docket = mongoose.model("Docket", docketSchema)
export default Docket