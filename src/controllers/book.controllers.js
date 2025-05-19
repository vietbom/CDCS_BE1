import Book from "../models/Book.js"

export const addBook = async(req , res )=>{
    const {IdBook, bookName, description, author, NXB, soLuong, pdfUrl } = req.body
    try {
        if(!IdBook || !bookName || !author || !soLuong){
            return res.status(400).json({message: 'IdBook - bookName - author  soLuong là thông tin bắt buộc'})
        }

        const existingBook = await Book.findOne({IdBook: IdBook})
        if(existingBook){
            return res.status(400).json({message: 'IdBook đã tồn tại '})

        }
        const newBook = new Book({
            IdBook,
            bookName,
            description,
            author,
            NXB,
            soLuong,
            soLuongCon: soLuong,
            pdfUrl,
        })
        await newBook.save()
        if (newBook) {
            res.status(201).json({
                id: newBook._id,
                IdBook: newBook.IdBook,
                bookName: newBook.bookName,
                description: newBook.description,
                author: newBook.author,
                NXB: newBook.NXB,
                soLuong: newBook.soLuong,
                soLuongCon: newBook.soLuongCon,
                pdfUrl: newBook.pdfUrl
            })
        } else {
            res.status(400).json({ message: "Invalid book data" })
        }
    } catch (error) {
        console.error("Lỗi trong signUp controller: ", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const getBook = async (req, res) => {
    try {
        const filteredBook = await Book.find()
        res.status(200).json(filteredBook)
    } catch (error) {
        console.error("Lỗi trong signUp controller: ", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const searchBook = async (req, res) => {
    const {infoBook} = req.body
    try {
        if(!infoBook){
            return res.status(400).json({message: "infoBook là thông tin bắt buộc "})
        }
        const filteredBook = await Book.find({
            $or: [
                {IdBook: {$regex: infoBook, $options: 'i'} },
                {bookName: {$regex: infoBook, $options: 'i'} },
                {author: {$regex: infoBook, $options: 'i'} },
            ]
        })
        res.status(200).json(filteredBook)
    } catch (error) {
        console.error("Lỗi trong searchBook controller: ", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const updateBook = async (req, res) => {
    const {_id} = req.params
    const {IdBook, bookName, description, author, NXB, soLuong,  pdfUrl } = req.body
    try {
        const book = await Book.findById(_id)
        if(!book){
            return res.status(400).json({message: "Không tìm thấy sách trên hệ thống "})
        }

        const soLuongDaMuon = book.soLuong - book.soLuongCon
        if(soLuong < soLuongDaMuon){
            return console.error('Số lượng sách nhập vào không hợp lệ ')
        }
        book.IdBook = IdBook || book.IdBook
        book.bookName = bookName || book.bookName
        book.description = description || book.description
        book.author = author || book.author
        book.NXB = NXB || book.NXB
        book.soLuong = soLuong || book.soLuong
        book.soLuongCon = soLuong - soLuongDaMuon || book.soLuongCon
        book.pdfUrl = pdfUrl || book.pdfUrl

        const updatedBook = await book.save()
        return res.status(200).json({
            message: "Cập nhật thông tin sinh viên thành công",
            updatedBook
        })

    } catch (error) {
        console.error("Lỗi trong updateBook controller: ", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const deleteBook = async (req, res) => {
  try {
    const { _id } = req.params
    const result = await Book.findByIdAndDelete(_id)
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy sách trên hệ thống' })
    }
    res.status(200).json({ message: 'Xóa sách thành công' })

  } catch (error) {
    console.error('Lỗi trong deletebook controller:', error)
    res.status(500).json({ message: 'Lỗi Máy Chủ Nội Bộ' })
  }
}

import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getPDF = async (req, res) => {
    const {fileName} = req.params
    console.log('FileName: ', fileName)
    const pdfPath = path.join(__dirname, '..', 'TaiLieu', fileName)

    try {
        res.sendFile(pdfPath)
    } catch (error) {
        console.error('Error sending PDF:', error)
        res.status(500).json({ message: 'Error sending PDF' })
    }
}