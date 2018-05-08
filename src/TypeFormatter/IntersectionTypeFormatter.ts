import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { IntersectionType } from "../Type/IntersectionType";
import { BaseType } from "../Type/BaseType";
import { Definition } from "../Schema/Definition";

export class IntersectionTypeFormatter implements SubTypeFormatter {
    public constructor(
        private childTypeFormatter: TypeFormatter,
    ) {
    }

    public supportsType(type: IntersectionType): boolean {
        return type instanceof IntersectionType;
    }
    public getDefinition(type: IntersectionType): Definition {
        const definitions = type.getTypes().map((item) => this.childTypeFormatter.getDefinition(item));

        // TODO: optimize intersection
        if (definitions.length === 0) {
            return {not: {}};
        } else if (definitions.length === 1) {
            return definitions[0];
        } else {
            return {allOf: definitions};
        }
    }
    public getChildren(type: IntersectionType): BaseType[] {
        return type.getTypes().reduce((result: BaseType[], item) => [
            ...result,
            ...this.childTypeFormatter.getChildren(item),
        ], []);
    }
}
