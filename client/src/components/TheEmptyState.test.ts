import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TheEmptyState from './TheEmptyState.vue';

describe('TheEmptyState', () => {
  it('renders title and message', () => {
    const wrapper = mount(TheEmptyState, {
      props: {
        title: 'No pets yet',
        message: 'Add your first pet to get started.',
      },
    });

    expect(wrapper.text()).toContain('No pets yet');
    expect(wrapper.text()).toContain('Add your first pet to get started.');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('emits action when the optional action button is clicked', async () => {
    const wrapper = mount(TheEmptyState, {
      props: {
        title: 'No pets yet',
        message: 'Add your first pet to get started.',
        actionLabel: 'Add pet',
        actionIcon: 'addCircleOutline',
      },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('action')).toHaveLength(1);
  });
});
