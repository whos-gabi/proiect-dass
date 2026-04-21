<template>
  <div class="container">
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Forgot Password</h3>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">
              {{ success }}
              <div v-if="resetToken" class="mt-3">
                <p><strong>Reset Token:</strong></p>
                <code>{{ resetToken }}</code>
                <p class="mt-2">
                  <router-link :to="`/reset-password?token=${resetToken}`">Click here to reset password</router-link>
                </p>
              </div>
            </div>

            <form @submit.prevent="handleForgotPassword" v-if="!success">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="email" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading">Sending...</span>
                <span v-else>Send Reset Link</span>
              </button>
            </form>

            <div class="mt-3 text-center">
              <router-link to="/">Back to Login</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '../api/auth'

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const resetToken = ref('')

async function handleForgotPassword() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const data = await authAPI.forgotPassword(email.value)

    if (data.error) {
      error.value = data.error
    } else {
      success.value = 'Password reset token generated!'
      resetToken.value = data.token
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

code {
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  display: block;
  word-break: break-all;
}
</style>
