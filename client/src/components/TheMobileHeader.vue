<template>
  <nav class="mobile-nav fixed bottom-0 inset-x-0 z-50 bg-primary border-t border-card-border flex items-center justify-around md:hidden">
    <button
      class="mobile-nav-button flex flex-col items-center gap-1 py-2 px-3 bg-transparent border-none cursor-pointer transition-colors rounded-lg active:bg-white/25 focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2"
      :class="route.name === 'home' ? 'text-primary-foreground' : 'text-primary-foreground/80'"
      :aria-current="route.name === 'home' ? 'page' : undefined" @click.prevent="navigateTo('home')">
      <div class="paw-header-container">
        <PawPrint class="size-5" aria-hidden="true" />
      </div>
      <span class="text-xs font-sans">Home</span>
    </button>
    <button
      class="mobile-nav-button flex flex-col items-center gap-1 py-2 px-3 bg-transparent border-none cursor-pointer transition-colors rounded-lg active:bg-white/25 focus-visible:outline-2 focus-visible:outline-primary-foreground focus-visible:outline-offset-2"
      :class="route.name === 'profile' ? 'text-primary-foreground' : 'text-primary-foreground/80'"
      :aria-current="route.name === 'profile' ? 'page' : undefined" @click.prevent="navigateTo('profile')">
      <CircleUser class="icon-strong size-5" aria-hidden="true" />
      <span class="text-xs font-sans">Profile</span>
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
  height: var(--mobile-nav-reserve);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.mobile-nav-button {
  flex: 1 1 0;
  max-width: 220px;
  min-height: 48px;
}

@media (hover: hover) {
  .mobile-nav-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>
