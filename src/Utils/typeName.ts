import { RawType, RawTypeName } from "../Schema/RawType";

export function typeName(value: RawType): RawTypeName {
    if (value === null) {
        return "null";
    } else if (Array.isArray(value)) {
        return "array";
    }

    const type = typeof value;
    return (
        type === "string" ||
        type === "number" ||
        type === "boolean" ||
        type === "object"
    ) ? type : "any";
}
