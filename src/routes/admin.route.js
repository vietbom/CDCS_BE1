import express from "express";

import { checkAuth, delStudent, findStudent, getStudent, login, logout, signUp, updateStudent } from "../controllers/admin.controllers.js"
import { addStudent } from "../controllers/student.controllers.js";
import { protectRoute } from "../midleware/admin.midleware.js";

const adminRouter = express.Router()

adminRouter.post('/signUp', signUp)
adminRouter.post('/login', login)
adminRouter.post('/logout', logout)
adminRouter.get('/check', protectRoute, checkAuth)

adminRouter.post('/addStudent', addStudent)
adminRouter.get('/getStudent', getStudent)
adminRouter.post('/findStudent', findStudent)
adminRouter.post('/updateStudent/:_id', updateStudent)
adminRouter.delete('/delStudent/:_id', delStudent)
export default adminRouter