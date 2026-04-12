
const adminOnly = async (req, res, next) => {

    if (req.user.userType !== "admin") {
        return res.status(403).json({
            message: "only admin can access"
        })
    }

    next()

}


export default adminOnly;
