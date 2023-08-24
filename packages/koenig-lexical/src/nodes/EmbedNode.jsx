import React from 'react';
import cleanBasicHtml from '@tryghost/kg-clean-basic-html';
import {$generateHtmlFromNodes} from '@lexical/html';
import {EmbedNode as BaseEmbedNode} from '@tryghost/kg-default-nodes';
import {ReactComponent as CodePenIcon} from '../assets/icons/kg-card-type-codepen.svg';
import {ReactComponent as EmbedCardIcon} from '../assets/icons/kg-card-type-other.svg';
import {EmbedNodeComponent} from './EmbedNodeComponent';
import {KoenigCardWrapper, MINIMAL_NODES} from '../index.js';
import {ReactComponent as SoundCloudIcon} from '../assets/icons/kg-card-type-soundcloud.svg';
import {ReactComponent as SpotifyIcon} from '../assets/icons/kg-card-type-spotify.svg';
import {ReactComponent as TwitterIcon} from '../assets/icons/kg-card-type-twitter.svg';
import {ReactComponent as VimeoIcon} from '../assets/icons/kg-card-type-vimeo.svg';
import {ReactComponent as YouTubeIcon} from '../assets/icons/kg-card-type-youtube.svg';
import {createCommand} from 'lexical';
import {populateNestedEditor, setupNestedEditor} from '../utils/nested-editors';

export const INSERT_EMBED_COMMAND = createCommand();

export class EmbedNode extends BaseEmbedNode {
    __captionEditor;
    __captionEditorInitialState;
    __createdWithUrl;

    static kgMenu = [{
        section: 'Embed',
        label: 'Other...',
        desc: '/embed [url]',
        Icon: EmbedCardIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        matches: ['embed'],
        queryParams: ['url'],
        priority: 100
    },
    {
        section: 'Embed',
        label: 'YouTube',
        desc: '/youtube [video url]',
        Icon: YouTubeIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','youtube','video'],
        priority: 1
    },
    {
        section: 'Embed',
        label: 'Twitter',
        desc: '/twitter [tweet url]',
        Icon: TwitterIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','twitter'],
        priority: 2
    },
    {
        section: 'Embed',
        label: 'Vimeo',
        desc: '/vimeo [video url]',
        Icon: VimeoIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','vimeo','video'],
        priority: 4
    },
    {
        section: 'Embed',
        label: 'CodePen',
        desc: '/codepen [pen url]',
        Icon: CodePenIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','codepen'],
        priority: 5
    },
    {
        section: 'Embed',
        label: 'Spotify',
        desc: '/spotify [track or playlist url]',
        Icon: SpotifyIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','spotify'],
        priority: 6
    },
    {
        section: 'Embed',
        label: 'SoundCloud',
        desc: '/soundcloud [track or playlist url]',
        Icon: SoundCloudIcon,
        insertCommand: INSERT_EMBED_COMMAND,
        queryParams: ['url'],
        matches: ['embed','soundcloud'],
        priority: 7
    }];

    getIcon() {
        return EmbedCardIcon;
    }

    constructor(dataset = {}, key) {
        super(dataset, key);

        this.__createdWithUrl = !!dataset.url;

        setupNestedEditor(this, '__captionEditor', {editor: dataset.captionEditor, nodes: MINIMAL_NODES});

        // populate nested editors on initial construction
        if (!dataset.captionEditor && dataset.caption) {
            populateNestedEditor(this, '__captionEditor', `<p>${dataset.caption}</p>`); // we serialize with no wrapper
        }
    }

    getDataset() {
        const dataset = super.getDataset();

        // client-side only data properties such as nested editors
        const self = this.getLatest();
        dataset.captionEditor = self.__captionEditor;
        dataset.captionEditorInitialState = self.__captionEditorInitialState;

        return dataset;
    }

    exportJSON() {
        const json = super.exportJSON();

        // convert nested editor instances back into HTML because their content may not
        // be automatically updated when the nested editor changes
        if (this.__captionEditor) {
            this.__captionEditor.getEditorState().read(() => {
                const html = $generateHtmlFromNodes(this.__captionEditor, null);
                const cleanedHtml = cleanBasicHtml(html);
                json.caption = cleanedHtml;
            });
        }

        return json;
    }

    decorate() {
        return (
            <KoenigCardWrapper nodeKey={this.getKey()}>
                <EmbedNodeComponent
                    captionEditor={this.__captionEditor}
                    captionEditorInitialState={this.__captionEditorInitialState}
                    createdWithUrl={this.__createdWithUrl}
                    embedType={this.embedType}
                    html={this.html}
                    metadata={this.metadata}
                    nodeKey={this.getKey()}
                    url={this.url}
                />
            </KoenigCardWrapper>
        );
    }
}

export const $createEmbedNode = (dataset) => {
    return new EmbedNode(dataset);
};

export function $isEmbedNode(node) {
    return node instanceof EmbedNode;
}
