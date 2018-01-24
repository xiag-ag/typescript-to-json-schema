import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { UnionType } from "../Type/UnionType";
import { BaseType } from "../Type/BaseType";
import { Definition } from "../Schema/Definition";

export class UnionTypeFormatter implements SubTypeFormatter {
    public constructor(
        private childTypeFormatter: TypeFormatter,
    ) {
    }

    public supportsType(type: UnionType): boolean {
        return type instanceof UnionType;
    }
    public getDefinition(type: UnionType): Definition {
        const definitions = type.getTypes().map((item) => this.childTypeFormatter.getDefinition(item));

        // special case for string literals | string -> string
        let stringType = true;
        let oneNotEnum = false;
        for (const def of definitions) {
            if (def.type !== "string") {
                stringType = false;
                break;
            }
            if (def.enum === undefined) {
                oneNotEnum = true;
            }
        }
        if (stringType && oneNotEnum) {
            return {
                type: "string",
            };
        }

        if (definitions.length === 0) {
            return {not: {}};
        } else if (definitions.length === 1) {
            return definitions[0];
        } else {
            return {anyOf: definitions};
        }
    }
    public getChildren(type: UnionType): BaseType[] {
        return type.getTypes().reduce((result: BaseType[], item) => [
            ...result,
            ...this.childTypeFormatter.getChildren(item),
        ], []);
    }
}
