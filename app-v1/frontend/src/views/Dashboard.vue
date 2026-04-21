<template>
  <div>
    <nav class="navbar navbar-dark bg-dark">
      <div class="container-fluid">
        <span class="navbar-brand">AuthX Dashboard</span>
        <button class="btn btn-outline-light" @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="container mt-5">
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="user" class="card">
        <div class="card-header">
          <h3>Welcome!</h3>
        </div>
        <div class="card-body">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>User ID:</strong> {{ user.id }}</p>
          <p><strong>Account Created:</strong> {{ formatDate(user.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'

const router = useRouter()
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await authAPI.getMe()
    user.value = data.user
  } catch (err) {
    router.push('/')
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  await authAPI.logout()
  router.push('/')
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
}
</style>
