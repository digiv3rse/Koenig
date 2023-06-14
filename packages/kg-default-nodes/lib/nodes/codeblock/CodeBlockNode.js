import {createCommand} from 'lexical';
import {KoenigDecoratorNode} from '../../KoenigDecoratorNode';
import {CodeBlockParser} from './CodeBlockParser';
import {renderCodeBlockNodeToDOM} from './CodeBlockRenderer';
import readTextContent from '../../utils/read-text-content';

export const INSERT_CODE_BLOCK_COMMAND = createCommand();

export class CodeBlockNode extends KoenigDecoratorNode {
    // payload properties
    __code;
    __language;
    __caption;

    static getType() {
        return 'codeblock';
    }

    static clone(node) {
        return new this(
            node.getDataset(),
            node.__key
        );
    }

    static get urlTransformMap() {
        return {
            caption: 'html'
        };
    }

    getDataset() {
        const self = this.getLatest();
        return {
            code: self.__code,
            language: self.__language,
            caption: self.__caption
        };
    }

    static importJSON(serializedNode) {
        const {code, language, caption} = serializedNode;
        const node = new this({code, language, caption});
        return node;
    }

    exportJSON() {
        return {
            type: 'codeblock',
            version: 1,
            code: this.__code,
            language: this.__language,
            caption: this.__caption
        };
    }

    constructor({code, language, caption} = {}, key) {
        super(key);
        this.__code = code;
        this.__language = language;
        this.__caption = caption;
    }

    static importDOM() {
        const parser = new CodeBlockParser(this);
        return parser.DOMConversionMap;
    }

    exportDOM(options = {}) {
        const {element, type} = renderCodeBlockNodeToDOM(this, options);
        return {element, type};
    }

    getCaption() {
        const self = this.getLatest();
        return self.__caption;
    }

    setCaption(caption) {
        const self = this.getWritable();
        self.__caption = caption;
    }

    getCode() {
        const self = this.getLatest();
        return self.__code;
    }

    setCode(code) {
        const self = this.getWritable();
        self.__code = code;
    }

    getLanguage() {
        const self = this.getLatest();
        return self.__language;
    }

    setLanguage(language) {
        const self = this.getWritable();
        self.__language = language;
    }

    hasEditMode() {
        return true;
    }

    isEmpty() {
        return !this.__code;
    }

    getTextContent() {
        const self = this.getLatest();
        const text = [
            readTextContent(self, 'code'),
            readTextContent(self, 'caption')
        ].filter(Boolean).join('\n');

        return text ? `${text}\n\n` : '';
    }
}

export function $createCodeBlockNode(dataset) {
    return new CodeBlockNode(dataset);
}

export function $isCodeBlockNode(node) {
    return node instanceof CodeBlockNode;
}