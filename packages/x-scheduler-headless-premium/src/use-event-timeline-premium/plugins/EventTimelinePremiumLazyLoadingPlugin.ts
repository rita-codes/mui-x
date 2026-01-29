import { SchedulerLazyLoadingPlugin } from '../../internals/plugins/SchedulerLazyLoadingPlugin';
import {
  EventTimelinePremiumState,
  EventTimelinePremiumParameters,
} from '../EventTimelinePremiumStore.types';
import type { EventTimelinePremiumStore } from '../EventTimelinePremiumStore';
import { eventTimelinePremiumViewSelectors } from '../../event-timeline-premium-selectors';

export class EventTimelinePremiumLazyLoadingPlugin<
  TEvent extends object,
> extends SchedulerLazyLoadingPlugin<
  TEvent,
  EventTimelinePremiumState,
  EventTimelinePremiumParameters<TEvent, any>
> {
  constructor(store: EventTimelinePremiumStore<TEvent, any>) {
    super(store);

    store.registerStoreEffect(
      (state) => {
        // Use the existing selector that calculates start/end based on view and visibleDate
        const viewConfig = eventTimelinePremiumViewSelectors.config(state);

        // Create a stable key to detect real changes in the range
        const rangeKey = `${state.adapter.getTime(viewConfig.start)}|${state.adapter.getTime(viewConfig.end)}`;

        return {
          rangeKey,
          viewConfig,
        };
      },

      (previous, next) => {
        // Do nothing if the range didn't change
        if (previous.rangeKey === next.rangeKey) {
          return;
        }

        // Instant load on initial mount
        const isInstantLoad = previous.viewConfig == null;

        if (!store.parameters.dataSource) {
          return;
        }

        const range = {
          start: next.viewConfig.start,
          end: next.viewConfig.end,
        };

        queueMicrotask(() => this.queueDataFetchForRange(range, isInstantLoad));
      },
    );
  }
}
