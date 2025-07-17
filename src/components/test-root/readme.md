# test-root



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [test-custom-navigator](../test-custom-navigator)

### Graph
```mermaid
graph TD;
  test-root --> test-custom-navigator
  test-custom-navigator --> test-custom-tabulator
  test-custom-navigator --> test-markdown
  test-custom-navigator --> custom-navigator
  test-custom-tabulator --> custom-tabulator
  custom-tabulator --> code-editor
  custom-tabulator --> markdown-editor
  style test-root fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
