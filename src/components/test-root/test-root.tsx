import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'test-root',
  styleUrl: 'test-root.css',
  shadow: false,
})
export class TestRoot {
  @State() isUnitTest: boolean = true;

  public markdown = '# SpiderTruck';

  componentWillLoad() {}

  render() {
    return (
      <main>
        <div class="container-fluid">
          <div class="row mt-2 mb-3">
            <div class="col-md-12">
              {/* <a href="/custom-tabulator">custom tabulator</a>
              <test-custom-tabulator></test-custom-tabulator>
              <br />
              <test-module-list></test-module-list>
              <br />
              <test-type-ahead></test-type-ahead>
              <markdown-preview markdown={this.markdown}></markdown-preview>
              <test-markdown></test-markdown>

              <test-custom-navigator></test-custom-navigator>
              <schedule-button schedule={undefined}></schedule-button>
              <nav-button href={'http://localhost:8000/front/modules/546ab7c8-0898-11eb-8dce-0050569653bd'} entityCode={'Some Entity'} relatedTo={'Modules'}></nav-button>
              <stencil-router>
                <stencil-route-switch scrollTopOffset={0}>
                  <stencil-route url="/" component="test-custom-tabulator" exact={true} />
                  <stencil-route url="/custom-tabulator" component="test-custom-tabulator" />
                </stencil-route-switch>
              </stencil-router> */}
            </div>
          </div>
        </div>
      </main>
    );
  }
}
