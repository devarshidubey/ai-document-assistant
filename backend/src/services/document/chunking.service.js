const DEFAULT_CHUNK_SIZE = process.env.DEFAULT_CHUNK_SIZE || 700;
const DEFAULT_OVERLAP = process.env.DEFAULT_OVERLAP || 100;

/**
 * Splits text into chunks, preferring paragraph boundaries.
 * Falls back to hard character splitting only if a single paragraph
 * exceeds chunkSize on its own.
 */
export const chunkText = (
    text,
    { chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP } = {}
) => {
    const cleaned = text.replace(/\r\n/g, "\n").trim();
    if (!cleaned) return [];

    const paragraphs = cleaned.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    const chunks = [];
    let current = "";

    const flush = () => {
        if (current.trim()) chunks.push(current.trim());
        current = "";
    };

    for (const para of paragraphs) {
        if (para.length > chunkSize) {
            // paragraph itself too big -- hard split it with overlap
            flush();
            let start = 0;
            while (start < para.length) {
                const end = Math.min(start + chunkSize, para.length);
                chunks.push(para.slice(start, end).trim());
                if (end === para.length) break;
                start = end - overlap;
            }
            continue;
        }

        if ((current + "\n\n" + para).length > chunkSize) {
            flush();
            current = para;
        } else {
            current = current ? `${current}\n\n${para}` : para;
        }
    }
    flush();

    return chunks;
};