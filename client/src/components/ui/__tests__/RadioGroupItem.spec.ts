import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import RadioGroup from '@/components/ui/RadioGroup.vue';
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue';

describe('RadioGroupItem', () => {
  it('selects the item when the visible label is clicked', async () => {
    const wrapper = mount({
      components: { RadioGroup, RadioGroupItem },
      data: () => ({ selection: '' }),
      template: `
        <RadioGroup v-model="selection">
          <RadioGroupItem value="duration" label="Duration" />
          <RadioGroupItem value="quantity" label="Quantity" />
        </RadioGroup>
      `,
    });

    wrapper
      .get('.radio-group-label')
      .element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(wrapper.vm.selection).toBe('duration');
  });

  it('renders the whole option with the clickable pill label class', () => {
    const wrapper = mount({
      components: { RadioGroup, RadioGroupItem },
      template: `
        <RadioGroup>
          <RadioGroupItem value="quantity" label="Quantity" />
        </RadioGroup>
      `,
    });

    expect(wrapper.get('.radio-group-label').text()).toContain('Quantity');
    expect(wrapper.find('.radio-group-control').exists()).toBe(true);
  });
});
