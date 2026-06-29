import bcrypt from "bcrypt";

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

export const hashPassword = (password)=> {
    return bcrypt.hash(password, saltRounds);
}

export const verifyPassword = (password, hash)=> {
    return bcrypt.compare(password, hash);
}