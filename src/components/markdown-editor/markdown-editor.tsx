import { Component, h, Prop, State, Watch, Event, EventEmitter } from '@stencil/core';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

@Component({
  tag: 'markdown-editor',
  styleUrl: 'markdown-editor.css',
  shadow: false,
})
export class MarkdownEditor {
  @Prop() value: string;
  @Prop() textareaStyle: { [key: string]: string };
  @State() markdown: string = '';
  @State() showImageUrlInput: boolean = false;
  @State() imageUrl: string = '';
  @State() imageUrlError: string = '';
  @State() showSvgInput: boolean = false;
  @State() svgContent: string = '';
  @State() svgError: string = '';
  @State() showModal: boolean = false;
  @State() textareaStyles: { [key: string]: string } = {};
  @State() marked: any; // For holding marked once it's loaded

  @Event() valueChanged: EventEmitter<string>;

  componentWillLoad() {
    this.markdown = this.value;

    if (this.textareaStyle) {
      this.textareaStyles = { ...this.textareaStyle };
    }
  }

  componentDidLoad() {
    this.loadMarked();
    this.loadMermaid();
  }

  @Watch('value')
  handleValueChange(newValue: string) {
    if (newValue || newValue == null) {
      this.markdown = newValue;
      this.updatePreview();
    }
  }

  @Watch('textareaStyle')
  handleTextareaStyleChange(newStyle: { [key: string]: string }) {
    this.textareaStyles = { ...newStyle };
  }

