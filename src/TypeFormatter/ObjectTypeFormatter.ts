import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";
import { BaseType } from "../Type/BaseType";
import { AnyType } from "../Type/AnyType";
import { Definition } from "../Schema/Definition";
import { StringMap } from "../Utils/StringMap";

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

        return {
            allOf: [
                this.getObjectDefinition(type),
                ...type.getBaseTypes().map((baseType: BaseType) => this.childTypeFormatter.getDefinition(baseType)),
            ],
        };
    }
    public getChildren(type: ObjectType): BaseType[] {
        const properties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();

        return [
            ...type.getBaseTypes().reduce((result: BaseType[], baseType: BaseType) => [
                ...result,
                ...this.childTypeFormatter.getChildren(baseType),
            ], []),

            ...additionalProperties instanceof BaseType ?
                this.childTypeFormatter.getChildren(additionalProperties) :
                [],

            ...properties.reduce((result: BaseType[], property: ObjectProperty) => [
                ...result,
                ...this.childTypeFormatter.getChildren(property.getType()),
            ], []),
        ];
    }

    private getObjectDefinition(type: ObjectType): Definition {
        const objectProperties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();

        const required = objectProperties
            .filter((property: ObjectProperty) => property.isRequired())
            .map((property: ObjectProperty) => property.getName());
        const properties = objectProperties.reduce(
            (result: StringMap<Definition>, property: ObjectProperty) => {
                result[property.getName()] = this.childTypeFormatter.getDefinition(property.getType());
                return result;
            }, {});

        return {
            type: "object",
            ...(Object.keys(properties).length > 0 ? {properties} : {}),
            ...(required.length > 0 ? {required} : {}),
            ...this.getAdditionalProperties(additionalProperties),
        };
    }
    private getAdditionalProperties(additionalProperties: BaseType | boolean): Definition {
        if (typeof additionalProperties === "boolean") {
            return additionalProperties ? {} : {additionalProperties: false};
        }

        return additionalProperties instanceof AnyType
            ? {}
            : {additionalProperties: this.childTypeFormatter.getDefinition(additionalProperties)};
    }
}
