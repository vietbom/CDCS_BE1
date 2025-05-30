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

const app = express()
dotenv.config()

app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
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

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

const port = process.env.PORT || 8017
const host = process.env.HOST || 'localhost'


if (process.env.NODE_ENV === 'production') {
  app.listen(process.env.PORT, '0.0.0.0', host, () => {
    console.log(`Server is running in PRODUCTION on http://${host}:${port}`);
    connectDB();
  });
} else {
  app.listen(port, '0.0.0.0', host, () => {
    console.log(`Server is running in DEVELOPMENT on http://${host}:${port}`);
    connectDB();
  });
}
