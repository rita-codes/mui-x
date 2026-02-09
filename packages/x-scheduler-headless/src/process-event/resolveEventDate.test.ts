import { adapter } from 'test/utils/scheduler/adapters';
import { resolveEventDate } from '@mui/x-scheduler-headless/process-event';

describe('resolveEventDate', () => {
  it('passes through a Date object unchanged', () => {
    const date = new Date('2025-06-10T09:00:00Z');
    const result = resolveEventDate(date, 'America/New_York', adapter);
    expect(result).to.equal(date);
  });

  it('passes through a TZDate object unchanged', () => {
    const date = adapter.date('2025-06-10T09:00:00Z', 'America/New_York');
    const result = resolveEventDate(date, 'Europe/Paris', adapter);
    expect(result).to.equal(date);
  });

  it('parses a string with Z as a UTC instant', () => {
    const result = resolveEventDate('2025-06-10T09:00:00Z', 'America/New_York', adapter);
    const expected = new Date('2025-06-10T09:00:00Z');
    expect(adapter.getTime(result)).to.equal(expected.getTime());
  });

  it('parses a string without Z as wall-time in the given timezone', () => {
    const result = resolveEventDate('2025-06-10T09:00:00', 'America/New_York', adapter);
    // 09:00 in New York during summer (EDT = UTC-4) is 13:00 UTC
    expect(adapter.getTime(result)).to.equal(new Date('2025-06-10T13:00:00Z').getTime());
  });

  it('parses a string without Z with "default" timezone as a plain Date', () => {
    const result = resolveEventDate('2025-06-10T09:00:00', 'default', adapter);
    const expected = adapter.date('2025-06-10T09:00:00', 'default');
    expect(adapter.getTime(result)).to.equal(adapter.getTime(expected));
  });
});
