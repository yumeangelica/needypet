<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 bg-primary border-t border-card-border flex items-center justify-around h-16 md:hidden safe-area-bottom">
    <button
      class="flex flex-col items-center gap-1 py-2 px-3 bg-transparent border-none cursor-pointer transition-colors rounded-lg active:bg-white/25"
      :class="route.name === 'home' ? 'text-primary-foreground' : 'text-primary-foreground/80'" @click.prevent="navigateTo('home')">
      <div class="paw-header-container">
        <PawPrint class="size-5" />
      </div>
      <span class="text-xs font-sans">Home</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-2 px-3 bg-transparent border-none cursor-pointer transition-colors rounded-lg active:bg-white/25"
      :class="route.name === 'profile' ? 'text-primary-foreground' : 'text-primary-foreground/80'" @click.prevent="navigateTo('profile')">
      <CircleUser class="icon-strong size-5" />
      <span class="text-xs font-sans">Profile</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { PawPrint, CircleUser } from 'lucide-vue-next';
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
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>