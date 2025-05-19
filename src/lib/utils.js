// import jwt from "jsonwebtoken";

// export const generateToken = (userId , res) => {
//     const token = jwt.sign(
//         {_id: userId}, 
//         process.env.JWT_SECRET, 
//         {expiresIn: '2d'}
//     )
//     res.cookie('jwt', token, {
//         maxAge: 2*24*60*60*1000,
//         httpOnly: true,
//         sameSite: 'Lax',
//         secure: process.env.NODE_ENV !== 'development'
//     })
//     return token
// }


import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign(
        { _id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '2d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,  // Always use secure in production
        sameSite: 'none',  // Required for cross-origin requests
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        domain: isProduction ? '.onrender.com' : undefined, // Set domain in production
        path: '/'
    });

    return token;
};
