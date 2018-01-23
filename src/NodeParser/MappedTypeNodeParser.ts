import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectProperty, ObjectType } from "../Type/ObjectType";

export class MappedTypeNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.MappedTypeNode): boolean {
        return node.kind === ts.SyntaxKind.MappedType;
    }

    public createType(node: ts.MappedTypeNode, context: Context): BaseType {
        return new ObjectType(
            `indexed-type-${node.getFullStart()}`,
            [],
            this.getProperties(node, context),
            false,
        );
    }

    private getProperties(node: ts.MappedTypeNode, context: Context): ObjectProperty[] {
        const type = this.typeChecker.getTypeFromTypeNode(node.typeParameter.constraint!) as ts.UnionType;
        const keys = type.types as ts.StringLiteralType[];

        return keys.reduce((result: ObjectProperty[], key: ts.StringLiteralType) => {
            const objectProperty = new ObjectProperty(
                key.value,
                this.childNodeParser.createType(node.type!, context),
                !node.questionToken,
            );

            result.push(objectProperty);
            return result;
        }, []);
    }
}
