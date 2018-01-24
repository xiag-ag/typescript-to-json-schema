import * as ts from "typescript";
import { Annotations } from "../Type/AnnotatedType";
import { BasicAnnotationsReader } from "./BasicAnnotationsReader";
import { symbolAtNode } from "../Utils/symbolAtNode";

export class ExtendedAnnotationsReader extends BasicAnnotationsReader {
    public getAnnotations(node: ts.Node): Annotations | undefined {
        const annotations: Annotations = {
            ...this.getDescriptionAnnotation(node),
            ...this.getTypeAnnotation(node),
            ...super.getAnnotations(node),
        };
        return Object.keys(annotations).length ? annotations : undefined;
    }

    private getDescriptionAnnotation(node: ts.Node): Annotations | undefined {
        const symbol = symbolAtNode(node);
        if (!symbol) {
            return undefined;
        }

        const comments = symbol.getDocumentationComment();
        if (!comments || !comments.length) {
            return undefined;
        }

        return {description: comments.map((comment) => comment.text).join(" ")};
    }
    private getTypeAnnotation(node: ts.Node): Annotations | undefined {
        const symbol = symbolAtNode(node);
        if (!symbol) {
            return undefined;
        }

        const jsDocTags = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
            return undefined;
        }

        const jsDocTag = jsDocTags.find((tag) => tag.name === "asType");
        if (!jsDocTag || !jsDocTag.text) {
            return undefined;
        }

        return {type: jsDocTag.text};
    }
}
