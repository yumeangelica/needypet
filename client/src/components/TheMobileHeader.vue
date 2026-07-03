<template>
  <nav class="mobile-nav">
    <button class="mobile-nav-button"
      :class="{ 'is-current': route.name === 'home' }"
      :aria-current="route.name === 'home' ? 'page' : undefined" @click.prevent="navigateTo('home')">
      <PawPrint class="mobile-nav-icon" aria-hidden="true" />
      <span class="mobile-nav-label">Home</span>
    </button>
    <button class="mobile-nav-button"
      :class="{ 'is-current': route.name === 'profile' }"
      :aria-current="route.name === 'profile' ? 'page' : undefined" @click.prevent="navigateTo('profile')">
      <CircleUser class="mobile-nav-icon icon-strong" aria-hidden="true" />
      <span class="mobile-nav-label">Profile</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { CircleUser, PawPrint } from '@lucide/vue';
import { useRoute } from 'vue-router';
import router from '@/router';

const route = useRoute();

const navigateTo = (name: string) => {
  if (route.name !== name) {
    router.push({ name });
  }
};
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-index-mobile-nav);
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  height: var(--mobile-nav-reserve);
  border-radius: 18px 18px 0 0;
  background: var(--gradient-nav);
  box-shadow: var(--shadow-nav-up);
  padding-bottom: env(safe-area-inset-bottom);
  padding-inline: 0.75rem;
  box-sizing: border-box;
}

.mobile-nav-button {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  max-width: 220px;
  min-height: 48px;
  padding: 0.4rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  /* Darker tone keeps the small labels AA-readable on the pink gradient */
  color: var(--color-primary-foreground-strong);
  cursor: pointer;
  transition: var(--transition-interactive);
}

.mobile-nav-button.is-current {
  background: var(--color-pill-cream);
  border-color: var(--color-border-divider);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary-foreground);
}

.mobile-nav-button:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

.mobile-nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.mobile-nav-label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1.15;
}

@media (hover: hover) {
  .mobile-nav-button:hover {
    border-color: var(--color-border-divider);
    background: var(--color-pill-cream-soft);
    color: var(--color-primary-foreground);
  }
}

.mobile-nav-button:active {
  background: var(--color-pill-cream-strong);
  transform: scale(0.98);
}
</style>
