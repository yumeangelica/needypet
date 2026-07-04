import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AlertDialog from '@/components/ui/AlertDialog.vue';

// Stub the reka-ui Dialog primitives so the wrapper's own render/emit logic is
// under test rather than reka-ui's portal/teleport.
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
};

const mountAlert = (props: InstanceType<typeof AlertDialog>['$props']) =>
  mount(AlertDialog, { props, global: { stubs } });

describe('AlertDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title, message and default labels while open', () => {
    const wrapper = mountAlert({ open: true, title: 'Delete pet?', message: 'This is permanent.' });

    expect(wrapper.text()).toContain('Delete pet?');
    expect(wrapper.text()).toContain('This is permanent.');
    expect(wrapper.text()).toContain('Confirm');
    expect(wrapper.text()).toContain('Cancel');
  });

  it('uses the danger class on the confirm button for the danger variant', () => {
    const wrapper = mountAlert({ open: true, variant: 'danger', confirmLabel: 'Delete' });

    const confirmButton = wrapper.get('.alert-actions button:last-child');
    expect(confirmButton.classes()).toContain('danger');
    expect(confirmButton.text()).toBe('Delete');
  });

  it('emits confirm and cancel from the action buttons', async () => {
    const wrapper = mountAlert({ open: true });

    await wrapper.get('.alert-actions button:last-child').trigger('click');
    await wrapper.get('.alert-actions button:first-child').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('emits cancel when the underlying dialog closes', async () => {
    const wrapper = mountAlert({ open: true });

    await wrapper.findComponent({ name: 'DialogRoot' }).vm.$emit('update:open', false);

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('keeps content mounted for 200ms after closing, then removes it', async () => {
    const wrapper = mountAlert({ open: true });
    expect(wrapper.find('.portal-stub').exists()).toBe(true);

    await wrapper.setProps({ open: false });
    expect(wrapper.find('.portal-stub').exists()).toBe(true);

    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.portal-stub').exists()).toBe(false);
  });
});
