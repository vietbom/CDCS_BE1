import Docket from "../models/Docket.js"
import Card from "../models/Card.js"
import Book from "../models/Book.js"
import Student from "../models/User/Student.js"

const formatDocketResponse = (docket) => {
  if (!docket) return null
  return {
    _id: docket._id,
    IdDocket: docket.IdDocket,
    books: docket.books.map(b => ({
      _id: b.IdBook?._id,
      IdBook: b.IdBook?.IdBook || '',
      bookName: b.IdBook?.bookName || '',
      soLuongMuon: b.soLuongMuon
    })),
    MaThe: docket.MaThe?.MaThe || '',
    student: {
      _id: docket.MaThe?.MaSV?._id,
      MaSV: docket.MaThe?.MaSV?.MaSV || '',
      userName: docket.MaThe?.MaSV?.userName || ''
    },
    ngayMuon: docket.ngayMuon,
    ngayHenTra: docket.ngayHenTra,
    ngayTra: docket.ngayTra,
    status: docket.status
  }
}

export const createDocket = async (req, res) => {
  const { IdDocket: IdDocketClient, MaThe, books, ngayHenTra } = req.body

  try {
    if (!MaThe || !Array.isArray(books) || books.length === 0 || !ngayHenTra) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' })
    }

    const card = await Card.findOne({ MaThe })
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ thư viện' })
    }

    if (card.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Thẻ không đủ điều kiện mượn sách' })
    }

    const ngayHenTraSach = new Date(ngayHenTra)
    if (isNaN(ngayHenTraSach.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày hẹn trả không hợp lệ' })
    }

    const bookList = []
    for (const item of books) {
      if (!item.IdBook || !item.soLuongMuon || item.soLuongMuon <= 0) {
        return res.status(400).json({ success: false, message: `Thông tin sách không hợp lệ: ${item.IdBook}` })
      }
      const bookDoc = await Book.findOne({ IdBook: item.IdBook })
      if (!bookDoc) {
        return res.status(404).json({ success: false, message: `Không tìm thấy sách mã ${item.IdBook}` })
      }
      if (bookDoc.soLuongCon < item.soLuongMuon) {
        return res.status(400).json({ success: false, message: `Sách mã ${item.IdBook} không đủ số lượng` })
      }

      bookDoc.soLuongCon -= item.soLuongMuon
      await bookDoc.save()

      bookList.push({
        IdBook: bookDoc._id,
        soLuongMuon: item.soLuongMuon
      })
    }

    const newDocket = new Docket({
      IdDocket: IdDocketClient || `PM${Date.now()}`,
      books: bookList,
      MaThe: card._id,
      ngayMuon: new Date(),
      ngayHenTra: ngayHenTraSach,
      status: 'active'
    })

    await newDocket.save()

    const populatedDocket = await Docket.findById(newDocket._id)
      .populate('books.IdBook', '_id IdBook bookName')
      .populate({
        path: 'MaThe',
        select: '_id MaThe status MaSV',
        populate: {
          path: 'MaSV',
          select: '_id MaSV userName'
        }
      })

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu mượn sách thành công',
      data: formatDocketResponse(populatedDocket)
    })

  } catch (error) {
    console.error("Lỗi trong createDocket:", error)
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ'
    })
  }
}

export const findDocket = async (req, res) => {
  const { infoDocket } = req.body 
  try {
    if (!infoDocket) {
      return res.status(400).json({ success: false, message: "infoDocket là thông tin bắt buộc" })
    }

    const cards = await Card.find({ MaThe: { $regex: infoDocket, $options: 'i' } }).select('_id')
    
    if (!cards.length) {
        return res.status(200).json([])
    }
    const cardIds = cards.map(card => card._id)

    const dockets = await Docket.find({
      MaThe: { $in: cardIds }
    })
    .populate('books.IdBook', '_id IdBook bookName')
    .populate({
      path: 'MaThe',
      select: '_id MaThe status MaSV',
      populate: {
        path: 'MaSV',
        select: '_id MaSV userName'
      }
    })
    .sort({ ngayMuon: -1 })

    res.status(200).json(dockets.map(formatDocketResponse))
  } catch (error) {
    console.error("Lỗi trong findDocket controller: ", error.message)
    res.status(500).json({ success: false, message: "Lỗi Máy Chủ Nội Bộ" })
  }
}
export const getDockets = async (req, res) => {
    try {
        const dockets = await Docket.find()
            .populate('books.IdBook', '_id IdBook bookName')
            .populate({
                path: 'MaThe',
                select: '_id MaThe status MaSV',
                populate: { path: 'MaSV', select: '_id MaSV userName' }
            })
            .sort({ ngayMuon: -1 })

        res.json({
            success: true,
            data: dockets.map(formatDocketResponse)
        })

    } catch (error) {
        console.error("Lỗi trong getDockets:", error)
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        })
    }
}

