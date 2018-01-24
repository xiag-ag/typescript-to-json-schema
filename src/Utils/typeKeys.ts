import { uniqueArray } from "./uniqueArray";
import { derefType } from "./derefType";

import { BaseType } from "../Type/BaseType";
import { LiteralType } from "../Type/LiteralType";

import { IntersectionType } from "../Type/IntersectionType";
import { UnionType } from "../Type/UnionType";

import { TupleType } from "../Type/TupleType";
import { ObjectType } from "../Type/ObjectType";

function uniqueLiterals(types: LiteralType[]): LiteralType[] {
    const values = types.map((type) => type.getValue());
    return uniqueArray(values).map((value) => new LiteralType(value));
}

export function getTypeKeys(type: BaseType): LiteralType[] {
    type = derefType(type);

    if (
        type instanceof IntersectionType ||
        type instanceof UnionType
    ) {
        return uniqueLiterals(type.getTypes().reduce((result: LiteralType[], subType) => [
            ...result,
            ...getTypeKeys(subType),
        ], []));
    }

    if (type instanceof TupleType) {
        return type.getTypes().map((it, idx) => new LiteralType(idx));
    }
    if (type instanceof ObjectType) {
        const objectProperties = type.getProperties().map((it) => new LiteralType(it.getName()));
        return uniqueLiterals(type.getBaseTypes().reduce((result: LiteralType[], parentType) => [
            ...result,
            ...getTypeKeys(parentType),
        ], objectProperties));
    }

    return [];
}

export function getTypeByKey(type: BaseType, index: LiteralType): BaseType | undefined {
    type = derefType(type);

    if (
        type instanceof IntersectionType ||
        type instanceof UnionType
    ) {
        for (const subType of type.getTypes()) {
            const subKeyType = getTypeByKey(subType, index);
            if (subKeyType) {
                return subKeyType;
            }
        }

        return undefined;
    }

    if (type instanceof TupleType) {
        return type.getTypes().find((it, idx) => idx === index.getValue());
    }
    if (type instanceof ObjectType) {
        const property = type.getProperties().find((it) => it.getName() === index.getValue());
        if (property) {
            return property.getType();
        }

        const additionalProperty = type.getAdditionalProperties();
        if (additionalProperty) {
            return additionalProperty;
        }

        for (const subType of type.getBaseTypes()) {
            const subKeyType = getTypeByKey(subType, index);
            if (subKeyType) {
                return subKeyType;
            }
        }

        return undefined;
    }

    return undefined;
}
