import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ArrayType } from "../Type/ArrayType";
import { assertDefined } from "../Utils/assert";

export class TypeReferenceNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeReferenceNode): boolean {
        return node.kind === ts.SyntaxKind.TypeReference;
    }
    public createType(node: ts.TypeReferenceNode, context: Context): BaseType {
        const typeSymbol = assertDefined(this.typeChecker.getSymbolAtLocation(node.typeName));
        if (typeSymbol.flags & ts.SymbolFlags.Alias) {
            const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol);
            const declarations = assertDefined(aliasedSymbol.declarations);
            const declaration = declarations.find((it) => this.isValidDeclaration(it));

            return this.childNodeParser.createType(
                assertDefined(declaration),
                this.createSubContext(node, context),
            );
        } else if (typeSymbol.flags & ts.SymbolFlags.TypeParameter) {
            return context.getArgument(typeSymbol.name);
        } else if (typeSymbol.name === "Array" || typeSymbol.name === "ReadonlyArray") {
            const arrayItemType = this.createSubContext(node, context).getArguments()[0];
            return new ArrayType(assertDefined(arrayItemType));
        } else {
            const declarations = assertDefined(typeSymbol.declarations);
            const declaration = declarations.find((it) => this.isValidDeclaration(it));

            return this.childNodeParser.createType(
                assertDefined(declaration),
                this.createSubContext(node, context),
            );
        }
    }

    private createSubContext(node: ts.TypeReferenceNode, parentContext: Context): Context {
        const subContext = new Context(node);
        if (node.typeArguments && node.typeArguments.length) {
            node.typeArguments.forEach((typeArg) => {
                subContext.pushArgument(this.childNodeParser.createType(typeArg, parentContext));
            });
        }
        return subContext;
    }
    private isValidDeclaration(declration: ts.Declaration): boolean {
        return (
            declration.kind !== ts.SyntaxKind.ModuleDeclaration &&
            declration.kind !== ts.SyntaxKind.VariableDeclaration
        );
    }
}
