<template>
  <div class="container">
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">AuthX Login</h3>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading">Logging in...</span>
                <span v-else>Login</span>
              </button>
            </form>

            <div class="mt-3 text-center">
              <router-link to="/forgot-password">Forgot Password?</router-link>
            </div>
            <div class="mt-2 text-center">
              <span>Don't have an account? </span>
              <router-link to="/register">Register</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const data = await authAPI.login(email.value, password.value)

    if (data.error) {
      error.value = data.error
    } else {
      success.value = 'Login successful! Redirecting...'
      setTimeout(() => router.push('/dashboard'), 1000)
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
}

.card-header {
  background-color: #fff;
  border-bottom: 2px solid #f0f0f0;
  padding: 1.5rem;
}
</style>