  // Load `marked` library from CDN dynamically
  loadMarked() {
    if (typeof window !== 'undefined' && !window['marked']) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/14.1.1/marked.min.js';
      script.onload = () => {
        this.marked = window['marked'];
        this.updatePreview(); // Ensure preview is updated after marked is loaded
      };
      document.body.appendChild(script);
    } else {
      this.marked = window['marked'];
      this.updatePreview();
    }
  }

  // Imported through CDN because it runs out of memory on build
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

  handleInputChange(event) {
    this.markdown = event.target.value;
    this.updatePreview();
    this.autoResizeTextarea(event.target);
    this.valueChanged.emit(this.markdown);
  }

  async updatePreview() {
    const editorPreview = document.querySelector('.editor-preview');
    if(editorPreview && this.marked){
      const parsedHtml = this.markdown ? await this.marked.parse(this.markdown) : await this.marked.parse('');
      editorPreview.innerHTML = parsedHtml;
    }
    const preview = document.querySelector('.preview');
    if (preview && this.marked) {
      const parsedHtml = this.markdown ? await this.marked.parse(this.markdown) : await this.marked.parse('');
      preview.innerHTML = parsedHtml;
      this.highlightCodeBlocks();
      this.renderMermaidDiagrams();
      this.addClipboardButtons();
    }
    
  }

  highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach((block) => {
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

  addClipboardButtons() {
    document.querySelectorAll('pre').forEach((block) => {
      const button = document.createElement('button');
      button.innerText = 'Copy';
      button.className = 'clipboard-button btn btn-sm btn-outline-secondary';
      button.addEventListener('click', (event) => this.copyToClipboard(event, block));
      block.appendChild(button);
      block.style.position = 'relative';
    });
  }

  copyToClipboard(event: MouseEvent, block: HTMLElement) {
    event.stopPropagation();
    const text = block.querySelector('code')?.textContent || '';
    navigator.clipboard.writeText(text).then(
      () => {
        alert('Copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy:', err);
      }
    );
  }

  autoResizeTextarea(textarea: HTMLTextAreaElement) {
    const scrollPosition = textarea.scrollTop;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.scrollTop = scrollPosition;
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        this.insertMarkdownImage(imageUrl as string);
      };
      reader.readAsDataURL(file);
    }
  }

  handleImageUrlChange(event) {
    this.imageUrl = event.target.value;
    this.imageUrlError = '';
  }

  insertMarkdownImage(imageUrl) {
    const textarea = document.querySelector('.input-area') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = `${before}![Alt text](${imageUrl})${after}`;
    textarea.value = newText;
    this.markdown = newText;
    this.updatePreview();
    this.autoResizeTextarea(textarea);
    this.valueChanged.emit(this.markdown);
  }

  toggleImageUrlInput() {
    this.showImageUrlInput = !this.showImageUrlInput;
  }

  handleInsertImageUrl() {
    if (this.isValidUrl(this.imageUrl)) {
      this.insertMarkdownImage(this.imageUrl);
      this.imageUrl = '';
      this.showImageUrlInput = false;
    } else {
      this.imageUrlError = 'Please enter a valid URL';
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  toggleSvgInput() {
    this.showSvgInput = !this.showSvgInput;
  }

  handleSvgContentChange(event) {
    this.svgContent = event.target.value;
    this.svgError = '';
  }

  insertSvgContent() {
    if (this.isValidSvg(this.svgContent)) {
      const textarea = document.querySelector('.input-area') as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}${this.svgContent}${after}`;
      textarea.value = newText;
      this.markdown = newText;
      this.updatePreview();
      this.autoResizeTextarea(textarea);
      this.svgContent = '';
      this.showSvgInput = false;
      this.valueChanged.emit(this.markdown);
    } else {
      this.svgError = 'Please enter valid SVG content';
    }
  }

  isValidSvg(svg: string): boolean {
    const div = document.createElement('div');
    div.innerHTML = svg;
    return div.querySelector('svg') !== null;
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  handleTextareaFocus(event) {
    this.autoResizeTextarea(event.target);
  }

  render() {
    return (
      <div>
        <div
          onClick={() => this.toggleModal()}
          style={{ ...this.textareaStyles }}
          // value={this.markdown}
          
        >
          <div class="editor-preview border p-2 bg-light" id="editorPreview"></div>
        </div>

        <div class={`modal fade ${this.showModal ? 'show' : ''}`} tabindex="-1" style={{ display: this.showModal ? 'block' : 'none' }}>
          <div class="modal-dialog modal-fullscreen modal-dialog-centered">
            <div class="modal-content" style={{ height: '100vh' }}>
              <div class="modal-header">
                <h5 class="modal-title">Markdown Editor</h5>
                <button type="button" class="btn-close" aria-label="Close" onClick={() => this.toggleModal()}></button>
              </div>
              <div class="modal-body" style={{ height: '100%', overflowY: 'auto' }}>
                <div class="editor-modal-container" style={{ height: '100%' }}>
                  <div class="row mb-2">
                    <div class="col-12 d-flex justify-content-start">
                      <button class="btn btn-outline-primary me-2" onClick={() => this.toggleImageUrlInput()}>
                        {this.showImageUrlInput ? 'Cancel' : 'Insert Image by URL'}
                        <i class="bi bi-link"></i>
                      </button>
                      <label class="btn btn-outline-secondary mb-0 me-2">
                        Upload Image
                        <i class="bi bi-upload"></i>
                        <input
                          type="file"
                          accept="image/*"
                          class="form-control-file d-none"
                          onChange={(event) => this.handleImageUpload(event)}
                        />
                      </label>
                      <button class="btn btn-outline-info me-2" onClick={() => this.toggleSvgInput()}>
                        {this.showSvgInput ? 'Cancel' : 'Insert SVG'}
                        <i class="bi bi-code-slash"></i>
                      </button>
                    </div>
                  </div>
                  {this.showImageUrlInput && (
                    <div class="row mb-2">
                      <div class="col-6">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Enter image URL"
                          value={this.imageUrl}
                          onInput={(event) => this.handleImageUrlChange(event)}
                        />
                        {this.imageUrlError && <div class="text-danger">{this.imageUrlError}</div>}
                        <button class="btn btn-success mt-2" onClick={() => this.handleInsertImageUrl()}>
                          Insert Image
                        </button>
                      </div>
                    </div>
                  )}
                  {this.showSvgInput && (
                    <div class="row mb-2">
                      <div class="col-12">
                        <textarea
                          class="form-control"
                          placeholder="Paste SVG content here"
                          value={this.svgContent}
                          onInput={(event) => this.handleSvgContentChange(event)}
                          rows={5}
                        ></textarea>
                        {this.svgError && <div class="text-danger">{this.svgError}</div>}
                        <button class="btn btn-success mt-2" onClick={() => this.insertSvgContent()}>
                          Insert SVG
                        </button>
                      </div>
                    </div>
                  )}
                  <div class="row">
                    <div class="col-6">
                      <textarea
                        class="form-control input-area"
                        onInput={(event) => this.handleInputChange(event)}
                        onFocus={(event) => this.handleTextareaFocus(event)}
                        placeholder="Enter your markdown here..."
                        value={this.markdown}
                        style={{ height: '100%' }}
                      ></textarea>
                    </div>
                    <div class="col-6">
                      <div class="preview border p-3 bg-light" style={{ height: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
