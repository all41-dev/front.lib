import { Component, h } from '@stencil/core';


@Component({
    tag: 'test-markdown',
    styleUrl: 'test-markdown.css'
})
export class TestMarkDown {
    render() {
        return (
            <div class="container">
                <h2>Markdown component</h2>
                <mark-down name="markdown" data="## Hello markdown"></mark-down>
            </div>
        );
    }
}
