import { Component, h, Prop } from '@stencil/core';


@Component({
  tag: 'base-button',
  styleUrl: 'base-button.css',
  shadow: false,
})
export class BaseButton {
  @Prop() label?: string;

  @Prop() variant: string = 'primary';

  @Prop() size: string = 'md';

  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  @Prop() disabled: boolean = false;

  @Prop() full: boolean = false;

  @Prop() loading: boolean = false;

  private get classes() {
    const base =
      'inline-flex items-center justify-center rounded-lg font-medium transition ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
      'disabled:opacity-60 disabled:cursor-not-allowed';
    const sizeCls =
      this.size === 'sm'
        ? 'px-3 py-1.5 text-sm'
        : this.size === 'lg'
        ? 'px-5 py-3 text-lg'
        : 'px-4 py-2 text-base';
    const variantCls =
      this.variant === 'secondary'
        ? 'bg-secondary text-white hover:opacity-90'
        : this.variant === 'danger'
        ? 'bg-danger text-white hover:opacity-90'
        : 'bg-primary text-white hover:opacity-90';
    const width = this.full ? 'w-full' : '';
    return [base, sizeCls, variantCls, width].join(' ');
  }

  render() {
    console.log(this.classes);
    return (
      <button
        type={this.type}
        disabled={this.disabled || this.loading}
        aria-disabled={this.disabled ? 'true' : null}
        aria-busy={this.loading ? 'true' : null}
        class={this.classes}
      >
        {this.loading ? (
          <span class="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        ) : null}
        <slot>{this.label}</slot>
      </button>
    );
  }
}
