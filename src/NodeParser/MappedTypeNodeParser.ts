import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectProperty, ObjectType } from "../Type/ObjectType";
import { LiteralType } from "../Type/LiteralType";
import { UnionType } from "../Type/UnionType";
import { derefType } from "../Utils/derefType";
import { assertDefined, assertInstanceOf } from "../Utils/assert";

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
        const constraintNode = assertDefined(node.typeParameter.constraint);
        const constraintType = this.childNodeParser.createType(constraintNode, context);

        const keyListType = assertInstanceOf(
            derefType(constraintType),
            UnionType,
            `Mapped type keys should be instance of UnionType ("${constraintType.getId()}" given)`,
        );

        const typeNode = assertDefined(node.type);
        return keyListType.getTypes().reduce((result: ObjectProperty[], keyType) => {
            const propertyType = this.childNodeParser.createType(
                typeNode,
                this.createSubContext(node, keyType, context),
            );
            const propertyName = assertInstanceOf(
                keyType,
                LiteralType,
                `Mapped type key should be instance of LiteralType ("${keyType.getId()}" given)`,
            ).getValue() as string;

            const objectProperty = new ObjectProperty(
                propertyName,
                propertyType,
                !node.questionToken,
            );

            result.push(objectProperty);
            return result;
        }, []);
    }

    private createSubContext(node: ts.MappedTypeNode, keyType: BaseType, parentContext: Context): Context {
        const subContext = new Context(node);

        parentContext.getParameters().forEach((parentParameter) => {
            subContext.pushParameter(parentParameter);
            subContext.pushArgument(parentContext.getArgument(parentParameter));
        });

        subContext.pushParameter(node.typeParameter.name.text);
        subContext.pushArgument(keyType);

        return subContext;
    }
}
