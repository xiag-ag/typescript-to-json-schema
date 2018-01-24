import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";
import { symbolAtNode } from "../Utils/symbolAtNode";

export class TypeLiteralNodeParser implements SubNodeParser {
    public constructor(
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeLiteralNode): boolean {
        return node.kind === ts.SyntaxKind.TypeLiteral;
    }
    public createType(node: ts.TypeLiteralNode, context: Context): BaseType {
        return new ObjectType(
            this.getTypeId(node, context),
            [],
            this.getProperties(node, context),
            this.getAdditionalProperties(node, context),
        );
    }

    private getProperties(node: ts.TypeLiteralNode, context: Context): ObjectProperty[] {
        return node.members
            .filter((property) => property.kind === ts.SyntaxKind.PropertySignature)
            .reduce((result: ObjectProperty[], propertyNode: ts.PropertySignature) => {
                const propertySymbol = symbolAtNode(propertyNode)!;
                const objectProperty = new ObjectProperty(
                    propertySymbol.getName(),
                    this.childNodeParser.createType(propertyNode.type!, context),
                    !propertyNode.questionToken,
                );

                result.push(objectProperty);
                return result;
            }, []);
    }
    private getAdditionalProperties(node: ts.TypeLiteralNode, context: Context): BaseType | false {
        const property = node.members.find((it) => it.kind === ts.SyntaxKind.IndexSignature);
        if (!property) {
            return false;
        }

        const signature = property as ts.IndexSignatureDeclaration;
        return this.childNodeParser.createType(signature.type!, context);
    }

    private getTypeId(node: ts.Node, context: Context): string {
        const fullName = `structure-${node.getFullStart()}`;
        const argumentIds = context.getArguments().map((arg) => arg.getId());

        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
    }
}
