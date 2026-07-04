import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Button from '@/components/ui/Button.vue';

describe('Button', () => {
  it('renders a <button> with the default variant and size classes', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } });

    const el = wrapper.get('button');
    expect(el.text()).toBe('Save');
    expect(el.classes()).toContain('ui-button');
    expect(el.classes()).toContain('ui-button-default');
    expect(el.classes()).toContain('ui-button-default-size');
  });

  it('maps each variant to its class', () => {
    const variants = {
      destructive: 'ui-button-destructive',
      outline: 'ui-button-outline',
      ghost: 'ui-button-ghost',
      link: 'ui-button-link',
    } as const;

    for (const [variant, className] of Object.entries(variants)) {
      const wrapper = mount(Button, { props: { variant: variant as keyof typeof variants } });
      expect(wrapper.get('button').classes()).toContain(className);
    }
  });

  it('maps each size to its class', () => {
    const sizes = {
      sm: 'ui-button-sm',
      lg: 'ui-button-lg',
      icon: 'ui-button-icon',
    } as const;

    for (const [size, className] of Object.entries(sizes)) {
      const wrapper = mount(Button, { props: { size: size as keyof typeof sizes } });
      expect(wrapper.get('button').classes()).toContain(className);
    }
  });

  it('renders the element chosen by the `as` prop', () => {
    const wrapper = mount(Button, { props: { as: 'a' }, slots: { default: 'Link' } });

    expect(wrapper.find('a').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('merges a custom class through cn()', () => {
    const wrapper = mount(Button, { props: { class: 'my-extra-class' } });

    const classes = wrapper.get('button').classes();
    expect(classes).toContain('ui-button');
    expect(classes).toContain('my-extra-class');
  });
});
