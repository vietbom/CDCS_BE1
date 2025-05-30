import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js"
import adminRouter from "./routes/admin.route.js"
import studentRouter from "./routes/student.route.js"
import bookRouter from "./routes/book.route.js"
import cardRouter from "./routes/card.route.js"
import docketRouter from "./routes/docket.route.js"
import path from 'path'


const ENV = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${ENV}` })

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())


app.use('/api/admin', adminRouter)
app.use('/api/student', studentRouter)
app.use('/api/book', bookRouter)
app.use('/api/card', cardRouter)
app.use('/api/docket', docketRouter)

const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'public')))


const port = process.env.PORT || 8017
const host = process.env.HOST || 'localhost'

console.log("ENV:", process.env.NODE_ENV)

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`)
  connectDB()
})
