import { Component, Prop, h, Watch } from '@stencil/core';
import * as bootstrap from 'bootstrap';

@Component({
  tag: 'custom-navigator',
  styleUrl: 'custom-navigator.css',
  shadow: false,
})
export class CustomNavigators {
  @Prop() navElements: { labelHtml: string; contentHtml: any; linkString?: string }[];
  @Prop() defaultTab: number = 0;

  componentWillLoad() {
    this.initializeTab();
  }

  @Watch('defaultTab')
  watchDefaultTab(_newValue: number) {
    this.initializeTab();
  }

  initializeTab() {
    const tabs = document.querySelectorAll('.nav-link');
    if (tabs && tabs.length > this.defaultTab) {
      const defaultTabElement = tabs[this.defaultTab] as HTMLElement;
      const tabInstance = new bootstrap.Tab(defaultTabElement);
      tabInstance.show();
    } else {
      console.warn('Active tab index is out of range or tabs not found.');
    }
  }

  renderTabContent(item: { labelHtml: string; contentHtml: any }, index: number) {
    return (
      <div
        class={`tab-pane ${index === this.defaultTab ? 'active' : ''}`}
        id={`tab-${index}`}
        role="tabpanel"
        aria-labelledby={`tab-${index}-tab`}
      >
        {item.contentHtml}
      </div>
    );
  }

  createButton() {
    return this.navElements.map((item, index) => {
      return (
        <li class="nav-item" role="presentation" key={index}>
          <button
            class={`nav-link ${index === this.defaultTab ? 'active' : ''}`}
            id={`tab-${index}-tab`}
            data-bs-toggle="tab"
            data-bs-target={`#tab-${index}`}
            type="button"
            role="tab"
            aria-controls={`tab-${index}`}
            aria-selected={index === this.defaultTab ? 'true' : 'false'}
            innerHTML={item.labelHtml}
            onClick={() => this.setActiveTab(index, item.linkString)}
          ></button>
        </li>
      );
    });
  }

  setActiveTab(_index: number, linkString?: string) {
    const currentUrl = window.location.pathname;
  
    const baseUrl = currentUrl.split('/').slice(0, 4).join('/');
  
    if (linkString) {
      const newUrl = `${baseUrl}/${linkString}`;
      window.history.pushState({}, '', newUrl);
    }
  }
  


  render() {
    return (
      <div>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          {this.createButton()}
        </ul>

        <div class="tab-content">
          {this.navElements.map((item, index) => this.renderTabContent(item, index))}
        </div>
      </div>
    );
  }
}
