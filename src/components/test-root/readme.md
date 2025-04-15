# test-root



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [test-custom-tabulator](../test-custom-tabulator)
- [markdown-preview](../markdown-preview)
- [test-custom-navigator](../test-custom-navigator)

### Graph
```mermaid
graph TD;
  test-root --> test-custom-tabulator
  test-root --> markdown-preview
  test-root --> test-custom-navigator
  test-custom-tabulator --> custom-tabulator
  custom-tabulator --> code-editor
  custom-tabulator --> markdown-editor
  test-custom-navigator --> custom-navigator
  style test-root fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
