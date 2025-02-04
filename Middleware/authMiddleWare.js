import jwt from 'jsonwebtoken';

const authUserMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Please login to access this route" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded.id){
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        req.body.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Invalid token" });
    }
}

export { authUserMiddleware };