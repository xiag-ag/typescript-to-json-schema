import * as ts from "typescript";
import { Annotations } from "../Type/AnnotatedType";
import { DefaultAnnotationsReader } from "./DefaultAnnotationsReader";

export class ExtendedAnnotationsReader extends DefaultAnnotationsReader {
    public getAnnotations(node: ts.Node): Annotations {
        const symbol: ts.Symbol = (node as any).symbol;
        if (!symbol) {
            return undefined;
        }

        const jsDocTags: ts.JSDocTagInfo[] = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
            return undefined;
        }

        const annotations: Annotations = {
            ...this.getDescriptionAnnotation(symbol),
            ...this.getTypeAnnotation(jsDocTags),
            ...super.getAnnotations(node),
        };
        return Object.keys(annotations).length ? annotations : undefined;
    }

    private getDescriptionAnnotation(symbol: ts.Symbol): Annotations {
        const comments: ts.SymbolDisplayPart[] = symbol.getDocumentationComment();
        if (!comments || !comments.length) {
            return undefined;
        }

        return {description: comments.map((comment: ts.SymbolDisplayPart) => comment.text).join(" ")};
    }
    private getTypeAnnotation(jsDocTags: ts.JSDocTagInfo[]): Annotations {
        const jsDocTag: ts.JSDocTagInfo = jsDocTags.find((tag: ts.JSDocTagInfo) => tag.name === "asType");
        if (!jsDocTag || !jsDocTag.text) {
            return undefined;
        }

        return {type: jsDocTag.text};
    }
}
