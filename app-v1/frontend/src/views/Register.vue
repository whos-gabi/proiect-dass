<template>
  <div class="auth-page">
    <div class="card auth-card shadow-sm">

      <div class="card-body p-4">
        <h4 class="mb-1 fw-bold">Create account</h4>
        <p class="text-muted mb-4" style="font-size:14px">Sign up for a new AuthX account</p>

        <div v-if="error"   class="alert alert-danger py-2"   role="alert">{{ error }}</div>
        <div v-if="success" class="alert alert-success py-2" role="alert">{{ success }}</div>

        <form @submit.prevent="handleRegister">
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
                placeholder="Choose a password"
                autocomplete="new-password"
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
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <hr class="my-3" />

        <div class="text-center" style="font-size:14px">
          <span class="text-muted">Already have an account? </span>
          <router-link to="/">Sign in</router-link>
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

async function handleRegister() {
  error.value   = ''
  success.value = ''
  loading.value = true
  try {
    const data = await authAPI.register(email.value, password.value)
    if (data.error) {
      error.value = data.error
    } else {
      success.value = 'Account created! Redirecting to login...'
      setTimeout(() => router.push('/'), 1500)
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
