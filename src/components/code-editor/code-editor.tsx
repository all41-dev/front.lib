import { Component, h, Element, Prop, Watch, Event, EventEmitter, State } from '@stencil/core';
import * as ace from 'ace-builds';
import { DateTime } from 'luxon'; // Ensure Luxon is installed and imported

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/snippets/javascript';

@Component({
  tag: 'code-editor',
  styleUrl: 'code-editor.css',
  shadow: false,
})
export class CodeEditor {
  @Element() private hostElement: HTMLElement;
  @Prop({ mutable: true }) value: string;
  @Prop() relatedTo: string;
  @Prop() relatedToUuid: string;
  @Prop({ mutable: true }) obj: any;
  @Event() inputChanged: EventEmitter<string>;

  @State() showModal: boolean = false;

  private editor: ace.Ace.Editor;
  private modalEditor: ace.Ace.Editor;
  private isUpdatingFromProp = false;
  private lineHeight = 20;
  private maxLines = 7;
  public objAttributes: string[] = [];

  private customAnnotations = [];

  componentWillLoad() {
    this.updateObjAttributes();
  }

  componentDidLoad() {
    this.initEditor();
    this.adjustEditorHeight();
  }

  @Watch('value')
  onValueChanged(newValue: string) {
    if (this.editor && !this.isUpdatingFromProp) {
      this.isUpdatingFromProp = true;
      this.updateEditorContent(newValue);
      this.adjustEditorHeight();
      this.isUpdatingFromProp = false;
    }
    if (this.modalEditor && !this.isUpdatingFromProp) {
      this.isUpdatingFromProp = true;
      this.updateModalEditorContent(newValue);
      this.isUpdatingFromProp = false;
    }
  }

  @Watch('obj')
  onObjChanged(_newObj: any) {
    this.updateObjAttributes();
    if (this.editor) {
      this.addCustomCompleter(this.editor, this.objAttributes);
    }
    if (this.modalEditor) {
      this.addCustomCompleter(this.modalEditor, this.objAttributes);
    }
  }

  private updateObjAttributes() {
    if (this.obj && (this.relatedTo === 'moduleToBusFunc' || this.relatedTo === 'busToModuleFunc')) {
      this.objAttributes = this.extractAttributes(this.obj, 'obj');
    } else if (this.obj) {
      this.objAttributes = this.extractAttributes(this.obj, 'obj');
    }
  }

  private extractAttributes(objArray: any[], prefix: string = 'obj', isFirstLevel: boolean = true): string[] {
    let attributes = [];
    objArray.forEach(obj => {
      if (isFirstLevel && obj.parentUuid) {
        return;
      }
      const newPrefix = `${prefix}.${obj.name}`;
      attributes.push(newPrefix);
      if (Array.isArray(obj.childs) && obj.childs.length > 0) {
        attributes = attributes.concat(this.extractAttributes(obj.childs, newPrefix, false));
      }
    });
    return attributes;
  }

  private initEditor() {
    const container = this.hostElement.querySelector('.editor-container') as HTMLElement;
    if (container) {
      ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/');
      ace.config.set('modePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/');
      ace.config.set('themePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/');
      ace.config.set('workerPath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/');

      ace.require('ace/ext/language_tools');
      ace.require('ace/ext/searchbox');

      this.editor = ace.edit(container, {
        value: this.value || '',
        mode: 'ace/mode/javascript',
        theme: 'ace/theme/monokai',
        fontSize: 15,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: true,
        enableSnippets: true,
        autoScrollEditorIntoView: true,
        copyWithEmptySelection: true,
      });

      this.addCustomCompleter(this.editor, this.objAttributes);

      this.editor.on('focus', () => this.openModal());

      this.editor.on('change', () => {
        if (!this.isUpdatingFromProp) {
          const newValue = this.editor.getValue();
          this.value = newValue;
          this.inputChanged.emit(newValue);
          this.adjustEditorHeight();
          // this.updateAnnotations();
        }
      });

      // this.updateAnnotations();
    } else {
      console.error('Editor container not found');
    }
  }

  private addLuxonCompletions() {
    const luxonMethods = Object.getOwnPropertyNames(DateTime.prototype).filter(method => typeof DateTime.prototype[method] === 'function' && method !== 'constructor');

    const luxonCompletions = luxonMethods.map(method => ({
      caption: `DateTime.${method}`,
      snippet: `DateTime.${method}(${this.getMethodParameters(DateTime.prototype[method])})`,
      meta: 'luxon',
      type: 'snippet',
    }));

    return luxonCompletions;
  }

