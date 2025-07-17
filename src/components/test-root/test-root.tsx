import { Component, h } from '@stencil/core';

@Component({
  tag: 'test-root',
  styleUrl: 'test-root.css',
  shadow: false,
})
export class TestRoot {
  componentWillLoad() {
    console.log('Component is loading...');
  }

  render() {
    return (
      <main>
        <div class="container-fluid m-3">
          <test-custom-navigator />
        </div>
      </main>
    );
  }
}
