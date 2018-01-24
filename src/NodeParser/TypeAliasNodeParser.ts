import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { AliasType } from "../Type/AliasType";

export class TypeAliasNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeAliasDeclaration): boolean {
        return node.kind === ts.SyntaxKind.TypeAliasDeclaration;
    }
    public createType(node: ts.TypeAliasDeclaration, context: Context): BaseType {
        if (node.typeParameters && node.typeParameters.length) {
            node.typeParameters.forEach((typeParam) => {
                const nameSymbol = this.typeChecker.getSymbolAtLocation(typeParam.name)!;
                context.pushParameter(nameSymbol.name);
            });
        }

        return new AliasType(
            this.getTypeId(node, context),
            this.childNodeParser.createType(node.type, context),
        );
    }

    private getTypeId(node: ts.Node, context: Context): string {
        const fullName = `alias-${node.getFullStart()}`;
        const argumentIds = context.getArguments().map((arg) => arg.getId());

        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
    }
}