  private getMethodParameters(method: Function) {
    // Try to get the method parameter names (for simplicity, we'll just return a generic string)
    const paramNames = method.toString().match(/\(([^)]*)\)/);
    return paramNames ? paramNames[1].replace(/[\s\(\)]+/g, '') : '';
  }

  private addCustomCompleter(editor: ace.Ace.Editor, objAttributes: string[]) {
    const customCompleter = {
      getCompletions: (_editor, _session, _pos, _prefix, callback) => {
        const completions = [];
        objAttributes.forEach(attr => {
          if (/^[A-Z]/.test(attr.split('.').pop()) || /\s/.test(attr)) {
            completions.push({
              caption: `obj["${attr.split('.').slice(1).join('.')}"]`,
              snippet: `obj["${attr.split('.').slice(1).join('.')}"]`,
              meta: 'attribute',
              type: 'snippet',
            });
          } else {
            completions.push({
              caption: `${attr}`,
              snippet: `${attr}`,
              meta: 'attribute',
              type: 'snippet',
            });
            completions.push({
              caption: `${attr
                .split('.')
                .map(a => `["${a}"]`)
                .join('')}`,
              snippet: `${attr
                .split('.')
                .map(a => `["${a}"]`)
                .join('')}`,
              meta: 'attribute',
              type: 'snippet',
            });
          }
        });

        completions.push({
          caption: 'func.pkFromBus',
          snippet: 'await func.pkFromBus({ subscriptionUuid: ` `, uuid: ` `, path: ` ` });',
          meta: 'entity translator',
          type: 'snippet',
        });
        completions.push({
          caption: 'func.pkToBus',
          snippet: 'await func.pkToBus({ subscriptionUuid: ` `, exchangeUuid: ` `, modulePk: ` `, exchangeCode: ` ` });',
          meta: 'entity translator',
          type: 'snippet',
        });

        const extendedCompletions = this.addLuxonCompletions();

        completions.push(...extendedCompletions);

        callback(null, completions);
      },
    };

    editor.completers = [
      customCompleter,
      ace.require('ace/ext/language_tools').textCompleter,
      ace.require('ace/ext/language_tools').snippetCompleter,
      ace.require('ace/ext/language_tools').keyWordCompleter,
    ];
  }

  private updateAnnotations() {
    this.generateCustomAnnotations();
    // this.applyAnnotations(this.editor);
    if (this.modalEditor) {
      this.applyAnnotations(this.modalEditor);
    }
  }

  private generateCustomAnnotations() {
    this.customAnnotations = [];
    const lines = this.editor.getSession().getDocument().getAllLines();

    lines.forEach((line, row) => {
      const regex = /obj\.(\w+)/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        const attr = match[1];
        if (!this.objAttributes.includes(`obj.${attr}`)) {
          this.customAnnotations.push({
            row: row,
            column: match.index,
            text: `Invalid attribute "${attr}" on obj`,
            type: 'error',
          });
        }
      }
    });
  }

  private applyAnnotations(editor: ace.Ace.Editor) {
    setTimeout(() => {
      const existingAnnotations = editor.getSession().getAnnotations();
      const combinedAnnotations = this.combineAnnotations(existingAnnotations, this.customAnnotations);
      editor.getSession().setAnnotations(combinedAnnotations);
    }, 1000);
  }

  private combineAnnotations(existingAnnotations, customAnnotations) {
    const combinedAnnotations = [...existingAnnotations];
    customAnnotations.forEach(customAnnotation => {
      const exists = combinedAnnotations.some(
        annotation =>
          annotation.row === customAnnotation.row &&
          annotation.column === customAnnotation.column &&
          annotation.text === customAnnotation.text &&
          annotation.type === customAnnotation.type,
      );
      if (!exists) {
        combinedAnnotations.push(customAnnotation);
      }
    });
    return combinedAnnotations;
  }

  private updateEditorContent(newValue: string) {
    if (this.editor && newValue !== this.editor.getValue()) {
      this.editor.setValue(newValue, -1);
      this.updateAnnotations();
    }
  }

  private updateModalEditorContent(newValue: string) {
    if (this.modalEditor && newValue !== this.modalEditor.getValue()) {
      this.modalEditor.setValue(newValue, -1);
      this.updateAnnotations();
    }
  }

  private adjustEditorHeight() {
    const container = this.hostElement.querySelector('.editor-container') as HTMLElement;
    const content = this.editor.getValue();
    const lineCount = content.split('\n').length;
    const editorHeight = Math.min(lineCount, this.maxLines) * this.lineHeight;

    container.style.height = `${editorHeight}px`;
    container.style.maxHeight = `${this.lineHeight * this.maxLines}px`;
    this.editor.resize();
  }

  private openModal() {
    this.showModal = true;
    setTimeout(() => {
      this.initModalEditor();
    }, 300);
  }

  private closeModal() {
    this.showModal = false;
    if (this.modalEditor) {
      this.modalEditor.destroy();
      this.modalEditor = null;
    }
  }

  private initModalEditor() {
    const container = this.hostElement.querySelector('.editor-modal-container') as HTMLElement;
    if (container && !this.modalEditor) {
      this.modalEditor = ace.edit(container, {
        value: this.value || '',
        mode: 'ace/mode/javascript',
        theme: 'ace/theme/monokai',
        fontSize: 15,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: true,
        enableSnippets: true,
        autoScrollEditorIntoView: true,
        copyWithEmptySelection: true,
      });
      this.addCustomCompleter(this.modalEditor, this.objAttributes);

      this.modalEditor.on('change', () => {
        if (!this.isUpdatingFromProp) {
          const newValue = this.modalEditor.getValue();
          this.value = newValue;
          this.inputChanged.emit(newValue);
          this.updateAnnotations();
        }
      });

      setTimeout(() => {
        this.modalEditor.resize();
        this.updateAnnotations();
      }, 0);
    }
  }

  render() {
    return (
      <div>
        <div class="editor-container" style={{ overflowY: 'auto' }}></div>
        <div class={`modal ${this.showModal ? 'show' : ''}`} tabindex="-1" style={{ display: this.showModal ? 'block' : 'none' }}>
          <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content" style={{ height: '80vh' }}>
              <div class="modal-header">
                <h5 class="modal-title">Code Editor of {this.relatedTo}</h5>
                <button type="button" class="btn-close" aria-label="Close" onClick={() => this.closeModal()}></button>
              </div>
              <div class="modal-body" style={{ height: '100%', overflowY: 'auto' }}>
                <div class="editor-modal-container" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
