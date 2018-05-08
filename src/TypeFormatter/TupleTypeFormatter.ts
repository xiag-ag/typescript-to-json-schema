import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { TupleType } from "../Type/TupleType";
import { BaseType } from "../Type/BaseType";
import { Definition } from "../Schema/Definition";
import { UnionType } from "../Type/UnionType";

export class TupleTypeFormatter implements SubTypeFormatter {
    public constructor(
        private childTypeFormatter: TypeFormatter,
    ) {
    }

    public supportsType(type: TupleType): boolean {
        return type instanceof TupleType;
    }
    public getDefinition(type: TupleType): Definition {
        const itemTypes = type.getTypes();
        if (itemTypes.length > 1) {
            return {
                type: "array",
                items: itemTypes.map((item) => this.childTypeFormatter.getDefinition(item)),
                minItems: itemTypes.length,
                additionalItems: this.childTypeFormatter.getDefinition(new UnionType(itemTypes)),
            };
        } else {
            return {
                type: "array",
                items: this.childTypeFormatter.getDefinition(itemTypes[0]),
                minItems: 1,
            };
        }
    }
    public getChildren(type: TupleType): BaseType[] {
        return type.getTypes().reduce((result: BaseType[], item) => [
            ...result,
            ...this.childTypeFormatter.getChildren(item),
        ], []);
    }
}
