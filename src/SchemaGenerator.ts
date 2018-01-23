import * as ts from "typescript";
import { NodeParser, Context } from "./NodeParser";
import { TypeFormatter } from "./TypeFormatter";
import { BaseType } from "./Type/BaseType";
import { DefinitionType } from "./Type/DefinitionType";
import { Schema } from "./Schema/Schema";
import { Definition } from "./Schema/Definition";
import { StringMap } from "./Utils/StringMap";
import { NoRootTypeError } from "./Error/NoRootTypeError";
import { localSymbolAtNode, symbolAtNode } from "./Utils/symbolAtNode";

export class SchemaGenerator {
    public constructor(
        private program: ts.Program,
        private nodeParser: NodeParser,
        private typeFormatter: TypeFormatter,
    ) {
    }

    public createSchema(fullName: string): Schema {
        const rootNode = this.findRootNode(fullName);
        const rootType = this.nodeParser.createType(rootNode, new Context());

        return {
            $schema: "http://json-schema.org/draft-04/schema#",
            definitions: this.getRootChildDefinitions(rootType),
            ...this.getRootTypeDefinition(rootType),
        };
    }

    private findRootNode(fullName: string): ts.Node {
        const typeChecker = this.program.getTypeChecker();
        const allTypes = new Map<string, ts.Node>();

        this.program.getSourceFiles().forEach((sourceFile: ts.SourceFile) => {
            this.inspectNode(sourceFile, typeChecker, allTypes);
        });

        if (!allTypes.has(fullName)) {
            throw new NoRootTypeError(fullName);
        }

        return allTypes.get(fullName)!;
    }
    private inspectNode(node: ts.Node, typeChecker: ts.TypeChecker, allTypes: Map<string, ts.Node>): void {
        if (
            node.kind === ts.SyntaxKind.InterfaceDeclaration ||
            node.kind === ts.SyntaxKind.EnumDeclaration ||
            node.kind === ts.SyntaxKind.TypeAliasDeclaration
        ) {
            if (!this.isExportType(node)) {
                return;
            } else if (this.isGenericType(node as ts.TypeAliasDeclaration)) {
                return;
            }

            allTypes.set(this.getFullName(node, typeChecker), node);
        } else {
            ts.forEachChild(
                node,
                (subnode: ts.Node) => this.inspectNode(subnode, typeChecker, allTypes),
            );
        }
    }

    private isExportType(node: ts.Node): boolean {
        const localSymbol = localSymbolAtNode(node);
        return localSymbol ? "exportSymbol" in localSymbol : false;
    }
    private isGenericType(node: ts.TypeAliasDeclaration): boolean {
        return !!(
            node.typeParameters &&
            node.typeParameters.length > 0
        );
    }
    private getFullName(node: ts.Node, typeChecker: ts.TypeChecker): string {
        const symbol = symbolAtNode(node)!;
        return typeChecker.getFullyQualifiedName(symbol).replace(/".*"\./, "");
    }

    private getRootTypeDefinition(rootType: BaseType): Definition {
        return this.typeFormatter.getDefinition(rootType);
    }
    private getRootChildDefinitions(rootType: BaseType): StringMap<Definition> {
        return this.typeFormatter.getChildren(rootType)
            .filter((child: BaseType) => child instanceof DefinitionType)
            .reduce((result: StringMap<Definition>, child: DefinitionType) => ({
                ...result,
                [child.getId()]: this.typeFormatter.getDefinition(child.getType()),
            }), {});
    }
}
