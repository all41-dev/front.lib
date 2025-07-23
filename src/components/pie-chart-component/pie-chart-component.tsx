import { Component, Prop, h, Element, Watch } from '@stencil/core';
import Chart from 'chart.js/auto';

@Component({
  tag: 'pie-chart-component',
  styleUrl: 'pie-chart-component.css',
  shadow: false,
})
export class PieChartComponent {
  @Prop() data: any[];
  @Prop() uniqueId: string;
  @Prop() compTitle: string;
  @Prop() processData: (data: any[]) => { labels: string[]; values: number[] };
  @Element() el: HTMLElement;

  private pieChart: any;

  componentDidLoad() {
    this.drawPieChart();
  }

  roundDownToNearest05(amount: number): number {
    return Math.floor(amount * 20) / 20;
  }

  @Watch('data')
  dataChanged() {
    this.refreshChart();
  }

  refreshChart() {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    this.drawPieChart();
  }
  formatCurrency(amount: number): string {
    const roundedAmount = this.roundDownToNearest05(amount);
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundedAmount);
  }

  drawPieChart() {
    const canvas = this.el.querySelector(`#${this.uniqueId}`) as HTMLCanvasElement;

    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    if (!this.data || this.data.length === 0) {
      console.error('No data available to render chart');
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }

    const { labels, values } = this.processData(this.data);

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: this.generateColors(labels.length),
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: context => {
                const label = context.label || '';
                const value = context.raw ?? 0;
                return `${label}: ${this.formatCurrency(+value)}`;
              },
            },
          },
          title: {
            display: true,
            text: `${this.compTitle}`,
            font: {
              size: 20,
            },
          },
        },
      },
    });
  }

  generateColors(length: number) {
    const colors = [];
    for (let i = 0; i < length; i++) {
      colors.push(`hsl(${(i * 360) / length}, 70%, 70%)`);
    }
    return colors;
  }

  render() {
    return (
      <div class="chart-container" style={{ width: '100%', maxWidth: '350px', height: '350px' }}>
        <canvas id={this.uniqueId} width="350" height="350"></canvas>
      </div>
    );
  }
}
