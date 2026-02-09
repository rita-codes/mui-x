// Timezone Events Dataset Wall-Time
// Events defined using wall-time strings (no trailing Z).

import { SchedulerEvent, SchedulerResource } from '@mui/x-scheduler/models';

export const resources: SchedulerResource[] = [
  { id: 'ny', title: 'New York', eventColor: 'purple' },
  { id: 'paris', title: 'Paris', eventColor: 'teal' },
  { id: 'tokyo', title: 'Tokyo', eventColor: 'orange' },
];

export const defaultVisibleDate = new Date('2025-06-10T00:00:00Z');

export const initialEvents: SchedulerEvent[] = [
  {
    id: 'ny-morning',
    title: 'NY Morning standup',
    start: '2025-06-10T09:00:00',
    end: '2025-06-10T09:30:00',
    timezone: 'America/New_York',
    resource: 'ny',
  },
  {
    id: 'paris-lunch',
    title: 'Paris Lunch meeting',
    start: '2025-06-10T12:00:00',
    end: '2025-06-10T13:00:00',
    timezone: 'Europe/Paris',
    resource: 'paris',
  },
  {
    id: 'tokyo-afternoon',
    title: 'Tokyo Review',
    start: '2025-06-10T15:00:00',
    end: '2025-06-10T16:00:00',
    timezone: 'Asia/Tokyo',
    resource: 'tokyo',
  },
  {
    id: 'ny-utc-instant',
    title: 'NY event (UTC instant)',
    start: '2025-06-11T13:00:00Z',
    end: '2025-06-11T14:00:00Z',
    timezone: 'America/New_York',
    resource: 'ny',
  },
];
