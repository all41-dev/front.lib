/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { DownloadOptions, DownloadType, Options, RowComponent, TabulatorFull } from "tabulator-tables";
import { CustomTabulatorColumn, CustomTabulatorRecMatching } from "./interfaces/custom-tabulator.types";
export { DownloadOptions, DownloadType, Options, RowComponent, TabulatorFull } from "tabulator-tables";
export { CustomTabulatorColumn, CustomTabulatorRecMatching } from "./interfaces/custom-tabulator.types";
export namespace Components {
    interface CodeEditor {
        "obj": any;
        "relatedTo": string;
        "relatedToUuid": string;
        "value": string;
    }
    interface CustomNavigator {
        "defaultTab": number;
        "label"?: string;
        "navElements": { labelHtml: string; contentHtml: any; linkString?: string }[];
        "uuid"?: string;
    }
    interface CustomTabulator {
        "actionButtonTags": (string | { tag: string; props: any })[];
        "childRowDefault"?: Object;
        "columns": Array<CustomTabulatorColumn>;
        "componentTitle"?: string;
        "confirmBeforeDelete": boolean;
        "data"?: any;
        "download"?: { type: DownloadType; fileName: () => string | string; options: DownloadOptions };
        "editionMode": 'inline' | 'modal' | 'side' | 'bottom';
        "fillLookup": (col: CustomTabulatorColumn) => Promise<void>;
        "height": string | number | false;
        "idPropName": string;
        "index": string;
        "isDeletionPermited": boolean;
        "name": string;
        "options"?: Options;
        "postRoute": string;
        "readOnly": boolean | 'updateOnly' | 'createOnly';
        "requestHeaders": { [key: string]: string };
        "route": string;
        "rowDefault"?: Object;
        "tabEndNewRow"?: boolean;
        "tabulatorComponent": TabulatorFull;
        "tabulatorLayout": 'fitDataStretch' | 'fitData' | 'fitColumns' | 'fitDataFill' | 'fitDataTable';
        "treeConfig": false | { childField: string; parentField: string; hideAddChild?: (row: any) => boolean };
    }
    interface MarkdownEditor {
        "textareaStyle": { [key: string]: string };
        "value": string;
    }
    interface MarkdownPreview {
        "markdown": string;
    }
    interface NavButton {
        "entityCode": string;
        "href": string;
        "relatedTo": string;
    }
    interface ScheduleButton {
        "schedule": string;
    }
    interface TestCustomNavigator {
    }
    interface TestCustomTabulator {
    }
    interface TestMarkdown {
    }
    interface TestRoot {
    }
}
export interface CodeEditorCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLCodeEditorElement;
}
export interface CustomTabulatorCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLCustomTabulatorElement;
}
export interface MarkdownEditorCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMarkdownEditorElement;
}
declare global {
    interface HTMLCodeEditorElementEventMap {
        "inputChanged": string;
    }
    interface HTMLCodeEditorElement extends Components.CodeEditor, HTMLStencilElement {
        addEventListener<K extends keyof HTMLCodeEditorElementEventMap>(type: K, listener: (this: HTMLCodeEditorElement, ev: CodeEditorCustomEvent<HTMLCodeEditorElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLCodeEditorElementEventMap>(type: K, listener: (this: HTMLCodeEditorElement, ev: CodeEditorCustomEvent<HTMLCodeEditorElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLCodeEditorElement: {
        prototype: HTMLCodeEditorElement;
        new (): HTMLCodeEditorElement;
    };
    interface HTMLCustomNavigatorElement extends Components.CustomNavigator, HTMLStencilElement {
    }
    var HTMLCustomNavigatorElement: {
        prototype: HTMLCustomNavigatorElement;
        new (): HTMLCustomNavigatorElement;
    };
    interface HTMLCustomTabulatorElementEventMap {
        "rowSelected": { rows: RowComponent[]; componentName: string };
        "rows": { rows: RowComponent[]; componentName: string };
        "loadedTable": { table: CustomTabulatorRecMatching; componentName: string };
        "tableBuilt": { table: CustomTabulatorRecMatching; componentName: string };
        "rowDeleted": { row: RowComponent; componentName: string };
        "rowSaved": { rows: RowComponent[]; componentName: string };
        "rowEditionButtonClicked": { row: RowComponent; componentName: string };
    }
    interface HTMLCustomTabulatorElement extends Components.CustomTabulator, HTMLStencilElement {
        addEventListener<K extends keyof HTMLCustomTabulatorElementEventMap>(type: K, listener: (this: HTMLCustomTabulatorElement, ev: CustomTabulatorCustomEvent<HTMLCustomTabulatorElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLCustomTabulatorElementEventMap>(type: K, listener: (this: HTMLCustomTabulatorElement, ev: CustomTabulatorCustomEvent<HTMLCustomTabulatorElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLCustomTabulatorElement: {
        prototype: HTMLCustomTabulatorElement;
        new (): HTMLCustomTabulatorElement;
    };
    interface HTMLMarkdownEditorElementEventMap {
        "valueChanged": string;
    }
    interface HTMLMarkdownEditorElement extends Components.MarkdownEditor, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMarkdownEditorElementEventMap>(type: K, listener: (this: HTMLMarkdownEditorElement, ev: MarkdownEditorCustomEvent<HTMLMarkdownEditorElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMarkdownEditorElementEventMap>(type: K, listener: (this: HTMLMarkdownEditorElement, ev: MarkdownEditorCustomEvent<HTMLMarkdownEditorElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMarkdownEditorElement: {
        prototype: HTMLMarkdownEditorElement;
        new (): HTMLMarkdownEditorElement;
    };
    interface HTMLMarkdownPreviewElement extends Components.MarkdownPreview, HTMLStencilElement {
    }
    var HTMLMarkdownPreviewElement: {
        prototype: HTMLMarkdownPreviewElement;
        new (): HTMLMarkdownPreviewElement;
    };
    interface HTMLNavButtonElement extends Components.NavButton, HTMLStencilElement {
    }
    var HTMLNavButtonElement: {
        prototype: HTMLNavButtonElement;
        new (): HTMLNavButtonElement;
    };
    interface HTMLScheduleButtonElement extends Components.ScheduleButton, HTMLStencilElement {
    }
    var HTMLScheduleButtonElement: {
        prototype: HTMLScheduleButtonElement;
        new (): HTMLScheduleButtonElement;
    };
    interface HTMLTestCustomNavigatorElement extends Components.TestCustomNavigator, HTMLStencilElement {
    }
    var HTMLTestCustomNavigatorElement: {
        prototype: HTMLTestCustomNavigatorElement;
        new (): HTMLTestCustomNavigatorElement;
    };
    interface HTMLTestCustomTabulatorElement extends Components.TestCustomTabulator, HTMLStencilElement {
    }
    var HTMLTestCustomTabulatorElement: {
        prototype: HTMLTestCustomTabulatorElement;
        new (): HTMLTestCustomTabulatorElement;
    };
    interface HTMLTestMarkdownElement extends Components.TestMarkdown, HTMLStencilElement {
    }
    var HTMLTestMarkdownElement: {
        prototype: HTMLTestMarkdownElement;
        new (): HTMLTestMarkdownElement;
    };
    interface HTMLTestRootElement extends Components.TestRoot, HTMLStencilElement {
    }
    var HTMLTestRootElement: {
        prototype: HTMLTestRootElement;
        new (): HTMLTestRootElement;
    };
    interface HTMLElementTagNameMap {
        "code-editor": HTMLCodeEditorElement;
        "custom-navigator": HTMLCustomNavigatorElement;
        "custom-tabulator": HTMLCustomTabulatorElement;
        "markdown-editor": HTMLMarkdownEditorElement;
        "markdown-preview": HTMLMarkdownPreviewElement;
        "nav-button": HTMLNavButtonElement;
        "schedule-button": HTMLScheduleButtonElement;
        "test-custom-navigator": HTMLTestCustomNavigatorElement;
        "test-custom-tabulator": HTMLTestCustomTabulatorElement;
        "test-markdown": HTMLTestMarkdownElement;
        "test-root": HTMLTestRootElement;
    }
}
declare namespace LocalJSX {
    interface CodeEditor {
        "obj"?: any;
        "onInputChanged"?: (event: CodeEditorCustomEvent<string>) => void;
        "relatedTo"?: string;
        "relatedToUuid"?: string;
        "value"?: string;
    }
    interface CustomNavigator {
        "defaultTab"?: number;
        "label"?: string;
        "navElements"?: { labelHtml: string; contentHtml: any; linkString?: string }[];
        "uuid"?: string;
    }
    interface CustomTabulator {
        "actionButtonTags"?: (string | { tag: string; props: any })[];
        "childRowDefault"?: Object;
        "columns": Array<CustomTabulatorColumn>;
        "componentTitle"?: string;
        "confirmBeforeDelete"?: boolean;
        "data"?: any;
        "download"?: { type: DownloadType; fileName: () => string | string; options: DownloadOptions };
        "editionMode"?: 'inline' | 'modal' | 'side' | 'bottom';
        "height"?: string | number | false;
        "idPropName"?: string;
        "index"?: string;
        "isDeletionPermited"?: boolean;
        "name": string;
        "onLoadedTable"?: (event: CustomTabulatorCustomEvent<{ table: CustomTabulatorRecMatching; componentName: string }>) => void;
        "onRowDeleted"?: (event: CustomTabulatorCustomEvent<{ row: RowComponent; componentName: string }>) => void;
        "onRowEditionButtonClicked"?: (event: CustomTabulatorCustomEvent<{ row: RowComponent; componentName: string }>) => void;
        "onRowSaved"?: (event: CustomTabulatorCustomEvent<{ rows: RowComponent[]; componentName: string }>) => void;
        "onRowSelected"?: (event: CustomTabulatorCustomEvent<{ rows: RowComponent[]; componentName: string }>) => void;
        "onRows"?: (event: CustomTabulatorCustomEvent<{ rows: RowComponent[]; componentName: string }>) => void;
        "onTableBuilt"?: (event: CustomTabulatorCustomEvent<{ table: CustomTabulatorRecMatching; componentName: string }>) => void;
        "options"?: Options;
        "postRoute"?: string;
        "readOnly"?: boolean | 'updateOnly' | 'createOnly';
        "requestHeaders"?: { [key: string]: string };
        "route": string;
        "rowDefault"?: Object;
        "tabEndNewRow"?: boolean;
        "tabulatorComponent"?: TabulatorFull;
        "tabulatorLayout"?: 'fitDataStretch' | 'fitData' | 'fitColumns' | 'fitDataFill' | 'fitDataTable';
        "treeConfig"?: false | { childField: string; parentField: string; hideAddChild?: (row: any) => boolean };
    }
    interface MarkdownEditor {
        "onValueChanged"?: (event: MarkdownEditorCustomEvent<string>) => void;
        "textareaStyle"?: { [key: string]: string };
        "value"?: string;
    }
    interface MarkdownPreview {
        "markdown"?: string;
    }
    interface NavButton {
        "entityCode"?: string;
        "href"?: string;
        "relatedTo"?: string;
    }
    interface ScheduleButton {
        "schedule"?: string;
    }
    interface TestCustomNavigator {
    }
    interface TestCustomTabulator {
    }
    interface TestMarkdown {
    }
    interface TestRoot {
    }
    interface IntrinsicElements {
        "code-editor": CodeEditor;
        "custom-navigator": CustomNavigator;
        "custom-tabulator": CustomTabulator;
        "markdown-editor": MarkdownEditor;
        "markdown-preview": MarkdownPreview;
        "nav-button": NavButton;
        "schedule-button": ScheduleButton;
        "test-custom-navigator": TestCustomNavigator;
        "test-custom-tabulator": TestCustomTabulator;
        "test-markdown": TestMarkdown;
        "test-root": TestRoot;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "code-editor": LocalJSX.CodeEditor & JSXBase.HTMLAttributes<HTMLCodeEditorElement>;
            "custom-navigator": LocalJSX.CustomNavigator & JSXBase.HTMLAttributes<HTMLCustomNavigatorElement>;
            "custom-tabulator": LocalJSX.CustomTabulator & JSXBase.HTMLAttributes<HTMLCustomTabulatorElement>;
            "markdown-editor": LocalJSX.MarkdownEditor & JSXBase.HTMLAttributes<HTMLMarkdownEditorElement>;
            "markdown-preview": LocalJSX.MarkdownPreview & JSXBase.HTMLAttributes<HTMLMarkdownPreviewElement>;
            "nav-button": LocalJSX.NavButton & JSXBase.HTMLAttributes<HTMLNavButtonElement>;
            "schedule-button": LocalJSX.ScheduleButton & JSXBase.HTMLAttributes<HTMLScheduleButtonElement>;
            "test-custom-navigator": LocalJSX.TestCustomNavigator & JSXBase.HTMLAttributes<HTMLTestCustomNavigatorElement>;
            "test-custom-tabulator": LocalJSX.TestCustomTabulator & JSXBase.HTMLAttributes<HTMLTestCustomTabulatorElement>;
            "test-markdown": LocalJSX.TestMarkdown & JSXBase.HTMLAttributes<HTMLTestMarkdownElement>;
            "test-root": LocalJSX.TestRoot & JSXBase.HTMLAttributes<HTMLTestRootElement>;
        }
    }
}
