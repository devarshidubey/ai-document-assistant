import multer from "multer";
import HTTPError from "../utils/HTTPError.js";
import ALLOWED_MIME_TYPES from "../utils/types.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HTTPError(400, `Unsupported file type: ${file.mimetype}`));
    }
};

export const uploadSingleDocument = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap
}).single("file"); //stores in req.file