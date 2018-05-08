import { RawType, RawTypeName } from "../Schema/RawType";

export function typeName(value: RawType): RawTypeName {
    if (value === null) {
        return "null";
    }

    const type = typeof value;
    if (
        type === "string" ||
        type === "number" ||
        type === "boolean"
    ) {
        return type;
    }

    /* istanbul ignore next */
    if (Array.isArray(value)) {
        return "array";
    } else if (type === "object") {
        return "object";
    } else {
        return "any";
    }
}
