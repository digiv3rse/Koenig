import HorizontalRulePlugin from '../plugins/HorizontalRulePlugin';
import HtmlPlugin from './HtmlPlugin';
import ImagePlugin from '../plugins/ImagePlugin';
import MarkdownPlugin from '../plugins/MarkdownPlugin';
import React from 'react';
import {AudioPlugin} from '../plugins/AudioPlugin';
import {ButtonPlugin} from '../plugins/ButtonPlugin';
import {CalloutPlugin} from '../plugins/CalloutPlugin';
import {CardMenuPlugin} from '../plugins/CardMenuPlugin';
import {FilePlugin} from '../plugins/FilePlugin';
import {HeaderPlugin} from '../plugins/HeaderPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TogglePlugin} from '../plugins/TogglePlugin';
import {VideoPlugin} from '../plugins/VideoPlugin';

export const AllDefaultPlugins = () => {
    return (
        <>
            {/* Lexical Plugins */}
            <ListPlugin /> {/* adds indent/outdent/remove etc support */}
            <TabIndentationPlugin /> {/* tab/shift+tab triggers indent/outdent */}

            {/* Koenig Plugins */}
            <CardMenuPlugin />

            {/* Card Plugins */}
            <AudioPlugin />
            <ImagePlugin />
            <VideoPlugin />
            <MarkdownPlugin />
            <HorizontalRulePlugin />
            <CalloutPlugin />
            <HtmlPlugin />
            <FilePlugin />
            <ButtonPlugin />
            <TogglePlugin />
            <HeaderPlugin />
        </>
    );
};

export default AllDefaultPlugins;