export const returnBook = async (req, res) => {
    const { IdDocket } = req.params
    const { booksReturn, ngayTra } = req.body

    try {
        const docket = await Docket.findById(IdDocket)
            .populate('books.IdBook', '_id IdBook bookName')
            .populate({
                path: 'MaThe',
                select: '_id MaThe status MaSV',
                populate: {
                    path: 'MaSV',
                    select: '_id MaSV userName'
                }
            })

        if (!docket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu mượn trên hệ thống' })
        }

        if (docket.status === 'returned' || docket.status === 'overdue_returned') {
            return res.status(400).json({
                success: false,
                message: 'Sách đã được ghi nhận đã trả trước đó.'
            })
        }

        const actualReturnDate = ngayTra ? new Date(ngayTra) : new Date()
        if (isNaN(actualReturnDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Ngày trả thực tế không hợp lệ.' })
        }
        docket.ngayTra = actualReturnDate

        for (const book of booksReturn) {
            const { IdBook } = book
            if (!IdBook) {
                return res.status(400).json({ success: false, message: `IdBook không hợp lệ.` })
            }

            const bookEntry = docket.books.find(b =>
                b.IdBook._id.toString() === IdBook || b.IdBook.IdBook === IdBook
            )


            if (!bookEntry) {
                return res.status(400).json({ success: false, message: `Sách mã ${IdBook} không có trong phiếu mượn` })
            }

            const bookDoc = await Book.findById(IdBook)
            if (bookDoc) {
                bookDoc.soLuongCon += bookEntry.soLuongMuon
                await bookDoc.save()
            }

            docket.books = docket.books.filter(b => b.IdBook._id.toString() !== IdBook)
        }

        if (docket.books.length === 0) {
            docket.status = actualReturnDate > new Date(docket.ngayHenTra)
                ? 'overdue_returned'
                : 'returned'
        } else {
            docket.status = actualReturnDate > new Date(docket.ngayHenTra)
                ? 'overdue'
                : 'active'
        }

        await docket.save()

        res.json({
            success: true,
            message: 'Trả sách thành công',
            data: formatDocketResponse(docket)
        })
    } catch (error) {
        console.error("Lỗi trong returnBook:", error)
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        })
    }
}


export const getBorrowedBooks = async (req, res) => {
  const { MaSV } = req.query

  try {
    if (!MaSV) {
      return res.status(400).json({ success: false, message: "MaSV là thông tin bắt buộc" })
    }

    const student = await Student.findOne({ MaSV }).select('_id')
    if (!student) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sinh viên với MaSV này." })
    }

    const card = await Card.findOne({ MaSV: student._id }).select('_id')
    if (!card) {
      return res.status(404).json({ success: false, message: "Sinh viên chưa có thẻ thư viện." })
    }

    const borrowedDockets = await Docket.find({ MaThe: card._id, status: { $in: ['active', 'overdue'] } })
    .populate({
      path: 'books.IdBook',
      select: '_id IdBook bookName',
    })

    const borrowedBooksList = borrowedDockets.flatMap(docket =>
      docket.books.map(bookEntry => ({
        docketObjectId: docket._id, 
        bookEntryObjectId: bookEntry._id, 
        IdDocket: docket.IdDocket,
        book: bookEntry.IdBook ? {
          _id: bookEntry.IdBook._id,
          IdBook: bookEntry.IdBook.IdBook,
          bookName: bookEntry.IdBook.bookName
        } : null,
        soLuongMuon: bookEntry.soLuongMuon,
        ngayMuon: docket.ngayMuon,
        ngayHenTra: docket.ngayHenTra,
        statusDocket: docket.status
      }))
    )

    res.json({ success: true, data: borrowedBooksList })
  } catch (error) {
    console.error("Lỗi trong getBorrowedBooks:", error)
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' })
  }
}