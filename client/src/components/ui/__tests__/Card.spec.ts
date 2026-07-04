import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';

describe('Card', () => {
  it('renders the slot inside the card shell', () => {
    const wrapper = mount(Card, { slots: { default: 'Body' } });

    const el = wrapper.get('div');
    expect(el.classes()).toContain('ui-card');
    expect(el.text()).toBe('Body');
  });

  it('merges a custom class through cn()', () => {
    const wrapper = mount(Card, { props: { class: 'extra' } });

    const classes = wrapper.get('div').classes();
    expect(classes).toContain('ui-card');
    expect(classes).toContain('extra');
  });
});

describe('CardContent', () => {
  it('renders the slot with the default padding class', () => {
    const wrapper = mount(CardContent, { slots: { default: 'Inner' } });

    const el = wrapper.get('div');
    expect(el.classes()).toContain('p-5');
    expect(el.text()).toBe('Inner');
  });

  it('merges a custom class through cn()', () => {
    const wrapper = mount(CardContent, { props: { class: 'extra' } });

    const classes = wrapper.get('div').classes();
    expect(classes).toContain('p-5');
    expect(classes).toContain('extra');
  });
});
