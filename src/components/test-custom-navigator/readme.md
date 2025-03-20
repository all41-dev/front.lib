# test-custom-navigator



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [module-list](../module-list)
- [exchange-list](../exchange-list)
- [custom-navigator](../custom-navigator)

### Graph
```mermaid
graph TD;
  test-custom-navigator --> module-list
  test-custom-navigator --> exchange-list
  test-custom-navigator --> custom-navigator
  module-list --> custom-tabulator
  custom-tabulator --> code-editor
  custom-tabulator --> markdown-editor
  exchange-list --> custom-tabulator
  style test-custom-navigator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
