import { SubTypeFormatter } from "../SubTypeFormatter";
import { LiteralType } from "../Type/LiteralType";
import { BaseType } from "../Type/BaseType";
import { Definition } from "../Schema/Definition";
import { typeName } from "../Utils/typeName";

export class LiteralTypeFormatter implements SubTypeFormatter {
    public supportsType(type: LiteralType): boolean {
        return type instanceof LiteralType;
    }
    public getDefinition(type: LiteralType): Definition {
        return {
            type: typeName(type.getValue()),
            enum: [type.getValue()],
        };
    }
    public getChildren(type: LiteralType): BaseType[] {
        return [];
    }
}
