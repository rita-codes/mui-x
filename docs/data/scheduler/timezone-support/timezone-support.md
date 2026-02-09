---
productId: x-scheduler
title: React Scheduler component
packageName: '@mui/x-scheduler'
githubLabel: 'scope: scheduler'
---

# Scheduler - Timezone Support

<p class="description">Display events correctly across different timezones.</p>

{{"component": "@mui/docs/ComponentLinkHeader", "design": false}}

:::warning
This package is not published yet.
:::

TODO: Issue #20394 - Create documentation and demos

{{"demo": "TimezoneDatasetInstantBased.js", "bg": "inline", "defaultCodeOpen": false}}

## Overview

Scheduler always renders dates in the timezone defined by the `displayTimezone` prop.

Event dates (`start`, `end`, etc.) represent fixed moments in time. This means an event
always represents the same moment, regardless of the timezone in which it is displayed.
Changing `displayTimezone` only affects how the date is shown to the user, not when the
event actually happens.

For example, an event with `start: 2024-01-10T13:00:00Z`:

- is displayed as `14:00` in `Europe/Paris` (UTC+1)
- is displayed as `08:00` in `America/New_York` (UTC-5)

In all cases, it is still the same event happening at the same instant in time.

Events can optionally define a `timezone` field. This field is metadata and does not
reinterpret or shift the event start or end dates.

The `timezone` field is only used internally in situations where wall-time matters, such as:

- Recurring event rules (RRULE)
- Daylight Saving Time calculations

For example:

```ts
const event = {
  start: new Date('2024-01-10T13:00:00Z'),
  end: new Date('2024-01-10T14:00:00Z'),
  timezone: 'Europe/Paris',
};
```

The `timezone` field does not affect the event dates. It is only used internally for recurrence and daylight saving time handling.

## Event date values

The `start`, `end`, and `exDates` fields of an event accept JavaScript `Date` objects,
timezone-aware date objects (such as `TZDate`), or ISO 8601 strings.

:::info
When using `Date` or `TZDate` objects, the timezone of the object itself is not used to
define event semantics. Only the instant it represents is taken into account.
:::

## Rendering behavior

Scheduler renders all events in the timezone defined by the `displayTimezone` prop.

Changing `displayTimezone` only affects how event dates are displayed in the UI.
It does not modify the event data or change when an event occurs.

## Creating an event

When creating events from the UI, the entered date/time is interpreted in the current `displayTimezone`.

The created event does not include an explicit `timezone` field.
As a result, when the event is processed, its original timezone is treated as `"default"`.

This may evolve in future releases to allow setting the event's original timezone explicitly (for example through the UI), while still rendering all events in the selected `displayTimezone`.

## Recurring events and timezones

While single events are updated using pure instants, recurring events define
a pattern that is evaluated in a specific timezone.

For example, consider a daily recurring event that happens every day at 09:00
in the `Europe/Paris` timezone:

```ts
const event = {
  start: new Date('2024-03-01T08:00:00Z'),
  end: new Date('2024-03-01T09:00:00Z'),
  timezone: 'Europe/Paris',
  rrule: { freq: 'DAILY' },
};
```

Even when daylight saving time starts, the event continues to happen at 09:00
local time in Europe/Paris.

To achieve this, Scheduler uses the event's timezone to interpret and update
the recurrence pattern correctly.

This is the only case where Scheduler intentionally operates on day/hour semantics
instead of pure instants.

:::info
Recurring event updates are pattern-based.
This is the only case where Scheduler intentionally operates on wall-time semantics
instead of pure instants.
:::

## String dates and wall-time events

Scheduler accepts ISO 8601 strings for `start`, `end`, and `exDates`.
The trailing `Z` determines how the string is interpreted:

### Instant-based strings (with `Z`)

A string ending with `Z` is treated as a UTC instant, identical to passing `new Date(value)`:

```ts
const event = {
  start: '2025-06-10T09:00:00Z',
  end: '2025-06-10T10:00:00Z',
  timezone: 'America/New_York',
};
```

This is equivalent to `start: new Date('2025-06-10T09:00:00Z')`.

### Wall-time strings (without `Z`)

A string **without** a trailing `Z` is interpreted as **wall-time** in `event.timezone`
(or `"default"` if `timezone` is not set):

```ts
const event = {
  start: '2025-06-10T09:00:00',
  end: '2025-06-10T10:00:00',
  timezone: 'America/New_York',
};
```

This means "09:00 in New York", regardless of whether daylight saving time applies.
Scheduler resolves the string to the correct instant using the event timezone.

{{"demo": "TimezoneDatasetWallTime.js", "bg": "inline", "defaultCodeOpen": false}}
