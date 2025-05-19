import express from "express";
import { addBook, deleteBook, getBook, getPDF, searchBook, updateBook } from "../controllers/book.controllers.js";

const bookRouter = express.Router()

bookRouter.post('/addBook', addBook)
bookRouter.get('/getBook', getBook)
bookRouter.post('/searchBook', searchBook)
bookRouter.post('/updateBook/:_id', updateBook)
bookRouter.delete('/deleteBook/:_id', deleteBook)
bookRouter.get('/getPDF/:fileName', getPDF)

export default bookRouter