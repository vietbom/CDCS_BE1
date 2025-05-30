import Student from "../models/User/Student.js"
import { generateToken } from "../lib/utils.js"
import bcrypt from "bcryptjs"
import Card from "../models/Card.js"


export const addStudent = async (req, res) => {
    const { MaSV, userName, password, classroom, SDT, email } = req.body
    try {
        if (!MaSV || !userName || !email || !password) {
            return res.status(400).json({ message: 'MaSV - userName - password - email là thông tin bắt buộc' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'password ít nhất phải có 6 kí tự' })
        }

        const existingStudent = await Student.findOne({ MaSV })
        if (existingStudent) {
            return res.status(400).json({ message: 'MaSV đã tồn tại' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newStudent = new Student({
            MaSV,
            userName,
            password: hashedPassword,
            email,
            classroom,
            SDT
        })
        await newStudent.save()

        const existingCard = await Card.findOne({ MaThe: MaSV })
        if (!existingCard) {
            const ngayCap = new Date()
            const ngayHetHan = new Date()
            ngayHetHan.setMonth(ngayHetHan.getMonth() + 6) 

            const newCard = new Card({
                MaThe: MaSV,
                MaSV: newStudent._id,
                ngayCap: ngayCap,
                ngayHetHan: ngayHetHan,
                status: 'Active'
            })
            await newCard.save()
        }

        generateToken(newStudent._id, res)

        res.status(201).json({
            _id: newStudent._id,
            MaSV: newStudent.MaSV,
            userName: newStudent.userName,
            email: newStudent.email,
            classroom: newStudent.classroom,
            SDT: newStudent.SDT
        })

    } catch (error) {
        console.error("Lỗi trong addStudent:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}


export const login = async(req, res ) => {
    const {email , password} = req.body
    try {
        if(!email || !password){
            return res.status(400).json({message: 'Email -  password là thông tin bắt buộc'})
        }

        const student = await Student.findOne({email})
        if(!student){
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" })
        }
        const isPasswordcorrect = await bcrypt.compare(password, student.password || "")
        if(!isPasswordcorrect){
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" })
        }

        generateToken(student._id, res)
        res.status(201).json({
            _id: student._id,
            MaSV: student.MaSV,
            userName: student.userName,
            email: student.email,
            classroom: student.classroom,
            SDT: student.SDT
        })
    } catch (error) {
        console.error("Lỗi trong login controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const logout = async(req, res ) => {
    try {
        const isDevelopment = process.env.NODE_ENV === 'development'
        res.cookie('jwt','', {
            maxAge: 0,
            httpOnly: true,
            // sameSite: 'Lax',
            sameSite: 'None',
            secure: !isDevelopment,
            path: '/'
        })
        return res.status(200).json({ message: "Đăng xuất thành công" })
    } catch (error) {
        console.error("Lỗi trong logout controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const checkAuth  = async(req, res ) => {
    try {
        if(!req.student){
            return res.status(401).json({ message: "Unauthorized - User context not found" })
        }
        res.status(200).json(req.student)
    } catch (error) {
        console.error("Lỗi trong checkAuth controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}


