import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/TheFooter.vue', () => ({ default: { template: '<footer />' } }));

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  onBeforeRouteLeave: vi.fn(),
}));

import PageAddPet from '@/pages/PageAddPet.vue';
import { useUserStore } from '@/store/user';

const birthdayInput = (wrapper: ReturnType<typeof mount>) => wrapper.find('input#addpet-birthday');

describe('PageAddPet - timezone-aware birthday', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    vi.useFakeTimers();
    // 23:30 UTC falls on different calendar days depending on the timezone,
    // which is exactly where the old UTC-based logic was off by one day.
    vi.setSystemTime(new Date('2026-06-22T23:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the user's timezone (ahead of UTC) for the max date", () => {
    const userStore = useUserStore();
    userStore.timezone = 'Pacific/Kiritimati'; // UTC+14 -> already 2026-06-23 local

    const wrapper = mount(PageAddPet);

    expect(birthdayInput(wrapper).attributes('max')).toBe('2026-06-23');
  });

  it("uses the user's timezone (behind UTC) for the max date", () => {
    const userStore = useUserStore();
    userStore.timezone = 'Pacific/Honolulu'; // UTC-10 -> still 2026-06-22 local

    const wrapper = mount(PageAddPet);

    expect(birthdayInput(wrapper).attributes('max')).toBe('2026-06-22');
  });

  it("accepts the current day in the user's timezone and reflects it back", async () => {
    const userStore = useUserStore();
    userStore.timezone = 'Pacific/Kiritimati';

    const wrapper = mount(PageAddPet);
    const input = birthdayInput(wrapper);

    // The user's "today" in their timezone (2026-06-23) must be selectable even
    // though it is "tomorrow" in UTC.
    await input.setValue('2026-06-23');
    await input.trigger('change');

    expect(birthdayInput(wrapper).attributes('value')).toBe('2026-06-23');
  });

  it("rejects a day in the future relative to the user's timezone", async () => {
    const userStore = useUserStore();
    userStore.timezone = 'Pacific/Honolulu'; // local today is 2026-06-22

    const wrapper = mount(PageAddPet);
    const input = birthdayInput(wrapper);

    await input.setValue('2026-06-24');
    await input.trigger('change');

    // Future date is not stored, so the input value stays empty.
    expect(birthdayInput(wrapper).attributes('value')).toBe('');
  });
});
