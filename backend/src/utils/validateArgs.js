
/**
 * Minimal JSON-schema-style validator, covering only what our tool
 * definitions actually use: type "object", required fields, basic
 * type checks per property, and additionalProperties: false.
 *
 * Returns { valid: true } or { valid: false, errors: string[] }.
 * Deliberately does NOT throw -- the caller decides what to do with
 * an invalid result (log it, return a safe error to the LLM, etc.)
 */
export const validateArgs = (args, schema) => {
    const errors = [];

    if (typeof args !== "object" || args === null || Array.isArray(args)) {
        return { valid: false, errors: ["Arguments must be a non-null object"] };
    }

    for (const requiredField of schema.required || []) {
        if (!(requiredField in args)) {
            errors.push(`Missing required field: "${requiredField}"`);
        }
    }

    for (const [key, value] of Object.entries(args)) {
        const propSchema = schema.properties?.[key];

        if (!propSchema) {
            if (schema.additionalProperties === false) {
                errors.push(`Unexpected field: "${key}"`);
            }
            continue;
        }

        if (propSchema.type === "string" && typeof value !== "string") {
            errors.push(`Field "${key}" must be a string`);
        }
        if (propSchema.type === "number" && typeof value !== "number") {
            errors.push(`Field "${key}" must be a number`);
        }
        if (propSchema.type === "boolean" && typeof value !== "boolean") {
            errors.push(`Field "${key}" must be a boolean`);
        }

        if (propSchema.type === "string" && typeof value === "string" && value.trim() === "") {
            errors.push(`Field "${key}" must not be empty`);
        }
    }

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
};