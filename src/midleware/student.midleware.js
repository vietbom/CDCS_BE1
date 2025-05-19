import jwt from "jsonwebtoken";
import Student from "../models/User/Student.js";

export const protectRoute = async (req, res, next) => {
  
    try {
      const token = req.cookies.jwt 
  
      if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token Provided" })
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized - Invalid Token" })
      }
  
      const student = await Student.findById(decoded._id).select("-password")
  
      if (!student) {
        return res.status(404).json({ message: "User not found" })
      }
  
      req.student = student
  
      next()
    } catch (error) {
      console.log("Error in protectRoute middleware: ", error.message)
      res.status(500).json({ message: "Internal server error " })
    }
  };
  