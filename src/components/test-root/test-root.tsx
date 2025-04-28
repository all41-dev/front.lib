import { Component, h } from '@stencil/core';

@Component({
  tag: 'test-root',
  styleUrl: 'test-root.css',
  shadow: false,
})
export class TestRoot {
  public markdown = '# SpiderTruck';

  componentWillLoad() {
    console.log('Component is loading...');
  }

  render() {
    return (
      <main>
        <div class="container-fluid">
          <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="/">
                Test Root
              </a>
              <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <a href="/custom-tabulator" class="nav-link">
                      Custom Tabulator
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="/markdown-preview" class="nav-link">
                      Markdown Preview
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="/custom-navigator" class="nav-link">
                      Custom Navigator
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div class="row">
            <div class="col-md-12">
              <div class="card shadow-sm">
                <div class="card-body">
                  <div id="content">
                    {window.location.pathname === '/' && <test-custom-tabulator></test-custom-tabulator>}
                    {window.location.pathname === '/custom-tabulator' && <test-custom-tabulator></test-custom-tabulator>}
                    {window.location.pathname === '/markdown-preview' && <markdown-preview markdown={this.markdown}></markdown-preview>}
                    {window.location.pathname === '/custom-navigator' && <test-custom-navigator></test-custom-navigator>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
