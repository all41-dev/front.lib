import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'nav-button',
  styleUrl: 'nav-button.css',
  shadow: false,
})
export class NavButton {
  @Prop() href: string;
  @Prop() entityCode: string;
  @Prop() relatedTo: string;

  render() {
    return (
      <a href={this.href}>
        <button class="btn btn-outline-primary me-2 ellipsis-button" type="button" id="button-addon1" title={`${this.entityCode} ${this.relatedTo}`}>
          {`${this.relatedTo} ${this.entityCode}`} <i class="bi bi-arrow-right-circle"></i>
        </button>
      </a>
    );
  }
}
