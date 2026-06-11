import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TheLoadingSpinner from './TheLoadingSpinner.vue';

describe('TheLoadingSpinner', () => {
  it('renders the optional loading message', () => {
    const wrapper = mount(TheLoadingSpinner, {
      props: {
        message: 'Loading pet...',
      },
    });

    expect(wrapper.text()).toContain('Loading pet...');
  });
});
