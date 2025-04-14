import { Component, Prop, h, Watch, Element } from '@stencil/core';
import * as bootstrap from 'bootstrap';

@Component({
  tag: 'custom-navigator',
  styleUrl: 'custom-navigator.css',
  shadow: false,
})
export class CustomNavigators {
  @Element() el: HTMLElement;
  @Prop() uuid?: string;
  @Prop() navElements: { labelHtml: string; contentHtml: any; linkString?: string }[];
  @Prop() defaultTab: number = 0;
  @Prop() label?: string;

  componentDidLoad() {
    this.initializeTab();
  }

  @Watch('defaultTab')
  watchDefaultTab(_newValue: number) {
    this.initializeTab();
  }

  initializeTab() {
    const container = this.el.querySelector('#uniqueNavigator');
    if (!container) {
      console.warn('Container not found!');
      return;
    }
    // Exclude elements with data-bs-no-tab
    const tabs = container.querySelectorAll('.nav-link:not([data-bs-no-tab])');

    if (tabs && tabs.length > this.defaultTab) {
      const defaultTabElement = tabs[this.defaultTab] as HTMLElement;

      try {
        const tabInstance = new bootstrap.Tab(defaultTabElement);
        tabInstance.show();
      } catch (error) {
        console.error('Error while showing tab:', error);
      }
    } else {
      console.warn('Active tab index is out of range or tabs not found.');
    }
  }

  renderTabContent(item: { labelHtml: string; contentHtml: any }, index: number) {
    return (
      <div class={`tab-pane ${index === this.defaultTab ? 'active' : ''}`} id={`tab-${index}`} role="tabpanel" aria-labelledby={`tab-${index}-tab`}>
        {item.contentHtml}
      </div>
    );
  }
  createButton() {
    const buttons = [];

    if (this.label) {
      buttons.push(
        <li class="nav-item" role="presentation" key="label">
          <button class="nav-link label-like" type="button" disabled data-bs-no-tab="true">
            {this.label}
          </button>
        </li>,
      );
    }

    this.navElements.forEach((item, index) => {
      buttons.push(
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
        </li>,
      );
    });

    return buttons;
  }

  setActiveTab(_index: number, linkString?: string) {
    const currentUrl = window.location.pathname;

    const baseUrl = currentUrl.split('/').slice(0, 4).join('/');

    if (linkString) {
      const newUrl = this.uuid ? `${baseUrl}/${this.uuid}/${linkString}` : `${baseUrl}/${linkString}`;
      window.history.pushState({}, '', newUrl);
    }
  }

  render() {
    return (
      <div id="uniqueNavigator">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          {this.createButton()}
        </ul>

        <div class="tab-content">{this.navElements.map((item, index) => this.renderTabContent(item, index))}</div>
      </div>
    );
  }
}
