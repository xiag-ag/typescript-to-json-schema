import { SubTypeFormatter } from "../SubTypeFormatter";
import { UnionType } from "../Type/UnionType";
import { NullType } from "../Type/NullType";
import { BaseType } from "../Type/BaseType";
import { LiteralType } from "../Type/LiteralType";
import { Definition } from "../Schema/Definition";
import { uniqueArray } from "../Utils/uniqueArray";

export class LiteralUnionTypeFormatter implements SubTypeFormatter {
    public supportsType(type: UnionType): boolean {
        return type instanceof UnionType && this.isLiteralUnion(type);
    }
    public getDefinition(type: UnionType): Definition {
        const values = uniqueArray(type.getTypes().map((item: LiteralType | NullType) => this.getLiteralValue(item)));
        const types = uniqueArray(type.getTypes().map((item: LiteralType | NullType) => this.getLiteralType(item)));

        if (types.length === 1) {
            return {
                type: types[0],
                enum: values,
            };
        } else {
            return {
                type: types,
                enum: values,
            };
        }
    }
    public getChildren(type: UnionType): BaseType[] {
        return [];
    }

    private isLiteralUnion(type: UnionType): boolean {
        return type.getTypes().every((item: BaseType) => item instanceof LiteralType || item instanceof NullType);
    }
    private getLiteralValue(value: LiteralType | NullType): string | number | boolean | null {
        return value.getId() === "null" ? null : (value as LiteralType).getValue();
    }
    private getLiteralType(value: LiteralType | NullType): string {
        return value.getId() === "null" ? "null" : typeof (value as LiteralType).getValue();
    }
}
