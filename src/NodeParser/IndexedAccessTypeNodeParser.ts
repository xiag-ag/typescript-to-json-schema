import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { LiteralType } from "../Type/LiteralType";
import { getTypeByKey } from "../Utils/typeKeys";
import { assertDefined, assertInstanceOf } from "../Utils/assert";

export class IndexedAccessTypeNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.IndexedAccessTypeNode): boolean {
        return node.kind === ts.SyntaxKind.IndexedAccessType;
    }
    public createType(node: ts.IndexedAccessTypeNode, context: Context): BaseType {
        const indexType = this.childNodeParser.createType(node.indexType, context);
        const indexLiteral = assertInstanceOf(
            indexType,
            LiteralType,
            `Index access type should be instance of LiteralType ("${indexType.getId()}" given)`,
        );

        const objectType = this.childNodeParser.createType(node.objectType, context);
        return assertDefined(
            getTypeByKey(objectType, indexLiteral),
            `Invalid index "${indexLiteral.getValue()}" in type "${objectType.getId()}"`,
        );
    }
}
