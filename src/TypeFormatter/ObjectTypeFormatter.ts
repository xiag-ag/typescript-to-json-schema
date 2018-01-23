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
        const properties: ObjectProperty[] = type.getProperties();
        const additionalProperties: BaseType | boolean = type.getAdditionalProperties();

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
        const objectProperties: ObjectProperty[] = type.getProperties();
        const additionalProperties: BaseType|boolean = type.getAdditionalProperties();

        const required: string[] = objectProperties
            .filter((property: ObjectProperty) => property.isRequired())
            .map((property: ObjectProperty) => property.getName());

        const properties: StringMap<Definition> = objectProperties.reduce(
            (result: StringMap<Definition>, property: ObjectProperty) => {
                result[property.getName()] = this.childTypeFormatter.getDefinition(property.getType());
                return result;
            }, {});

        return {
            type: "object",
            ...(Object.keys(properties).length > 0 ? {properties} : {}),
            ...(required.length > 0 ? {required} : {}),
            ...(additionalProperties === true || additionalProperties instanceof AnyType ? {} :
                {additionalProperties: additionalProperties instanceof BaseType ?
                    this.childTypeFormatter.getDefinition(additionalProperties) :
                    additionalProperties}),
        };
    }
}
