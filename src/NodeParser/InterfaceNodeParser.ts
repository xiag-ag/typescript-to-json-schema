import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";
import { symbolAtNode } from "../Utils/symbolAtNode";
import { assertDefined } from "../Utils/assert";

export class InterfaceNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.InterfaceDeclaration): boolean {
        return node.kind === ts.SyntaxKind.InterfaceDeclaration;
    }
    public createType(node: ts.InterfaceDeclaration, context: Context): BaseType {
        if (node.typeParameters && node.typeParameters.length) {
            node.typeParameters.forEach((typeParam) => {
                const nameSymbol = assertDefined(this.typeChecker.getSymbolAtLocation(typeParam.name));
                context.pushParameter(nameSymbol.name);
            });
        }

        return new ObjectType(
            this.getTypeId(node, context),
            this.getBaseTypes(node, context),
            this.getProperties(node, context),
            this.getAdditionalProperties(node, context),
        );
    }

    private getBaseTypes(node: ts.InterfaceDeclaration, context: Context): BaseType[] {
        if (!node.heritageClauses) {
            return [];
        }

        return node.heritageClauses.reduce((result: BaseType[], baseType) => [
            ...result,
            ...baseType.types.map((expression) => this.childNodeParser.createType(expression, context)),
        ], []);
    }

    private getProperties(node: ts.InterfaceDeclaration, context: Context): ObjectProperty[] {
        return node.members
            .filter((property) => property.kind === ts.SyntaxKind.PropertySignature)
            .reduce((result: ObjectProperty[], propertyNode: ts.PropertySignature) => {
                const propertyType = assertDefined(propertyNode.type);
                const propertySymbol = assertDefined(symbolAtNode(propertyNode));

                const objectProperty = new ObjectProperty(
                    propertySymbol.getName(),
                    this.childNodeParser.createType(propertyType, context),
                    !propertyNode.questionToken,
                );

                result.push(objectProperty);
                return result;
            }, []);
    }
    private getAdditionalProperties(node: ts.InterfaceDeclaration, context: Context): BaseType | undefined {
        const property = node.members.find((it) => it.kind === ts.SyntaxKind.IndexSignature);
        if (!property) {
            return undefined;
        }

        const signature = property as ts.IndexSignatureDeclaration;
        const indexType = assertDefined(signature.type);
        return this.childNodeParser.createType(indexType, context);
    }

    private getTypeId(node: ts.Node, context: Context): string {
        const fullName = `interface-${node.getFullStart()}`;
        const argumentIds = context.getArguments().map((arg) => arg.getId());

        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
    }
}
