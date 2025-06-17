import { Component, Prop, State, h } from '@stencil/core';
import * as bootstrap from 'bootstrap';
import { DateTime } from 'luxon';
import hd from 'humanize-duration';
import cronParser from 'cron-parser';

@Component({
  tag: 'schedule-button',
  shadow: false,
  styleUrl: 'schedule-button.css',
})
export class ShowSchedule {
  @State() scheduledPopover: bootstrap.Popover;
  @State() popoverContent: string;

  @Prop() schedule: string;

  showPopover() {
    const popoverButton = document.getElementById('popover');

    if (!this.scheduledPopover) {
      this.scheduledPopover = new bootstrap.Popover(popoverButton, {
        trigger: 'focus',
      });
      this.scheduledPopover.show();
    } else {
      this.scheduledPopover.hide();
      this.scheduledPopover = new bootstrap.Popover(popoverButton, {
        trigger: 'focus',
      });
      this.scheduledPopover.show();
    }
  }
  showScheduledPopover() {
    const cronExpression = this.schedule;
    const nextPollingInfo = this.getNextPolling(cronExpression);

    this.popoverContent = `Polling Schedule: ${cronExpression}<br/>${nextPollingInfo.formattedDuration}<br/>${nextPollingInfo.nextPollingDateTime}`;

    this.showPopover();
  }

  getNextPolling(cronExpression: string) {
    try {
      const options = {
        currentDate: new Date(),
      };

      const interval = cronParser.parseExpression(cronExpression, options);
      const nextPollingTime = interval.next();

      const now = DateTime.local();
      const diff = nextPollingTime.getTime() - now.toMillis();

      const formattedDuration = hd(diff, { round: true, largest: 2 });
      const nextPollingDateTime = nextPollingTime.toLocaleString();

      return {
        formattedDuration: `in ${formattedDuration}`,
        nextPollingDateTime: `at ${nextPollingDateTime}`,
      };
    } catch (error) {
      console.error('Error parsing cron expression:', error.message);
      return {
        formattedDuration: 'Invalid cron expression',
        nextPollingDateTime: 'Invalid cron expression',
      };
    }
  }

  render() {
    const isScheduled = this.schedule !== undefined && this.schedule !== null;
    return (
      <button
        onClick={() => this.showScheduledPopover()}
        type="button"
        id="popover"
        class="btn btn-outline-secondary mx-1"
        data-bs-toggle="popover"
        title="Scheduled for"
        data-bs-html="true"
        data-bs-content={
          isScheduled
            ? `Polling Schedule: ${this.schedule}<br>Next Polling is ${this.getNextPolling(this.schedule).formattedDuration}<br>Next Polling Date and Time: ${
                this.getNextPolling(this.schedule).nextPollingDateTime
              }`
            : 'Not scheduled'
        }
        disabled={!isScheduled}
      >
        {isScheduled ? 'Scheduled' : 'Not scheduled'}
      </button>
    );
  }
}
