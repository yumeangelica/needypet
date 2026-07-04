import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Dialog from '@/components/ui/Dialog.vue';

// Stub the reka-ui Dialog primitives to plain elements so the wrapper's own
// open/render logic is under test rather than reka-ui's portal/teleport.
const stubs = {
  DialogRoot: {
    name: 'DialogRoot',
    props: ['open'],
    emits: ['update:open'],
    template: '<div><slot /></div>',
  },
  DialogPortal: { name: 'DialogPortal', template: '<div class="portal-stub"><slot /></div>' },
  DialogOverlay: { template: '<div />' },
  DialogContent: { template: '<div class="content-stub"><slot /></div>' },
  DialogTitle: { template: '<h2><slot /></h2>' },
  DialogDescription: { template: '<p><slot /></p>' },
  DialogClose: { template: '<button><slot /></button>' },
};

const mountDialog = (props: InstanceType<typeof Dialog>['$props']) =>
  mount(Dialog, { props, global: { stubs } });

describe('Dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders its content while open', () => {
    const wrapper = mountDialog({ open: true, title: 'Hello' });

    expect(wrapper.find('.portal-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello');
  });

  it('does not render content when it starts closed', () => {
    const wrapper = mountDialog({ open: false });

    expect(wrapper.find('.portal-stub').exists()).toBe(false);
  });

  it('keeps content mounted for 200ms after closing, then removes it', async () => {
    const wrapper = mountDialog({ open: true, title: 'Hello' });
    expect(wrapper.find('.portal-stub').exists()).toBe(true);

    await wrapper.setProps({ open: false });
    // Still rendered right after closing (exit animation window).
    expect(wrapper.find('.portal-stub').exists()).toBe(true);

    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.portal-stub').exists()).toBe(false);
  });

  it('cancels the pending unmount when re-opened within the delay', async () => {
    const wrapper = mountDialog({ open: true });

    await wrapper.setProps({ open: false });
    vi.advanceTimersByTime(100);
    await wrapper.setProps({ open: true });
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.portal-stub').exists()).toBe(true);
  });

  it('emits update:open when the underlying dialog requests a change', async () => {
    const wrapper = mountDialog({ open: true });

    // The wrapper wires handleOpenChange to DialogRoot's @update:open.
    await wrapper.findComponent({ name: 'DialogRoot' }).vm.$emit('update:open', false);

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });
});
