import Portal from '../components/ui/Portal';
import React from 'react';
import emojiData from '@emoji-mart/data';
import useTypeaheadTriggerMatch from '../hooks/useTypeaheadTriggerMatch';
import {$createTextNode, $getSelection, $isRangeSelection} from 'lexical';
import {LexicalTypeaheadMenuPlugin} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {SearchIndex, init} from 'emoji-mart';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

init({data: emojiData});

const EmojiMenuItem = function ({index, isSelected, onClick, onMouseEnter, emoji}) {
    return (
        <li
            key={emoji.id}
            aria-selected={isSelected}
            className={`mb-0 flex h-9 cursor-pointer items-center justify-center whitespace-nowrap rounded font-sans text-xl leading-[3.6rem] tracking-wide text-grey-800 ${isSelected ? 'bg-grey-100 text-grey-900' : ''}`}
            data-testid={'emoji-option-' + index}
            id={'emoji-option-' + index}
            role="option"
            tabIndex={-1}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
        >
            {emoji.skins[0].native}
            {/* <span className="truncate">{emoji.id}</span> */}
        </li>
    );
};

export function EmojiPickerPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = React.useState(null);
    const [searchResults, setSearchResults] = React.useState(null);

    const checkForTriggerMatch = useTypeaheadTriggerMatch(':', {minLength: 1});

    React.useEffect(() => {
        if (!queryString) {
            setSearchResults(null);
            return;
        }

        async function searchEmojis() {
            const filteredEmojis = await SearchIndex.search(queryString);
            setSearchResults(filteredEmojis);
        }

        searchEmojis();
    }, [queryString]);

    const onEmojiSelect = React.useCallback((selectedOption, nodeToRemove, closeMenu) => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection) || selectedOption === null) {
                return;
            }

            if (nodeToRemove) {
                nodeToRemove.remove();
            }

            selection.insertNodes([$createTextNode(selectedOption.skins[0].native)]);

            closeMenu();
        });
    }, [editor]);

    // close menu on escape
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSearchResults(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <LexicalTypeaheadMenuPlugin
            menuRenderFn={(
                anchorElementRef,
                {selectedIndex, selectOptionAndCleanUp, setHighlightedIndex}
            ) => {
                if (anchorElementRef.current === null || searchResults === null || searchResults.length === 0) {
                    return null;
                }

                return (
                    <Portal to={anchorElementRef.current}>
                        <div className="relative top-[25px] w-[268px] bg-white shadow">
                            <ul className="grid max-h-[212px] list-none grid-cols-7 overflow-y-auto bg-white p-2" data-testid="emoji-menu">
                                {searchResults.map((emoji, index) => (
                                    <div key={emoji.id}>
                                        <EmojiMenuItem
                                            emoji={emoji}
                                            index={index}
                                            isSelected={selectedIndex === index}
                                            onClick={() => {
                                                setHighlightedIndex(index);
                                                selectOptionAndCleanUp(emoji);
                                            }}
                                            onMouseEnter={() => {
                                                setHighlightedIndex(index);
                                            }}
                                        />
                                    </div>
                                ))}
                            </ul>
                            <div className="w-full border-t border-grey-200 bg-white px-3 py-2 text-xs font-medium text-grey-600">slight_smiley_face</div>
                        </div>
                    </Portal>
                );
            }}
            options={searchResults}
            triggerFn={checkForTriggerMatch}
            onQueryChange={setQueryString}
            onSelectOption={onEmojiSelect}
        />
    );
}
