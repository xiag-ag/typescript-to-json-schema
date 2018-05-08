import { intersectArray } from "./intersectArray";
import { uniqueArray } from "./uniqueArray";
import { derefType } from "./derefType";
import { filterDefined } from "./filterDefined";

import { BaseType } from "../Type/BaseType";
import { LiteralType, LiteralValue } from "../Type/LiteralType";

import { IntersectionType } from "../Type/IntersectionType";
import { UnionType } from "../Type/UnionType";

import { TupleType } from "../Type/TupleType";
import { ObjectType } from "../Type/ObjectType";

function literalToValue(literal: LiteralType): LiteralValue {
    return literal.getValue();
}
function valueToLiteral(value: LiteralValue): LiteralType {
    return new LiteralType(value);
}

function uniqueLiterals(types: LiteralType[]): LiteralType[] {
    const values = types.map(literalToValue);
    return uniqueArray(values).map(valueToLiteral);
}
function intersectLiterals(types: LiteralType[][]): LiteralType[] {
    const [first, ...rest] = types;
    return intersectArray(first.map(literalToValue), ...rest.map((it) => it.map(literalToValue))).map(valueToLiteral);
}

export function getTypeKeys(type: BaseType): LiteralType[] {
    type = derefType(type);

    if (type instanceof IntersectionType) {
        return uniqueLiterals(
            type.getTypes()
                .map(getTypeKeys)
                .reduce((result, types) => [...result, ...types], []),
        );
    } else if (type instanceof UnionType) {
        return intersectLiterals(
            type.getTypes()
                .map(getTypeKeys),
        );
    } else if (type instanceof ObjectType) {
        const objectProperties = type.getProperties()
            .map((property) => property.getName())
            .map(valueToLiteral);
        return uniqueLiterals(
            type.getBaseTypes()
                .map(getTypeKeys)
                .reduce((result, types) => [...result, ...types], objectProperties),
        );
    } else if (type instanceof TupleType) {
        return type.getTypes()
            .map((_, index) => index.toString())
            .map(valueToLiteral);
    }

    return [];
}

export function getTypeByKey(type: BaseType, index: LiteralType): BaseType | undefined {
    type = derefType(type);

    if (type instanceof IntersectionType) {
        const types = type.getTypes()
            .map((subType) => getTypeByKey(subType, index))
            .filter(filterDefined);
        return types.length > 1 ? new IntersectionType(types) : types[0];
    } else if (type instanceof UnionType) {
        const types = type.getTypes()
            .map((subType) => getTypeByKey(subType, index))
            .filter(filterDefined);
        return types.length > 1 ? new UnionType(types) : types[0];
    } else if (type instanceof TupleType) {
        return type.getTypes().find((it, idx) => idx === index.getValue());
    } else if (type instanceof ObjectType) {
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
