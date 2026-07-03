<template>
  <header class="desktop-header">
    <nav class="desktop-nav">
      <button class="desktop-nav-button"
        :class="{ 'is-current': route.name === 'home' }"
        :aria-current="route.name === 'home' ? 'page' : undefined"
        @click.prevent="navigateTo('home')">
        <PawPrint class="desktop-nav-icon" aria-hidden="true" />
        Home
      </button>
      <button class="desktop-nav-button desktop-nav-profile"
        :class="{ 'is-current': route.name === 'profile' }"
        :aria-current="route.name === 'profile' ? 'page' : undefined"
        @click.prevent="navigateTo('profile')">
        <CircleUser class="desktop-nav-icon icon-strong" :stroke-width="2.2" aria-hidden="true" />
        <span class="desktop-nav-label">{{ userName }}</span>
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { CircleUser, PawPrint } from '@lucide/vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const userName = computed(() => userStore.userName);

const navigateTo = (name: string) => {
  if (route.name !== name) {
    router.push({ name });
  }
};
</script>

<style scoped>
.desktop-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-header);
  background: var(--gradient-nav);
  box-shadow: var(--shadow-nav);
}

.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
}

.desktop-nav-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.4rem 0.95rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  /* Darker tone keeps 14px labels AA-readable on the pink gradient */
  color: var(--color-primary-foreground-strong);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.25;
  cursor: pointer;
  transition: var(--transition-interactive);
}

.desktop-nav-button.is-current {
  background: var(--color-pill-cream);
  border-color: var(--color-border-divider);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary-foreground);
}

.desktop-nav-profile {
  min-width: 0;
}

.desktop-nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.desktop-nav-label {
  min-width: 0;
  max-width: 42vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desktop-nav-button:focus-visible {
  outline: 2px solid var(--color-primary-foreground);
  outline-offset: 2px;
}

@media (hover: hover) {
  .desktop-nav-button:hover {
    border-color: var(--color-border-divider);
    background: var(--color-pill-cream-soft);
    color: var(--color-primary-foreground);
  }
}

.desktop-nav-button:active {
  background: var(--color-pill-cream-strong);
  transform: scale(0.98);
}
</style>
