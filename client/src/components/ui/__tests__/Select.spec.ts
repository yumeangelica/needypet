import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Select from '@/components/ui/Select.vue';

const options = [
  { value: 'min', label: 'Minutes' },
  { value: 'h', label: 'Hours' },
];

// Stub the reka-ui Select primitives to plain elements so the wrapper's own
// prop forwarding and emit wiring are under test rather than reka-ui internals
// (SelectTrigger requires an async SelectRoot context that jsdom can't provide
// during a synchronous mount).
const stubs = {
  SelectRoot: {
    name: 'SelectRoot',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div><slot /></div>',
  },
  SelectTrigger: {
    props: ['ariaLabel'],
    template: '<button class="select-trigger" :aria-label="ariaLabel"><slot /></button>',
  },
  SelectValue: { props: ['placeholder'], template: '<span>{{ placeholder }}</span>' },
  SelectPortal: { template: '<div><slot /></div>' },
  SelectContent: { template: '<div><slot /></div>' },
  SelectViewport: { template: '<div><slot /></div>' },
  SelectItem: { props: ['value'], template: '<div class="select-item"><slot /></div>' },
  SelectItemText: { template: '<span><slot /></span>' },
  SelectItemIndicator: { template: '<span><slot /></span>' },
};

const mountSelect = (props: InstanceType<typeof Select>['$props']) =>
  mount(Select, { props, global: { stubs } });

describe('Select', () => {
  it('renders the trigger with the given aria-label and placeholder', () => {
    const wrapper = mountSelect({
      options,
      ariaLabel: 'Unit of measure',
      placeholder: 'Pick a unit',
    });

    const trigger = wrapper.get('.select-trigger');
    expect(trigger.attributes('aria-label')).toBe('Unit of measure');
    expect(wrapper.text()).toContain('Pick a unit');
  });

  it('renders one item per option', () => {
    const wrapper = mountSelect({ options, ariaLabel: 'Unit' });

    const items = wrapper.findAll('.select-item');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('Minutes');
    expect(wrapper.text()).toContain('Hours');
  });

  it('forwards the reka-ui model update as update:modelValue', async () => {
    const wrapper = mountSelect({ options, ariaLabel: 'Unit' });

    await wrapper.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'h');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['h']);
  });
});
