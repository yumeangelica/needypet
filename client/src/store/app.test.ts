import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from './app';

describe('app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-08T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks mobile state from screen width', () => {
    const appStore = useAppStore();

    appStore.updateScreenSize(767);
    expect(appStore.isMobile).toBe(true);

    appStore.updateScreenSize(768);
    expect(appStore.isMobile).toBe(false);
  });

  it('adds, deduplicates, and removes notifications', () => {
    const appStore = useAppStore();

    appStore.addNotification('Saved', 'success', 1000);
    appStore.addNotification('Saved', 'success', 1000);

    expect(appStore.notifications).toHaveLength(1);
    expect(appStore.notifications[0]).toMatchObject({
      message: 'Saved',
      type: 'success',
    });

    vi.advanceTimersByTime(1000);

    expect(appStore.notifications).toHaveLength(0);
  });
});
