import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import HTTPError from "../../utils/HTTPError.js";

const pdfParse = PDFParse;

console.log(pdfParse);

export const extractText = async (buffer, mimetype) => {
    switch (mimetype) {
        case "text/plain":
        case "text/markdown":
            return buffer.toString("utf-8");

        case "application/pdf": {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            await parser.destroy();
            
            return result.text;
        }

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        default:
            throw new HTTPError(400, `Cannot extract text from mimetype: ${mimetype}`);
    }
};