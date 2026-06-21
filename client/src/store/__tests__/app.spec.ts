import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/store/app';

describe('app store - updateScreenSize / isMobile', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sets isMobile to true for widths below 768', () => {
    const appStore = useAppStore();
    appStore.updateScreenSize(767);
    expect(appStore.isMobile).toBe(true);
  });

  it('sets isMobile to false for widths of 768 and above', () => {
    const appStore = useAppStore();
    appStore.updateScreenSize(768);
    expect(appStore.isMobile).toBe(false);
  });

  it('sets isMobile to false for large widths', () => {
    const appStore = useAppStore();
    appStore.updateScreenSize(1920);
    expect(appStore.isMobile).toBe(false);
  });
});

describe('app store - addNotification / removeNotification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a notification with the correct shape', () => {
    const appStore = useAppStore();
    appStore.addNotification('Hello', 'success');

    expect(appStore.notifications).toHaveLength(1);
    expect(appStore.notifications[0].message).toBe('Hello');
    expect(appStore.notifications[0].type).toBe('success');
    expect(appStore.notifications[0].id).toBeTypeOf('number');
  });

  it('auto-removes the notification after the duration elapses', () => {
    const appStore = useAppStore();
    appStore.addNotification('Auto-remove me', 'info', 3000);

    expect(appStore.notifications).toHaveLength(1);

    vi.advanceTimersByTime(3000);

    expect(appStore.notifications).toHaveLength(0);
  });

  it('does not auto-remove before the duration elapses', () => {
    const appStore = useAppStore();
    appStore.addNotification('Still here', 'error', 5000);

    vi.advanceTimersByTime(4999);

    expect(appStore.notifications).toHaveLength(1);
  });

  it('removeNotification removes the specific notification by id', () => {
    const appStore = useAppStore();
    appStore.addNotification('First', 'success');
    // Advance time so the second notification gets a different Date.now() id.
    vi.advanceTimersByTime(1);
    appStore.addNotification('Second', 'error');

    expect(appStore.notifications).toHaveLength(2);

    const firstId = appStore.notifications[0].id;
    appStore.removeNotification(firstId);

    expect(appStore.notifications).toHaveLength(1);
    expect(appStore.notifications[0].message).toBe('Second');
  });

  it('does not add a duplicate if the last notification has the same message and type', () => {
    const appStore = useAppStore();
    appStore.addNotification('Same message', 'success');
    appStore.addNotification('Same message', 'success');

    expect(appStore.notifications).toHaveLength(1);
  });

  it('does add if message is the same but type differs', () => {
    const appStore = useAppStore();
    appStore.addNotification('Same message', 'success');
    vi.advanceTimersByTime(1);
    appStore.addNotification('Same message', 'error');

    expect(appStore.notifications).toHaveLength(2);
  });

  it('uses the default duration of 5000ms', () => {
    const appStore = useAppStore();
    appStore.addNotification('Default duration', 'info');

    vi.advanceTimersByTime(4999);
    expect(appStore.notifications).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(appStore.notifications).toHaveLength(0);
  });
});

describe('app store - getTimezones', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns a non-empty array of timezone strings', async () => {
    const appStore = useAppStore();
    const tzs = await appStore.getTimezones();

    expect(Array.isArray(tzs)).toBe(true);
    expect(tzs.length).toBeGreaterThan(0);
    expect(tzs).toContain('Europe/Helsinki');
  });

  it('does not include UTC (Intl API excludes it)', async () => {
    const appStore = useAppStore();
    const tzs = await appStore.getTimezones();
    expect(tzs).not.toContain('UTC');
  });
});
