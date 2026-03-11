<template>
  <header class="sticky top-0 z-40 bg-primary">
    <nav class="flex items-center justify-between px-4 py-2">
      <button class="flex items-center gap-2 bg-transparent border-none cursor-pointer text-primary-foreground font-sans text-sm" @click.prevent="navigateTo('home')">
        <PawPrint class="size-5" />
        Home
      </button>
      <button class="flex items-center gap-2 bg-transparent border-none cursor-pointer text-primary-foreground font-sans text-sm" @click.prevent="navigateTo('profile')">
        <CircleUser class="size-5" />
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
