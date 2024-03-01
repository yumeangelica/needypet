<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="userName">Username</label>
        <input type="text" id="userName" placeholder="Username" v-model="userName">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Password" v-model="password">
      </div>
      <button type="submit" class="login-button">Login</button>
      <div v-if="loginError" class="error-message">
        Signing in failed. Please check your credentials and try again.
      </div>
    </form>
  </div>
</template>

<script>
import { loginUser } from '@/services/auth';

export default {
  data() {
    return {
      userName: '',
      password: '',
      loginError: false,
    };
  },
  methods: {
    async login() {
      this.loginError = false; // Reset error on new submission
      const isSuccess = await loginUser(this.userName, this.password);
      if (!isSuccess) {
        this.loginError = true;
        return false;
      }
        this.$router.replace({ name: 'home' });
        return true;
    },
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Use full screen height */
}

.login-form {
  width: 100%;
  max-width: 320px; /* Set max-width for the form */
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add shadow for better styling */
}

.form-group {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: #5c6bc0;
  border: none;
  color: white;
  cursor: pointer;
}

.login-button:hover {
  background-color: #3f51b5;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 20px;
}
</style>
