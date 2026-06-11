import { onBeforeUnmount, type Ref, ref, watch } from 'vue';

/**
 * Keeps a dialog mounted for a short delay after it closes so the close
 * animation can finish playing. Shared by Dialog.vue and AlertDialog.vue.
 *
 * @param isOpen   getter for the dialog's open state (e.g. `() => props.open`)
 * @param closeDelay  how long (ms) to keep the DOM after closing
 * @returns `internalOpen` (live open state, also mutable by the caller) and
 *          `shouldRender` (whether the dialog DOM should currently exist)
 */
export function useDialogTransition(
  isOpen: () => boolean,
  closeDelay = 200,
): { internalOpen: Ref<boolean>; shouldRender: Ref<boolean> } {
  const internalOpen = ref(isOpen());
  const shouldRender = ref(isOpen());
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  watch(isOpen, (val) => {
    internalOpen.value = val;
    if (val) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      shouldRender.value = true;
    } else {
      closeTimer = setTimeout(() => {
        shouldRender.value = false;
      }, closeDelay);
    }
  });

  onBeforeUnmount(() => {
    if (closeTimer) clearTimeout(closeTimer);
  });

  return { internalOpen, shouldRender };
}
