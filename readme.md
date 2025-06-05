# @all41-dev/front-lib

**Reusable Web Components Library**

This library provides a set of custom web components built with [StencilJS](https://stenciljs.com/), designed to simplify and enhance UI development across All41 applications.

It includes components like an extended Tabulator table, custom navigation handlers, and other reusable UI elements.

---

## Features

* **Custom Tabulator**
  A wrapper around [Tabulator](http://tabulator.info/) with enhanced functionality.

* **Custom Navigator**
  Lightweight components for handling dynamic route-based navigation in single-page applications.

* **Reusable UI Components**

---

## Installation

To install the library:

```bash
npm install @all41-dev/front-lib
```

---

## Usage

Import the components into your HTML or JS/TS frontend projects:

```ts
import '@all41-dev/front-lib';
```

In your HTML or JSX:

```html
<custom-tabulator></custom-tabulator>
<custom-navigator></custom-navigator>
```

You can configure each component via props or use it within a framework integration.

---

## Development

To build the components locally:

```bash
npm run build
```

To run the local dev server:

```bash
npm start
```

---

## Notes

* All components are written in [StencilJS](https://stenciljs.com/) and compiled as Web Components.
* These components are framework-agnostic and can be used in any modern frontend stack.