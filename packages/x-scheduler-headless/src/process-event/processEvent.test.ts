import { adapter } from 'test/utils/scheduler/adapters';
import { processEvent } from '@mui/x-scheduler-headless/process-event';
import { EventBuilder } from 'test/utils/scheduler/event-builder';

describe('processEvent', () => {
  it('keeps event timezone in modelInBuiltInFormat', () => {
    const event = EventBuilder.new(adapter)
      .withDataTimezone('America/New_York')
      .span('2025-01-01T10:00:00Z', '2025-01-01T12:00:00Z')
      .build();

    const processed = processEvent(event, 'Pacific/Kiritimati', adapter);

    expect(processed.modelInBuiltInFormat.timezone).to.equal('America/New_York');
  });

  it('should fallback to "default" timezone when event.timezone is not provided', () => {
    const event = EventBuilder.new().build();

    const processed = processEvent(event, 'Europe/Paris', adapter);

    expect(processed.dataTimezone.timezone).to.equal('default');
    expect(processed.displayTimezone.timezone).to.equal('Europe/Paris');
  });

  describe('displayTimezone', () => {
    it('converts start and end to the display timezone', () => {
      const event = EventBuilder.new(adapter)
        .span('2025-01-01T10:00:00Z', '2025-01-01T12:00:00Z')
        .build();

      const processed = processEvent(event, 'Pacific/Kiritimati', adapter);
      expect(adapter.getTimezone(processed.displayTimezone.start.value)).to.equal(
        'Pacific/Kiritimati',
      );
      expect(adapter.getTimezone(processed.displayTimezone.end.value)).to.equal(
        'Pacific/Kiritimati',
      );
      expect(processed.displayTimezone.start.toString()).to.not.equal(event.start.toString());
      expect(processed.displayTimezone.end.toString()).to.not.equal(event.end.toString());
    });

    it('converts exDates to the display timezone', () => {
      const event = EventBuilder.new(adapter).exDates(['2025-01-05T00:00:00Z']).build();
      const processed = processEvent(event, 'America/New_York', adapter);

      expect(processed.displayTimezone.exDates).to.have.length(1);
      expect(adapter.getTimezone(processed.displayTimezone.exDates![0])).to.equal(
        'America/New_York',
      );
    });

    it('converts rrule.until to the display timezone when rrule is an object', () => {
      const event = EventBuilder.new(adapter)
        .rrule({
          freq: 'DAILY',
          until: adapter.date('2025-01-10T23:59:00Z', 'default'),
        })
        .build();

      const processed = processEvent(event, 'Asia/Tokyo', adapter);

      expect(adapter.getTimezone(processed.displayTimezone.rrule!.until!)).to.equal('Asia/Tokyo');
    });

    it('parses rrule string and applies timezone conversion to UNTIL', () => {
      const event = EventBuilder.new(adapter).build();

      const processed = processEvent(
        {
          ...event,
          rrule: 'FREQ=DAILY;UNTIL=20250110T230000Z',
        },
        'Pacific/Kiritimati',
        adapter,
      );

      expect(adapter.getTimezone(processed.displayTimezone.rrule!.until!)).to.equal(
        'Pacific/Kiritimati',
      );
    });
  });
  describe('dataTimezone', () => {
    it('keeps original timezone in dataTimezone', () => {
      const event = EventBuilder.new(adapter)
        .withDataTimezone('America/New_York')
        .span('2025-01-01T10:00:00Z', '2025-01-01T12:00:00Z')
        .build();

      const processed = processEvent(event, 'Pacific/Kiritimati', adapter);

      expect(processed.dataTimezone.timezone).to.equal('America/New_York');
    });
  });

  describe('string date parsing', () => {
    describe('instant-based strings (with Z)', () => {
      it('parses start/end strings ending with Z as UTC instants', () => {
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00Z', '2025-06-10T10:00:00Z')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.dataTimezone.start.timestamp).to.equal(
          new Date('2025-06-10T09:00:00Z').getTime(),
        );
        expect(processed.dataTimezone.end.timestamp).to.equal(
          new Date('2025-06-10T10:00:00Z').getTime(),
        );
      });

      it('produces identical timestamps as equivalent Date object input', () => {
        const stringEvent = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00Z', '2025-06-10T10:00:00Z')
          .build();

        const dateEvent = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .span('2025-06-10T09:00:00Z', '2025-06-10T10:00:00Z')
          .build();

        const processedString = processEvent(stringEvent, 'Europe/Paris', adapter);
        const processedDate = processEvent(dateEvent, 'Europe/Paris', adapter);

        expect(processedString.dataTimezone.start.timestamp).to.equal(
          processedDate.dataTimezone.start.timestamp,
        );
        expect(processedString.dataTimezone.end.timestamp).to.equal(
          processedDate.dataTimezone.end.timestamp,
        );
      });

      it('preserves original string in modelInBuiltInFormat', () => {
        const event = EventBuilder.new(adapter)
          .spanWallTime('2025-06-10T09:00:00Z', '2025-06-10T10:00:00Z')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.modelInBuiltInFormat.start).to.equal('2025-06-10T09:00:00Z');
        expect(processed.modelInBuiltInFormat.end).to.equal('2025-06-10T10:00:00Z');
      });
    });

    describe('wall-time strings (without Z)', () => {
      it('interprets string without Z in event.timezone', () => {
        // 09:00 in New York during summer (EDT = UTC-4) should be 13:00 UTC
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00', '2025-06-10T10:00:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.dataTimezone.start.timestamp).to.equal(
          new Date('2025-06-10T13:00:00Z').getTime(),
        );
        expect(processed.dataTimezone.end.timestamp).to.equal(
          new Date('2025-06-10T14:00:00Z').getTime(),
        );
      });

      it('falls back to "default" when event.timezone is not provided', () => {
        const event = EventBuilder.new(adapter)
          .spanWallTime('2025-06-10T09:00:00', '2025-06-10T10:00:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        // Without timezone, the string is interpreted in the "default" timezone
        const expectedStart = adapter.date('2025-06-10T09:00:00', 'default');
        expect(processed.dataTimezone.start.timestamp).to.equal(adapter.getTime(expectedStart));
      });

      it('converts wall-time dates to display timezone correctly', () => {
        // 09:00 in New York (EDT = UTC-4) should display as 15:00 in Paris (CEST = UTC+2) in summer
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00', '2025-06-10T10:00:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(adapter.getHours(processed.displayTimezone.start.value)).to.equal(15);
        expect(adapter.getHours(processed.displayTimezone.end.value)).to.equal(16);
      });

      it('preserves original string in modelInBuiltInFormat', () => {
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00', '2025-06-10T10:00:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.modelInBuiltInFormat.start).to.equal('2025-06-10T09:00:00');
        expect(processed.modelInBuiltInFormat.end).to.equal('2025-06-10T10:00:00');
      });
    });

    describe('exDates with strings', () => {
      it('parses string exDates with Z as instants', () => {
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00Z', '2025-06-10T10:00:00Z')
          .exDatesWallTime(['2025-06-17T09:00:00Z'])
          .rrule({ freq: 'WEEKLY', byDay: ['TU'] })
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.dataTimezone.exDates).to.have.length(1);
        expect(adapter.getTime(processed.dataTimezone.exDates![0])).to.equal(
          new Date('2025-06-17T09:00:00Z').getTime(),
        );
      });

      it('parses string exDates without Z in event.timezone', () => {
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-06-10T09:00:00', '2025-06-10T10:00:00')
          .exDatesWallTime(['2025-06-17T09:00:00'])
          .rrule({ freq: 'WEEKLY', byDay: ['TU'] })
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.dataTimezone.exDates).to.have.length(1);
        // 09:00 New York EDT = 13:00 UTC
        expect(adapter.getTime(processed.dataTimezone.exDates![0])).to.equal(
          new Date('2025-06-17T13:00:00Z').getTime(),
        );
      });
    });

    describe('DST edge cases', () => {
      it('handles spring-forward: wall-time in DST gap still produces valid dates', () => {
        // US spring-forward 2025: March 9, 2:00 AM → 3:00 AM in America/New_York
        // Setting a wall-time of 01:30 → 03:30 across the gap
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-03-09T01:30:00', '2025-03-09T03:30:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        // Both should resolve to valid timestamps and the event should have positive duration
        expect(processed.dataTimezone.start.timestamp).to.be.a('number');
        expect(processed.dataTimezone.end.timestamp).to.be.a('number');
        expect(processed.dataTimezone.end.timestamp).to.be.greaterThan(
          processed.dataTimezone.start.timestamp,
        );
      });

      it('handles fall-back: wall-time in ambiguous period still produces valid dates', () => {
        // US fall-back 2025: November 2, 2:00 AM → 1:00 AM in America/New_York
        // Setting a wall-time of 01:30 is ambiguous (exists in both EDT and EST)
        const event = EventBuilder.new(adapter)
          .withDataTimezone('America/New_York')
          .spanWallTime('2025-11-02T01:30:00', '2025-11-02T02:30:00')
          .build();

        const processed = processEvent(event, 'Europe/Paris', adapter);

        expect(processed.dataTimezone.start.timestamp).to.be.a('number');
        expect(processed.dataTimezone.end.timestamp).to.be.a('number');
        expect(processed.dataTimezone.end.timestamp).to.be.greaterThan(
          processed.dataTimezone.start.timestamp,
        );
      });
    });
  });
});
