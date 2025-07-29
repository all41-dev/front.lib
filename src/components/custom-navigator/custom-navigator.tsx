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

  activeTab: number = 0;

  componentWillLoad() {
    this.activeTab = this.getInitialTabIndexFromUrl() ?? this.defaultTab;
  }

  componentDidLoad() {
    this.initializeTab();
  }

  @Watch('defaultTab')
  watchDefaultTab(_newValue: number) {
    this.activeTab = this.defaultTab;
    this.initializeTab();
  }

  getInitialTabIndexFromUrl(): number | null {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    const tabIndex = this.navElements?.findIndex(item => item.linkString === lastSegment);
    return tabIndex >= 0 ? tabIndex : null;
  }

  initializeTab() {
    const container = this.el.querySelector('#uniqueNavigator');
    const tabs = container?.querySelectorAll('.nav-link:not([data-bs-no-tab])');

    if (tabs && tabs.length > this.activeTab) {
      const defaultTabElement = tabs[this.activeTab] as HTMLElement;
      try {
        const tabInstance = new bootstrap.Tab(defaultTabElement);
        tabInstance.show();
      } catch (error) {
        console.error('Error while showing tab:', error);
      }
    }
  }

  renderTabContent(item: { labelHtml: string; contentHtml: any }, index: number) {
    return (
      <div class={`tab-pane fade ${index === this.activeTab ? 'show active' : ''}`} id={`tab-${index}`} role="tabpanel" aria-labelledby={`tab-${index}-tab`}>
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
            class={`nav-link ${index === this.activeTab ? 'active' : ''}`}
            id={`tab-${index}-tab`}
            data-bs-toggle="tab"
            data-bs-target={`#tab-${index}`}
            type="button"
            role="tab"
            aria-controls={`tab-${index}`}
            aria-selected={index === this.activeTab ? 'true' : 'false'}
            innerHTML={item.labelHtml}
            onClick={() => this.setActiveTab(index, item.linkString)}
          ></button>
        </li>,
      );
    });

    return buttons;
  }

  setActiveTab(index: number, linkString?: string) {
    this.activeTab = index;

    if (linkString) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      let newPath = [...pathSegments];

      if (this.navElements.some(item => item.linkString === pathSegments[pathSegments.length - 1])) {
        newPath.pop();
      }

      if (this.uuid && !newPath.includes(this.uuid)) {
        newPath.push(this.uuid);
      }

      newPath.push(linkString);

      const newUrl = '/' + newPath.join('/');
      window.history.pushState({}, '', newUrl);
    }

    this.initializeTab();
  }

  render() {
    return (
      <div id="uniqueNavigator" class="container-fluid my-3">
        <div class="row">
          <div class="col-12">
            <ul class="nav nav-tabs flex-wrap" id="myTab" role="tablist">
              {this.createButton()}
            </ul>
            <div class="tab-content">{this.navElements.map((item, index) => this.renderTabContent(item, index))}</div>
          </div>
        </div>
      </div>
    );
  }
}
