import {$createTKNode, TKNode} from '@tryghost/kg-default-nodes';
import {$getNodeByKey, $getRoot, $isElementNode, $isTextNode} from 'lexical';
import {useCallback, useEffect} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalTextEntity} from '../hooks/useExtendedTextEntity';

const REGEX = new RegExp(/(?<!\w)TK(?!\w)/);

export default function TKPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([TKNode])) {
            throw new Error('TKPlugin: TKNode not registered on editor');
        }
    }, [editor]);

    // get the first TK node for each direct child of the root element
    const getTKNodesForIndicators = useCallback((editorState) => {
        let foundNodes = [];
        if (!editorState) {
            return foundNodes;
        }
        editorState.read(() => {
            const root = $getRoot();
            const children = root.getChildren();
            // need to loop over all leaf nodes and check if they are TKNodes

            // TODO: right now doesn't handle children of children of children (e.g. list > listitem > text, or list > listitem > list > listitem > text)
            for (let child of children) {
                if ($isElementNode(child)) {
                    // need to export children
                    const childChildren = child.getChildren();
                    for (let childChild of childChildren) {
                        if (childChild instanceof TKNode) {
                            foundNodes.push(childChild);
                            break; // only need to find one child per parent element
                        }
                    }
                } else if ($isTextNode(child)) {
                    if (child.getType instanceof TKNode) {
                        foundNodes.push(child);
                    }
                }
            }
        });
        return foundNodes;
    }, []);

    // TODO: may be some competition with the listener for clicking outside the editor since clicking on the indicator sometimes focuses the document body
    const indicatorOnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.update(() => {
            const node = $getNodeByKey(e.target.dataset.key);
            node.select(0,0);
        });
    };

    const renderIndicators = useCallback((tkNodes) => {
        // clean up existing indicators
        document.body.querySelectorAll('.tk-indicator').forEach((el) => {
            el.remove(); 
        });

        // add indicators to the dom
        tkNodes.forEach((node) => {
            const element = editor.getElementByKey(node.getKey());
            const editorParent = editor.getRootElement().parentElement;
            const editorParentTop = editorParent.getBoundingClientRect().top;
            const tkParentTop = element.parentElement.getBoundingClientRect().top;
            const editorWidth = editorParent.offsetWidth;

            // create an element
            const indicator = document.createElement('div');
            indicator.style.position = 'absolute';
            indicator.style.left = `${editorWidth + 10}px`;
            indicator.style.top = `${tkParentTop - editorParentTop}px`;
            indicator.style.marginTop = '3px';
            indicator.textContent = 'TK';
            indicator.classList.add('tk-indicator');
            indicator.dataset.key = node.getKey();

            indicator.onclick = indicatorOnClick;

            // add to the editor parent (adding to editor triggers an infinite loop)
            editorParent.appendChild(indicator);
        });
    }, [editor]);

    // run once on mount and then let the editor state listener handle updates
    useEffect(() => {
        const foundNodes = getTKNodesForIndicators(editor.getEditorState());
        renderIndicators(foundNodes);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    // update TKs on editor state updates
    useEffect(() => {
        const removeListener = editor.registerUpdateListener(({editorState}) => {
            const foundNodes = getTKNodesForIndicators(editorState);
            renderIndicators(foundNodes);
        });

        return () => {
            removeListener();
        };
    }, [editor, renderIndicators, getTKNodesForIndicators]);

    const createTKNode = useCallback((textNode) => {
        return $createTKNode(textNode.getTextContent());
    }, []);

    const getTKMatch = useCallback((text) => {
        const matchArr = REGEX.exec(text);

        if (matchArr === null) {
            return null;
        }

        const startOffset = matchArr.index;
        const endOffset = startOffset + 2;

        return {
            end: endOffset,
            start: startOffset
        };
    }, []);

    useLexicalTextEntity(
        getTKMatch,
        TKNode,
        createTKNode,
    );

    return null;
}
