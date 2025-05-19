import express from "express";
import { createDocket, findDocket, getBorrowedBooks, getDockets, returnBook } from "../controllers/docket.controller.js";

const docketRouter = express.Router()

docketRouter.post('/creatDocket', createDocket)
docketRouter.get('/getDocket', getDockets)
docketRouter.post('/returnBook/:IdDocket', returnBook)
docketRouter.post('/findDocket', findDocket)
docketRouter.get('/getBorrowedBooks', getBorrowedBooks)
export default docketRouter