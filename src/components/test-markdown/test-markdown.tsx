import { Component, h } from '@stencil/core';

@Component({
  tag: 'test-markdown',
  styleUrl: 'test-markdown.css',
  shadow: false,
})
export class TestMarkdown {
  private previewMarkdown = `## Hello Markdown Preview`;

  render() {
    return (
      <section class="markdown-test-container">
        <header>
          <h2>Markdown Components Test</h2>
        </header>
        <article class="markdown-preview-component">
          <h3>Using &lt;markdown-preview&gt;:</h3>
          <markdown-preview markdown={this.previewMarkdown}></markdown-preview>
        </article>
      </section>
    );
  }
}
