<template>
  <header class="sticky top-0 z-40 bg-primary">
    <nav class="flex items-center justify-between px-4 py-2">
      <button
        class="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-sm rounded-lg px-3 py-1.5 transition-colors hover:bg-white/15 active:bg-white/25 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        :class="route.name === 'home' ? 'text-primary-foreground' : 'text-primary-foreground/80'"
        @click.prevent="navigateTo('home')">
        <div class="paw-header-container">
          <PawPrint class="size-5" />
        </div>
        Home
      </button>
      <button
        class="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-sm rounded-lg px-3 py-1.5 transition-colors hover:bg-white/15 active:bg-white/25 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        :class="route.name === 'profile' ? 'text-primary-foreground' : 'text-primary-foreground/80'"
        @click.prevent="navigateTo('profile')">
        <CircleUser class="icon-strong size-5" :stroke-width="2.2" />
        {{ userName }}
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PawPrint, CircleUser } from 'lucide-vue-next';
import { useUserStore } from '@/store/user';
import { useRouter, useRoute } from 'vue-router';

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