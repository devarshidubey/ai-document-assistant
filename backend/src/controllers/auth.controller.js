import { userSchema, userLoginSchema } from "../validators/user.validator.js";
import { generateTokens } from "../services/user/token.service.js";
import { createUser, authenticateUser } from "../services/user/auth.service.js";

export const signup = async (req, res, next) => {
    try{
        const { email, password } = userSchema.parse(req.body);

        const newUser = await createUser({ email, password });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
            },
        })
    } catch(err) {
        next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        const body = userLoginSchema.parse(req.body);

        const user = await authenticateUser(body);
        const { accessToken } = await generateTokens(user);

        res.status(200).json({
            success: true,
            message: "Logged in",
            data: {
                accessToken,
                user: { id: user._id, email: user.email, role: user.role },
            }
        })
    } catch(err) {
        next(err);
    }
}