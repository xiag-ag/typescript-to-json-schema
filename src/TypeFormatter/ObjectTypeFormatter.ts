import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";
import { BaseType } from "../Type/BaseType";
import { AnyType } from "../Type/AnyType";
import { Definition } from "../Schema/Definition";
import { StringMap } from "../Utils/StringMap";
import { UnionType } from "../Type/UnionType";
import { UndefinedType } from "../Type/UndefinedType";
import { assertInstanceOf } from "../Utils/assert";
import { derefType } from "../Utils/derefType";
import { uniqueArray } from "../Utils/uniqueArray";

export class ObjectTypeFormatter implements SubTypeFormatter {
    public constructor(
        private childTypeFormatter: TypeFormatter,
    ) {
    }

    public supportsType(type: ObjectType): boolean {
        return type instanceof ObjectType;
    }
    public getDefinition(type: ObjectType): Definition {
        if (type.getBaseTypes().length === 0) {
            return this.getObjectDefinition(type);
        }

        const propertyNames = this.getPropertyNames(type);

        return {
            allOf: [
                {
                    ...this.getObjectDefinition(type),
                    additionalProperties: true,
                },
                ...type.getBaseTypes().map((baseType) => ({
                    ...this.childTypeFormatter.getDefinition(baseType),
                    additionalProperties: true,
                })),
            ],
            ...!propertyNames.length ? {} : {
                propertyNames: {
                    type: "string",
                    enum: propertyNames,
                },
            },
        };
    }
    public getChildren(type: ObjectType): BaseType[] {
        const properties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();

        return [
            ...type.getBaseTypes().reduce((result: BaseType[], baseType) => [
                ...result,
                ...this.childTypeFormatter.getChildren(baseType),
            ], []),

            ...additionalProperties instanceof BaseType ?
                this.childTypeFormatter.getChildren(additionalProperties) :
                [],

            ...properties.reduce((result: BaseType[], property) => [
                ...result,
                ...this.childTypeFormatter.getChildren(property.getType()),
            ], []),
        ];
    }

    private getObjectDefinition(type: ObjectType): Definition {
        const objectProperties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();

        const required = objectProperties
            .map((property) => this.prepareObjectProperty(property))
            .filter((property) => property.isRequired())
            .map((property) => property.getName());
        const properties = objectProperties
            .map((property) => this.prepareObjectProperty(property))
            .reduce((result: StringMap<Definition>, property) => ({
                ...result,
                [property.getName()]: this.childTypeFormatter.getDefinition(property.getType()),
            }), {});

        return {
            type: "object",
            ...(Object.keys(properties).length > 0 ? {properties} : {}),
            ...(required.length > 0 ? {required} : {}),
            ...this.getAdditionalProperties(additionalProperties),
        };
    }
    private getAdditionalProperties(additionalProperties: BaseType | undefined): Definition {
        if (!additionalProperties) {
            return {additionalProperties: false};
        }

        return additionalProperties instanceof AnyType
            ? {}
            : {additionalProperties: this.childTypeFormatter.getDefinition(additionalProperties)};
    }

    private prepareObjectProperty(property: ObjectProperty): ObjectProperty {
        const propType = property.getType();
        if (propType instanceof UndefinedType) {
            return new ObjectProperty(property.getName(), new UndefinedType(), false);
        } else if (!(propType instanceof UnionType)) {
            return property;
        }

        const requiredTypes = propType.getTypes().filter((it) => !(it instanceof UndefinedType));
        if (propType.getTypes().length === requiredTypes.length) {
            return property;
        } else if (requiredTypes.length === 0) {
            return new ObjectProperty(property.getName(), new UndefinedType(), false);
        }

        return new ObjectProperty(
            property.getName(),
            requiredTypes.length === 1 ? requiredTypes[0] : new UnionType(requiredTypes),
            false,
        );
    }

    private getPropertyNames(type: ObjectType): string[] {
        if (this.hasAdditionalProperties(type)) {
            return [];
        }

        const parents = type.getBaseTypes().map((baseType) => assertInstanceOf(
            derefType(baseType),
            ObjectType,
            `Object parent type should be instance of UnionType ("${baseType.getId()}" given)`,
        ));

        return uniqueArray(
            parents.reduce((result, parent) => [
                ...result,
                ...this.getPropertyNames(parent),
            ], type.getProperties().map((it) => it.getName())),
        );
    }
    private hasAdditionalProperties(type: ObjectType): boolean {
        if (type.getAdditionalProperties() !== undefined) {
            return true;
        }

        return type.getBaseTypes().map((baseType) => assertInstanceOf(
            derefType(baseType),
            ObjectType,
            `Object parent type should be instance of UnionType ("${baseType.getId()}" given)`,
        )).some((baseType) => this.hasAdditionalProperties(baseType));
    }
}
