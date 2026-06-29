import jwt from "jsonwebtoken";

export const generateTokens = async (user)=> {
    const secret = process.env.JWT_ACCESS_SECRET;
    const accessToken = jwt.sign(
        {id: user.id, email: user.email},
        secret,
        {expiresIn: "7d"},
    )

    return {accessToken: accessToken};
}