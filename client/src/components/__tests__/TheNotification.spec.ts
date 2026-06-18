import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import TheNotification from '@/components/TheNotification.vue';
import { useAppStore } from '@/store/app';

describe('TheNotification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('announces error as alert and success as status, without a type prefix', () => {
    const appStore = useAppStore();
    appStore.notifications = [
      { id: 1, message: 'Saved successfully', type: 'success', timestamp: 1 },
      { id: 2, message: 'Something failed', type: 'error', timestamp: 2 },
    ];

    const wrapper = mount(TheNotification, {
      props: { hasDesktopHeader: false },
    });

    const toasts = wrapper.findAll('.notification');
    expect(toasts).toHaveLength(2);

    const error = wrapper.get('.notification.error');
    expect(error.attributes('role')).toBe('alert');
    expect(error.attributes('aria-live')).toBe('assertive');

    const success = wrapper.get('.notification.success');
    expect(success.attributes('role')).toBe('status');
    expect(success.attributes('aria-live')).toBe('polite');

    // The raw "type:" prefix must not be rendered to users / assistive tech
    expect(wrapper.text()).not.toContain('success:');
    expect(wrapper.text()).toContain('Saved successfully');
  });

  it('marks the container as a labelled region', () => {
    useAppStore();
    const wrapper = mount(TheNotification, {
      props: { hasDesktopHeader: false },
    });

    const container = wrapper.get('.notification-container');
    expect(container.attributes('role')).toBe('region');
    expect(container.attributes('aria-label')).toBe('Notifications');
  });
});
