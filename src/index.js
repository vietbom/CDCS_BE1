import express from "express";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import adminRouter from "./routes/admin.route.js";
import studentRouter from "./routes/student.route.js";
import bookRouter from "./routes/book.route.js";
import cardRouter from "./routes/card.route.js";
import docketRouter from "./routes/docket.route.js";
import path from 'path';

const app = express();
dotenv.config();

const FRONTEND_ORIGIN = 'https://illustrious-peony-0b9ab4.netlify.app';

// ✅ Setup CORS: bắt buộc trả về đầy đủ header nếu dùng credentials
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Trả lời luôn preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// ✅ Logging request origin (debug)
app.use((req, res, next) => {
  console.log(`Request from origin: ${req.headers.origin}`);
  next();
});

// ✅ Routes
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api/book', bookRouter);
app.use('/api/card', cardRouter);
app.use('/api/docket', docketRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Test route để xác nhận kết nối FE
app.get('/api/test', (req, res) => {
  console.log('/api/test được gọi từ FE');
  res.json({ message: 'OK!' });
});

const port = process.env.PORT || 8017;
const host = process.env.HOST || 'localhost';

if (process.env.NODE_ENV === 'production') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running in PRODUCTION on http://${host}:${port}`);
    connectDB();
  });
} else {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running in DEVELOPMENT on http://${host}:${port}`);
    connectDB();
  });
}
