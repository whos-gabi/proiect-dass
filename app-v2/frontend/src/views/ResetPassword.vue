<template>
  <div class="container">
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Reset Password</h3>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">
              {{ success }}
              <div class="mt-2">
                <router-link to="/">Go to Login</router-link>
              </div>
            </div>

            <form @submit.prevent="handleResetPassword" v-if="!success">
              <div class="mb-3">
                <label for="token" class="form-label">Reset Token</label>
                <input type="text" class="form-control" id="token" v-model="token" readonly>
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input type="password" class="form-control" id="newPassword" v-model="newPassword" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading">Resetting...</span>
                <span v-else>Reset Password</span>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authAPI } from '../api/auth'

const route = useRoute()
const token = ref('')
const newPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
})

async function handleResetPassword() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const data = await authAPI.resetPassword(token.value, newPassword.value)

    if (data.error) {
      error.value = data.error
    } else {
      success.value = 'Password reset successful!'
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
</style>
