import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { TupleType } from "../Type/TupleType";

export class TupleNodeParser implements SubNodeParser {
    public constructor(
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TupleTypeNode): boolean {
        return node.kind === ts.SyntaxKind.TupleType;
    }
    public createType(node: ts.TupleTypeNode, context: Context): BaseType {
        return new TupleType(
            node.elementTypes.map((item) => {
                return this.childNodeParser.createType(item, context);
            }),
        );
    }
}
