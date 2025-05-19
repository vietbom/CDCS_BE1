import express from "express";
import { addStudent, checkAuth, login, logout } from "../controllers/student.controllers.js";
import { protectRoute } from "../midleware/student.midleware.js";


const studentRouter = express.Router()

studentRouter.post('/signUp', addStudent)
studentRouter.post('/login', login)
studentRouter.post('/logout', logout)

studentRouter.get('/check',protectRoute, checkAuth)
export default studentRouter