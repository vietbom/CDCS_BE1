import { generateToken } from "../lib/utils.js"
import Admin from "../models/User/Admin.js"
import bcrypt from "bcryptjs"
import Student from "../models/User/Student.js"
import Card from "../models/Card.js"
export const signUp = async(req, res) => {
    const {MaAD, userName, password, email} = req.body
    try {
        if(!MaAD || !userName || !password || !email){
            return res.status(400).json({message: 'MaAD - userName - password - email là thông tin bắt buộc'})
        }
        if(password.length < 6){
            return res.status(400).json({message: 'password ít nhất phải có 6 kí tự'})
        }
        const existingAdmin = await Admin.findOne({MaAD})
        if(existingAdmin){
            return res.status(400).json({message: 'MaAD đã tồn tại'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newAdmin = new Admin({
            MaAD,
            userName,
            password: hashedPassword,
            email,
        })

        await newAdmin.save()
        generateToken(newAdmin._id, res)
        res.status(201).json({
            _id: newAdmin._id,
            MaAD: newAdmin.MaAD,
            userName: newAdmin.userName,
            email: newAdmin.email,
        })
    } catch (error) {
        console.error("Lỗi trong signUp controller: ", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const login = async(req, res ) => {
    const {MaAD , password} = req.body
    try {
        if(!MaAD || !password){
            return res.status(400).json({message: 'MaAD -  password là thông tin bắt buộc'})
        }

        const admin = await Admin.findOne({MaAD})
        if(!admin){
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" })
        }
        const isPasswordcorrect = await bcrypt.compare(password, admin.password || "")
        if(!isPasswordcorrect){
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" })
        }

        generateToken(admin._id, res)
        res.status(201).json({
            _id: admin._id,
            MaAD: admin.MaAD,
            userName: admin.userName,
            email: admin.email,
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
        if(!req.admin){
            return res.status(401).json({ message: "Unauthorized - User context not found" })
        }
        console.log("BE: checkAuth thành công", req.admin.username || req.admin.email)        
        res.status(200).json(req.admin)
    } catch (error) {
        console.error("Lỗi trong checkAuth controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const getStudent = async(req, res) =>{
    try {
        const students = await Student.find().select('-password')
        res.status(200).json(students)
    } catch (error) {
        console.error("Lỗi trong getStudent controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const findStudent = async(req, res)=>{
    try {
        const {infoUser} = req.body
        console.log('Searching for: ', infoUser)
        if(!infoUser){
            return res.status(400).json({message: "infoUser là thông tin bắt buộc "})
        }
        const filteredStudent = await Student.find({
            $or: [
                {MaSV: {$regex: infoUser, $options: 'i'}},
                {classroom: {$regex: infoUser, $options: 'i'}}
            ]
        })
        res.status(200).json(filteredStudent)
    } catch (error) {
        console.error("Lỗi trong findStudent controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}


export const updateStudent = async(req, res)=>{
    const {_id} = req.params
    const {MaSV, userName, classroom, email, SDT} = req.body
    try {
        const student = await Student.findById(_id)
        if(!student){
            return res.status(404).json({ message: "Không tìm thấy sinh viên " }) 
        }
        student.MaSV = MaSV || student.MaSV
        student.userName = userName || student.userName
        student.classroom = classroom || student.classroom
        student.email = email || student.email
        student.SDT = SDT || student.SDT

        const updatedStudent = await student.save()

        return res.status(200).json({
            message: "Cập nhật thông tin sinh viên thành công",
            updatedStudent
        })
    } catch (error) {
        console.error("Lỗi trong updateStudent controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const delStudent = async(req, res)=>{
    const {_id} = req.params
    try {
        const student = await Student.findById(_id);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }

        const card = await Card.findOne({ MaSV: _id })
        if (card) {
            if (card.status === 'Suspend') {
                return res.status(400).json({ message: 'Không thể xóa sinh viên vì thẻ thư viện đang ở trạng thái Suspend' });
            }
            await Card.deleteOne({ _id: card._id });
        }

        await Student.findByIdAndDelete(_id)

        res.status(200).json({ message: 'Xoá sinh viên thành công ' })
    } catch (error) {
        console.error("Lỗi trong delStudent controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}