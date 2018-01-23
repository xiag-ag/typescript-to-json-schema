import { uniqueArray } from "./uniqueArray";
import { derefType } from "./derefType";

import { BaseType } from "../Type/BaseType";
import { LiteralType, LiteralValue } from "../Type/LiteralType";

import { IntersectionType } from "../Type/IntersectionType";
import { UnionType } from "../Type/UnionType";

import { TupleType } from "../Type/TupleType";
import { ObjectProperty, ObjectType } from "../Type/ObjectType";
import { AnyType } from "../Type/AnyType";

function uniqueLiterals(types: LiteralType[]): LiteralType[] {
    const values = types.map((type: LiteralType) => type.getValue());
    return uniqueArray(values).map((value: LiteralValue) => new LiteralType(value));
}

export function getTypeKeys(type: BaseType): LiteralType[] {
    type = derefType(type);

    if (
        type instanceof IntersectionType ||
        type instanceof UnionType
    ) {
        return uniqueLiterals(type.getTypes().reduce((result: LiteralType[], subType: BaseType) => [
            ...result,
            ...getTypeKeys(subType),
        ], []));
    }

    if (type instanceof TupleType) {
        return type.getTypes().map((it: BaseType, idx: number) => new LiteralType(idx));
    }
    if (type instanceof ObjectType) {
        const objectProperties = type.getProperties().map((it: ObjectProperty) => new LiteralType(it.getName()));
        return uniqueLiterals(type.getBaseTypes().reduce((result: LiteralType[], parentType: BaseType) => [
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
        return type.getTypes().find((it: BaseType, idx: number) => idx === index.getValue());
    }
    if (type instanceof ObjectType) {
        const property = type.getProperties().find((it: ObjectProperty) => it.getName() === index.getValue());
        if (property) {
            return property.getType();
        }

        const additionalProperty = type.getAdditionalProperties();
        if (additionalProperty instanceof BaseType) {
            return additionalProperty;
        } else if (additionalProperty === true) {
            return new AnyType();
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
