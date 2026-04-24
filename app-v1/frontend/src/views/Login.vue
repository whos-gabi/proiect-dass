<template>
  <div class="auth-page">
    <div class="card auth-card shadow-sm">

      <div class="card-body p-4">
        <h4 class="mb-1 fw-bold">Welcome back</h4>
        <p class="text-muted mb-4" style="font-size:14px">Sign in to your AuthX account</p>

        <div v-if="error"   class="alert alert-danger py-2"   role="alert">{{ error }}</div>
        <div v-if="success" class="alert alert-success py-2" role="alert">{{ success }}</div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label fw-medium">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="mb-4">
            <label for="password" class="form-label fw-medium">Password</label>
            <div class="input-group">
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control border-end-0"
                id="password"
                v-model="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="input-group-text bg-white border-start-0"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <hr class="my-3" />

        <div class="text-center" style="font-size:14px">
          <router-link to="/forgot-password" class="text-muted">Forgot password?</router-link>
          <span class="text-muted mx-2">·</span>
          <router-link to="/register">Create account</router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'

const router       = useRouter()
const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const error        = ref('')
const success      = ref('')
const loading      = ref(false)

async function handleLogin() {
  error.value   = ''
  success.value = ''
  loading.value = true
  try {
    const data = await authAPI.login(email.value, password.value)
    if (data.error) {
      error.value = data.error
    } else if (data.token) {
      success.value = 'Login successful! Redirecting...'
      // Wait for localStorage to persist before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/tickets')
    } else {
      error.value = 'Login failed: no token received'
    }
  } catch {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

/* Make eye button blend with input */
.input-group .form-control:focus {
  z-index: 1;
}
.input-group .form-control:focus + .input-group-text {
  border-color: #86b7fe;
  box-shadow: none;
}
.input-group-text {
  cursor: pointer;
  color: #6b7280;
}
.input-group-text:hover {
  color: #111;
}
</style>
