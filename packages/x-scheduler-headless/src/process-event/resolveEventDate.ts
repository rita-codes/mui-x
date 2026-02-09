import type { TemporalSupportedObject, TemporalTimezone } from '../base-ui-copy/types';
import type { SchedulerEventDateInput } from '../models/event';
import type { Adapter } from '../use-adapter';

/**
 * Resolves a `SchedulerEventDateInput` to a `TemporalSupportedObject`.
 *
 * - Non-string values are returned as-is.
 * - Strings ending with `"Z"` are parsed as UTC instants.
 * - Strings without `"Z"` are interpreted as wall-time in `dataTimezone`.
 */
export function resolveEventDate(
  value: SchedulerEventDateInput,
  dataTimezone: TemporalTimezone,
  adapter: Adapter,
): TemporalSupportedObject {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.endsWith('Z')) {
    return adapter.date(value, 'default');
  }

  return adapter.date(value, dataTimezone);
}
