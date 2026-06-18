import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Switch from '@/components/ui/Switch.vue';

describe('Switch', () => {
  it('forwards ariaLabel to the switch element', () => {
    const wrapper = mount(Switch, {
      props: { checked: false, ariaLabel: 'Toggle need active' },
    });

    const switchEl = wrapper.get('[role="switch"]');
    expect(switchEl.attributes('aria-label')).toBe('Toggle need active');
  });

  it('reflects the checked state via aria-checked', () => {
    const wrapper = mount(Switch, {
      props: { checked: true, ariaLabel: 'Toggle need active' },
    });

    expect(wrapper.get('[role="switch"]').attributes('aria-checked')).toBe('true');
  });
});
