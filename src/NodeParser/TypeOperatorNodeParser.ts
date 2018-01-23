import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { EnumType } from "../Type/EnumType";

export class TypeOperatorNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeOperatorNode): boolean {
        return node.kind === ts.SyntaxKind.TypeOperator;
    }

    public createType(node: ts.TypeOperatorNode, context: Context): BaseType {
        const type = this.typeChecker.getTypeFromTypeNode(node) as ts.UnionType;
        const keys = type.types as ts.StringLiteralType[];

        return new EnumType(
            `keyof-type-${node.getFullStart()}`,
            keys.map((key: ts.StringLiteralType) => key.value),
        );
    }
}
