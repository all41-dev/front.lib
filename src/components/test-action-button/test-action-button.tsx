import { Component, Env, Prop, h } from '@stencil/core';
import Swal from 'sweetalert2';

@Component({
  tag: 'test-action-button',
  styleUrl: 'test-action-button.css',
  shadow: false,
})
export class TestActionButton {
  @Prop({ mutable: true }) tableid: string;
  @Prop() relatedto: string;

  private async handleClick() {
    const result = await Swal.fire({
      title: 'View API Documentation?',
      text: 'You will be redirected to the documentation page.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Open Documentation',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      window.location.href = `${Env.apiUrl}`;
    }
  }

  render() {
    if (this.tableid == '1' || this.tableid == 'undefined') return null;
    else {
      return (
        <button onClick={() => this.handleClick()} part="button" class="btn btn-sm btn-outline-secondary" title="Open API documentation">
          View Documentation
        </button>
      );
    }
  }
}
