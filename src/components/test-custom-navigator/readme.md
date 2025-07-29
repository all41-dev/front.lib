# test-custom-navigator



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type  | Default     |
| -------- | --------- | ----------- | ----- | ----------- |
| `match`  | `match`   |             | `any` | `undefined` |


## Dependencies

### Used by

 - [test-root](../test-root)

### Depends on

- [test-custom-tabulator](../test-custom-tabulator)
- [test-markdown](../test-markdown)
- [custom-navigator](../custom-navigator)

### Graph
```mermaid
graph TD;
  test-custom-navigator --> test-custom-tabulator
  test-custom-navigator --> test-markdown
  test-custom-navigator --> custom-navigator
  test-custom-tabulator --> custom-tabulator
  custom-tabulator --> code-editor
  custom-tabulator --> markdown-editor
  test-markdown --> markdown-preview
  test-root --> test-custom-navigator
  style test-custom-navigator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
