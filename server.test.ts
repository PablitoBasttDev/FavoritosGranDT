import { describe, it, expect, beforeAll } from 'vitest';

let formatPromiedosSchedule: (start_time: string) => {
  dateStr: string;
  kickoff: string;
  displayTime: string;
};

beforeAll(async () => {
  // server.ts starts a standalone HTTP listener + a 45s background sync interval on import
  // unless it thinks it's running as a Vercel Serverless Function. Setting this mirrors
  // production behavior and keeps the test process from hanging on an open server/timer.
  process.env.VERCEL = '1';
  ({ formatPromiedosSchedule } = await import('./server.js'));
});

describe('formatPromiedosSchedule', () => {
  // Regression coverage for two real production bugs:
  //   1. An old "+4h" conversion assumed Promiedos raw times were UTC-7.
  //   2. A later, differently-broken deploy showed times 2h earlier than actual.
  // Verified against independently-reported real kickoffs for Clausura 2026 fixtures
  // (Barracas-Argentinos 07/09 19:00, Newell's-Vélez 11/09 17:00, Huracán-Racing 13/09 21:30):
  // Promiedos' raw "start_time" is already Argentina local time (ART, UTC-3, fixed, no DST) and
  // must be passed through unchanged - never shifted.
  it('passes raw Promiedos times through unchanged', () => {
    expect(formatPromiedosSchedule('07-09-2026 19:00').kickoff).toBe('2026-09-07T19:00:00-03:00');
    expect(formatPromiedosSchedule('11-09-2026 17:00').kickoff).toBe('2026-09-11T17:00:00-03:00');
    expect(formatPromiedosSchedule('13-09-2026 21:30').kickoff).toBe('2026-09-13T21:30:00-03:00');
  });

  it('never shifts the hour, whatever it is', () => {
    const { kickoff, displayTime } = formatPromiedosSchedule('11-09-2026 17:00');
    expect(kickoff).toContain('T17:00:00');
    expect(displayTime).toContain('17:00 hs');
  });

  it('builds the correct Spanish day-of-week and display strings', () => {
    const result = formatPromiedosSchedule('11-09-2026 17:00');
    expect(result.displayTime).toBe('Viernes 11/09 • 17:00 hs');
    expect(result.dateStr).toBe('Viernes 11 de Septiembre de 2026');
  });

  it('returns safe placeholders for a missing start_time', () => {
    const result = formatPromiedosSchedule('');
    expect(result.kickoff).toBe('');
    expect(result.displayTime).toBe('Horario a confirmar');
  });

  it('returns the raw string as a placeholder when it does not match the expected format', () => {
    const result = formatPromiedosSchedule('unparseable-value');
    expect(result.kickoff).toBe('');
    expect(result.displayTime).toBe('unparseable-value');
  });
});
