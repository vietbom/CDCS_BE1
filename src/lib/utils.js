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

export const generateToken = (userId, res) => {
    const token = jwt.sign(
        { _id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '2d' }
    );

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,           
        sameSite: 'None',       
        maxAge: 2 * 24 * 60 * 60 * 1000
    });

    return token;
};
