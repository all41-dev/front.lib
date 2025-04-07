// import { Component, Prop, State, h } from '@stencil/core';
// import markdownit from 'markdown-it';
// import Mermaid from "mermaid-it";

// @Component({
//   tag: 'mark-down',
//   styleUrl: 'markdown.css'
// })
// export class MarkDown {
//   @Prop() name: string;
//   @Prop() data: string;
//   @State() edit: string;
//   @State() md = markdownit().use(Mermaid);
//   @State() result = null;

//   componentWillLoad() {
//     this.edit = this.data;
//     this.result = this.md.render(this.data);
//   }

//   updateRender(value: string) {
//     this.edit = value;
//     this.result = this.md.render(this.edit);
//   }

//   markdownRender(data: string) {
//     const rendered = this.md.render(data);
//     return rendered;
//   }

//   render() {
//     return (
//       <div class="row pt-1">
//         <div class="col-6 ps-2" style={{ 'height': '700px', 'width': '500px' }}>
//           <textarea
//             name={this.name}
//             style={{ 'height': '700px', 'width': '500px' }}
//             innerHTML={this.data}
//             onInput={((e) => this.updateRender((e.target as HTMLTextAreaElement).value))}
//           ></textarea>
//         </div>
//         <div class="col-6 ps-2 ms-4" style={{ 'height': '700px', 'width': '500px' }}>
//           <div class="bg-light" style={{ 'height': '700px', 'width': '500px' }} innerHTML={this.result}></div>
//         </div>
//       </div >
//     );
//   }
// }
