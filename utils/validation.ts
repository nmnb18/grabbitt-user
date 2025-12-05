// utils/validation.ts
export type ValidationResult = string | "";

export const validators = {
    required: (value: string, label: string = "This field"): ValidationResult =>
        value.trim().length === 0 ? `${label} is required` : "",

    email: (value: string): ValidationResult =>
        /^\S+@\S+\.\S+$/.test(value) ? "" : "Enter a valid email address",

    phone: (value: string): ValidationResult =>
        /^\d{10}$/.test(value) ? "" : "Enter a valid 10-digit phone number",

    password: (value: string): ValidationResult => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}|\\:";'<>?,./]).{8,}$/;

        if (!regex.test(value)) {
            return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        }

        return "";
    },

    matchPassword: (value: string, compare: string): ValidationResult =>
        value !== compare ? "Passwords do not match" : "",

    pincode: (value: string): ValidationResult =>
        /^\d{6}$/.test(value) ? "" : "Enter a valid 6-digit pincode",

    minLength: (value: string, length: number, label?: string): ValidationResult =>
        value.length < length ? `${label ?? "Field"} must be at least ${length} chars` : "",

    alphaOnly: (value: string, label?: string): ValidationResult =>
        /^[a-zA-Z\s]+$/.test(value) ? "" : `${label ?? "This field"} must contain letters only`,
};

/**
 * Validate a single field using a rules array.
 */
export const validateField = (
    key: string,
    value: string,
    rules: Array<(v: string) => ValidationResult>
): ValidationResult => {
    for (let rule of rules) {
        const error = rule(value);
        if (error) return error;
    }
    return "";
};

/**
 * Validate an entire form (generic reusable object-level validation)
 */
export const validateAll = (
    formFields: Record<string, any>,
    schema: Record<string, Array<(v: any) => ValidationResult>>
) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(schema).forEach((key) => {
        const value = formFields[key];
        const rules = schema[key];

        for (let rule of rules) {
            const error = rule(value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
                break;
            }
        }
    });

    return { isValid, errors: newErrors };
};
