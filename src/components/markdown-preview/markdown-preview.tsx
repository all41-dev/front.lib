import { Component, h, Prop, Watch } from '@stencil/core';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { Dropdown } from 'bootstrap';

@Component({
  tag: 'markdown-preview',
  styleUrl: 'markdown-preview.css',
  shadow: false,
})
export class MarkdownPreview {
  @Prop() markdown: string;

  private marked: any;

  @Watch('markdown')
  onMarkdownChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.renderMarkdown();
    }
  }

  componentDidLoad() {
    this.loadMarked();
    this.loadMermaid();
  }

  loadMarked() {
    if (typeof window !== 'undefined' && !window['marked']) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/14.1.1/marked.min.js';
      // script.src = '/front//assets/marked.js';
      script.onload = () => {
        // console.log(window['marked']);
        this.marked = window['marked'];
        this.renderMarkdown();
      };
      document.body.appendChild(script);
    } else {
      this.marked = window['marked'];
      this.renderMarkdown();
      document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
        try {
          new Dropdown(el);
        } catch (err) {
          console.error('Failed to initialize dropdown:', err);
        }
      });
    }
  }

  loadMermaid() {
    if (typeof window !== 'undefined' && !window['mermaid']) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
      script.onload = () => {
        this.initMermaid();
      };
      document.body.appendChild(script);
    } else {
      this.initMermaid();
    }
  }

  initMermaid() {
    if (window['mermaid']) {
      window['mermaid'].initialize({ startOnLoad: false });
      this.renderMermaidDiagrams();
    }
  }

  async renderMarkdown() {
    const preview = document.querySelector('#markdowPreviewPreview');
    if (preview && this.marked) {
      const parsedHtml = this.markdown ? await this.marked.parse(this.markdown) : await this.marked.parse('');
      preview.innerHTML = parsedHtml;
      this.highlightCodeBlocks();
      this.renderMermaidDiagrams();
    }
  }

  highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block as HTMLElement);
    });
  }

  renderMermaidDiagrams() {
    const mermaidElements = document.querySelectorAll('.language-mermaid');
    mermaidElements.forEach((element, index) => {
      const mermaidContainer = document.createElement('div');
      mermaidContainer.id = `mermaid-${index}`;
      mermaidContainer.className = 'mermaid';
      mermaidContainer.innerHTML = element.textContent || '';
      element.parentElement.replaceWith(mermaidContainer);
    });
    try {
      if (window['mermaid']) {
        window['mermaid'].init();
      }
    } catch (error) {
      console.error('Error initializing Mermaid:', error);
    }
  }

  render() {
    return (
      <div class="a4-preview">
        <div class="preview p-4" id="markdowPreviewPreview"></div>
      </div>
    );
  }
}
