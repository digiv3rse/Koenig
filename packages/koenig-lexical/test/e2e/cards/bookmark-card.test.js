import {afterAll, beforeAll, beforeEach, describe, test} from 'vitest';
import {assertHTML, focusEditor, html, initialize, insertCard, startApp} from '../../utils/e2e';
import {expect} from '@playwright/test';

describe('Bookmark card', async () => {
    let app;
    let page;

    beforeAll(async () => {
        ({app, page} = await startApp());
    });

    afterAll(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await initialize({page});
    });

    test('can import serialized bookmark card nodes', async function () {
        await page.evaluate(() => {
            const serializedState = JSON.stringify({
                root: {
                    children: [{
                        type: 'bookmark',
                        url: 'https://www.ghost.org/',
                        icon: 'https://www.ghost.org/favicon.ico',
                        title: 'Ghost: The Creator Economy Platform',
                        description: 'lorem ipsum dolor amet lorem ipsum dolor amet',
                        author: 'ghost',
                        publisher: 'Ghost - The Professional Publishing Platform',
                        thumbnail: 'https://ghost.org/images/meta/ghost.png',
                        caption: 'caption here'
                    }],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            });
            const editor = window.lexicalEditor;
            const editorState = editor.parseEditorState(serializedState);
            editor.setEditorState(editorState);
        });

        await assertHTML(page, html`
            <div data-lexical-decorator="true" contenteditable="false">
                <div data-kg-card-editing="false" data-kg-card-selected="false" data-kg-card="bookmark">
                </div>
            </div>
        `, {ignoreCardContents: true});
    });

    test('renders bookmark card node', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'bookmark'});

        await assertHTML(page, html`
            <div data-lexical-decorator="true" contenteditable="false">
                <div data-kg-card-editing="false" data-kg-card-selected="false" data-kg-card="bookmark"></div>
            </div>
            <p><br /></p>
        `, {ignoreCardContents: true});
    });

    test('can interact with url input after inserting', async function () {
        await focusEditor(page);
        await insertCard(page, {cardName: 'bookmark'});

        const urlInput = await page.getByTestId('bookmark-url');
        await expect(urlInput).toHaveAttribute('placeholder','Paste URL to add bookmark content...');

        await urlInput.fill('test');
        await expect(urlInput).toHaveValue('test');
    });

    // TODO: this whole section is a WIP... I think we need to mock requests in playwright/whatever
    describe('Valid URL handling', async () => {
        // // TODO: this test doesn't work if there is no request... it's a race condition
        // test('shows loading wheel', async function () {
        //     await focusEditor(page);
        //     await insertCard(page, {cardName: 'bookmark'});

        //     const urlInput = await page.getByTestId('bookmark-url');
        //     await urlInput.fill('https://ghost.org/');
        //     await urlInput.press('Tab');

        //     await expect(await page.getByTestId('bookmark-url-loading-container')).toBeVisible();
        //     await expect(await page.getByTestId('bookmark-url-loading-spinner')).toBeVisible();
        // });

        // test('displays expected metadata', async function () {
        //     await focusEditor(page);
        //     await insertCard(page, {cardName: 'bookmark'});

        //     page.on('request', request => console.log('>>', request.method(), request.url));
        //     page.on('response', response => console.log('<<', response.status(), response.url));

        //     const urlInput = await page.getByTestId('bookmark-url');
        //     await urlInput.fill('https://ghost.org/');
        //     await urlInput.press('Tab');

        //     // TODO: for some reason the awaits do not find the content, but if you
        //     //  run the test headless, it does work... 
        //     //  might have something to do with a need to mock the response, although
        //     //  given the current config there is *no* actual outside request despite
        //     //  the logging that's done here... it's confusing

        //     // const title = await page.getByTestId('bookmark-title');
        //     // await expect(title).toHaveText('Ghost: The Creator Economy Platform');
        //     // await expect(await page.getByTestId('bookmark-title')).toContainText('Ghost: The Creator Economy Platform');
        //     // await expect(await page.getByTestId('bookmark-description')).toContainText('The former of the two songs addresses the issue of negative rumors in a relationship, while the latter, with a more upbeat pulse, is a classic club track; the single is highlighted by a hyped bridge.');
        //     // await expect(await page.getByTestId('bookmark-publisher')).toContainText('Ghost - The Professional Publishing Platform');
        // });

        // TODO: test for caption, requires the above test to be functional
    });

    describe('Error Handling', async () => {
        test('bad url entry shows error message', async function () {
            await focusEditor(page);
            await insertCard(page, {cardName: 'bookmark'});

            const urlInput = await page.getByTestId('bookmark-url');
            await urlInput.fill('badurl');
            await expect(urlInput).toHaveValue('badurl');
            await urlInput.press('Tab');

            await expect(await page.getByTestId('bookmark-url-error-message')).toContainText('There was an error when parsing the URL.');
        });

        test('retry button bring back url input', async function () {
            await focusEditor(page);
            await insertCard(page, {cardName: 'bookmark'});

            const urlInput = await page.getByTestId('bookmark-url');
            await expect(urlInput).toHaveAttribute('placeholder','Paste URL to add bookmark content...');

            await urlInput.fill('badurl');
            await expect(urlInput).toHaveValue('badurl');
            await urlInput.press('Tab');

            const retryButton = await page.getByTestId('bookmark-url-error-retry');
            await retryButton.click();

            const urlInputRetry = await page.getByTestId('bookmark-url');
            await expect(urlInputRetry).toHaveValue('badurl');
            await expect(retryButton).not.toBeVisible();
        });

        test('paste as link button removes card and inserts text node link', async function () {
            await focusEditor(page);
            await insertCard(page, {cardName: 'bookmark'});

            const urlInput = await page.getByTestId('bookmark-url');
            await expect(urlInput).toHaveAttribute('placeholder','Paste URL to add bookmark content...');

            await urlInput.fill('badurl');
            await expect(urlInput).toHaveValue('badurl');
            await urlInput.press('Tab');

            const retryButton = await page.getByTestId('bookmark-url-error-pasteAsLink');
            await retryButton.click();

            await assertHTML(page, html`
                <p>
                    <a href="badurl" dir="ltr"><span data-lexical-text="true">badurl</span></a>
                </p>
                <p><br /></p>
            `);
        });

        test('close button removes card', async function () {
            await focusEditor(page);
            await insertCard(page, {cardName: 'bookmark'});

            const urlInput = await page.getByTestId('bookmark-url');
            await expect(urlInput).toHaveAttribute('placeholder','Paste URL to add bookmark content...');

            await urlInput.fill('badurl');
            await expect(urlInput).toHaveValue('badurl');
            await urlInput.press('Tab');

            const retryButton = await page.getByTestId('bookmark-url-error-close');
            await retryButton.click();

            await assertHTML(page, html`<p><br /></p>`);
        });
    });
});