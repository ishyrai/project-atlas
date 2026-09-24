import { describe, expect, it } from 'vitest';
import type { Link } from '../../db/schema.js';
import { evaluateAvailability, isCountableClick } from './service.js';

function makeLink(overrides: Partial<Link> = {}): Link {
  return {
    id: 1,
    shortCode: 'abc123',
    shortUrl: 'https://short.example.com/abc123',
    mainUrl: 'https://example.com',
    urlHash: 'x'.repeat(64),
    domain: 'example.com',
    title: null,
    expiredStatus: 0,
    blacklisted: 0,
    flagged: 0,
    timesClicked: 0,
    qrGenerated: 0,
    reportCount: 0,
    expiresAt: null,
    lastClickedAt: null,
    deletedAt: null,
    adminNote: null,
    reqIp: null,
    reqAgent: null,
    timeIssued: new Date(),
    ...overrides,
  } as Link;
}

/**
 * `expiresAt` marks *when a link stops working*, so it is expired once that
 * timestamp is in the past. The redirect handler in `modules/redirect` derives
 * its own `expiredByTime` the same (correct) way and compares it against this
 * function's result; a link with a still-upcoming `expiresAt` disagreeing with
 * that comparison is exactly the bug this guards against
 * (`redirect availability is inconsistent with its expiry boundary`).
 */
describe('evaluateAvailability', () => {
  it('is not expired while expiresAt is still in the future', () => {
    const link = makeLink({ expiresAt: new Date(Date.now() + 24 * 60 * 60_000) });
    expect(evaluateAvailability(link)).toBe('active');
  });

  it('is expired once expiresAt has passed', () => {
    const link = makeLink({ expiresAt: new Date(Date.now() - 24 * 60 * 60_000) });
    expect(evaluateAvailability(link)).toBe('expired');
  });

  it('is active when there is no expiresAt at all', () => {
    const link = makeLink({ expiresAt: null });
    expect(evaluateAvailability(link)).toBe('active');
  });

  it('still honours the explicit expiredStatus flag regardless of expiresAt', () => {
    const link = makeLink({ expiredStatus: 1, expiresAt: new Date(Date.now() + 24 * 60 * 60_000) });
    expect(evaluateAvailability(link)).toBe('expired');
  });

  it('blocked and deleted still take priority over expiry', () => {
    expect(evaluateAvailability(makeLink({ blacklisted: 1 }))).toBe('blocked');
    expect(evaluateAvailability(makeLink({ deletedAt: new Date() }))).toBe('deleted');
  });

  it('reports not_found for a missing link', () => {
    expect(evaluateAvailability(null)).toBe('not_found');
    expect(evaluateAvailability(undefined)).toBe('not_found');
  });
});

/**
 * `recordClick` used to gate the `timesClicked` increment on `client.browser
 * !== null`, so a genuine (non-bot) click from a client ua-parser could not
 * name a browser for was silently never counted and logged as an error
 * (`click classification produced an incomplete counter update`). Counting
 * must depend only on whether the request is a bot.
 */
describe('isCountableClick', () => {
  it('counts a non-bot click even when no browser could be identified', () => {
    expect(isCountableClick({ isBot: false })).toBe(true);
  });

  it('counts a non-bot click when a browser was identified', () => {
    expect(isCountableClick({ isBot: false })).toBe(true);
  });

  it('never counts bot traffic', () => {
    expect(isCountableClick({ isBot: true })).toBe(false);
  });
});
