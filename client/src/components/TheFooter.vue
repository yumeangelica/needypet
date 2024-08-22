<template>
  <div class="copyright">&copy; 2020 - {{ year }} yumeangelica.github.io. All Rights Reserved.</div>
</template>

<script setup lang="ts">

const year = new Date().getFullYear();

</script>

<style>
  .copyright {
    margin-top: 30px;
    font-size: 0.7rem;
    text-align: center;
  }

  @media (max-width: 568px) {
    .copyright {
      font-size: 0.55rem;
    }
  }
</style>