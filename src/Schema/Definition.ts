import { StringMap } from "../Utils/StringMap";

export type RawType = number | boolean | string | null;

export interface Definition {
    $ref?: string;
    description?: string;
    allOf?: Definition[];
    oneOf?: Definition[];
    anyOf?: Definition[];
    title?: string;
    type?: string | string[];
    format?: string;
    items?: Definition | Definition[];
    minItems?: number;
    additionalItems?: {
        anyOf: Definition[],
    };
    enum?: (RawType | Definition)[];
    default?: RawType | Object;
    additionalProperties?: false | Definition;
    required?: string[];
    propertyOrder?: string[];
    properties?: StringMap<Definition>;
    defaultProperties?: string[];

    typeof?: "function";
}
