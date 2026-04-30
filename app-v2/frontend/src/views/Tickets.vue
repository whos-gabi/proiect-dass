<template>
  <div class="page">

    <!-- Navbar -->
    <nav class="navbar">
      <span class="navbar-brand">AuthX</span>
      <div class="navbar-actions">
        <button @click="openModal" class="btn btn-primary">+ Create Ticket</button>
        <button @click="handleLogout" class="btn btn-ghost">Logout</button>
      </div>
    </nav>

    <div class="container">

      <!-- User card -->
      <div v-if="currentUser" class="user-card">
        <div class="user-avatar">{{ currentUser.email[0].toUpperCase() }}</div>
        <div class="user-info">
          <div class="user-email">{{ currentUser.email }}</div>
          <div class="user-meta">
            <span class="badge-role">{{ currentUser.role }}</span>
            <span class="user-since">Member since {{ formatDate(currentUser.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Search tickets by title or description..."
          class="search-input"
        />
        <button @click="handleSearch" class="btn btn-secondary">Search</button>
        <button v-if="isSearching" @click="clearSearch" class="btn btn-ghost">Clear</button>
      </div>

      <!-- Tickets list -->
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Loading tickets...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="state-box">
        <span class="empty-icon">📋</span>
        <p v-if="isSearching">No tickets found for "<strong>{{ searchQuery }}</strong>"</p>
        <p v-else>You have no tickets yet. Create your first one!</p>
      </div>

      <div v-else class="tickets-grid">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="ticket-card"
          @click="$router.push('/tickets/' + ticket.id)"
        >
          <div class="ticket-top">
            <h3 class="ticket-title">{{ ticket.title }}</h3>
            <span :class="'severity severity-' + ticket.severity.toLowerCase()">{{ ticket.severity }}</span>
          </div>
          <p v-if="ticket.description" class="ticket-desc">{{ truncate(ticket.description, 90) }}</p>
          <div class="ticket-bottom">
            <span :class="'status status-' + ticket.status.toLowerCase().replace('_', '-')">
              {{ ticket.status.replace('_', ' ') }}
            </span>
            <span class="ticket-date">{{ formatDate(ticket.created_at) }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Bootstrap 5 Modal -->
    <div class="modal fade" id="createTicketModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Ticket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleCreate">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Title *</label>
                <input v-model="form.title" type="text" class="form-control" required placeholder="Brief description" />
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" class="form-control" rows="4" placeholder="More details..."></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Severity *</label>
                <select v-model="form.severity" class="form-select" required>
                  <option value="LOW">Low</option>
                  <option value="MED">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create Ticket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'
import { getMyTickets, createTicket, searchTickets } from '../api/tickets'

const router = useRouter()

const tickets     = ref([])
const currentUser = ref(null)
const loading     = ref(false)
const isSearching = ref(false)
const searchQuery = ref('')

const creating  = ref(false)
const formError = ref('')
const form = ref({ title: '', description: '', severity: 'MED' })

let modalInstance = null

async function loadUser() {
  try {
    const data = await authAPI.getMe()
    currentUser.value = data.user
  } catch {}
}

async function loadTickets() {
  loading.value = true
  try {
    const data = await getMyTickets()
    tickets.value = data.tickets
  } catch {
    tickets.value = []
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return clearSearch()
  loading.value = true
  isSearching.value = true
  try {
    const data = await searchTickets(searchQuery.value)
    tickets.value = data.tickets
  } catch {
    tickets.value = []
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  searchQuery.value = ''
  isSearching.value = false
  loadTickets()
}

function openModal() {
  if (!modalInstance) {
    const el = document.getElementById('createTicketModal')
    modalInstance = new window.bootstrap.Modal(el)
  }
  modalInstance.show()
}

async function handleCreate() {
  formError.value = ''
  creating.value = true
  try {
    await createTicket(form.value)
    modalInstance.hide()
    form.value = { title: '', description: '', severity: 'MED' }
    await loadTickets()
  } catch (err) {
    formError.value = err.message
  } finally {
    creating.value = false
  }
}

async function handleLogout() {
  await authAPI.logout()
  router.push('/')
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function formatDate(d) {
  return new Date(d).toLocaleDateString()
}

onMounted(async () => {
  await loadUser()
  await loadTickets()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.navbar-brand {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.5px;
}

.navbar-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity .15s;
}
.btn:hover { opacity: .85; }

.btn-primary  { background: #2563eb; color: #fff; }
.btn-secondary{ background: #6b7280; color: #fff; }
.btn-ghost    { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }
.btn:disabled { opacity: .5; cursor: not-allowed; }

.user-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-email {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.badge-role {
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.user-since {
  font-size: 12px;
  color: #9ca3af;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
}

.search-input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  outline: none;
  transition: border-color .15s;
}
.search-input:focus { border-color: #2563eb; }

.state-box {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.ticket-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s;
}
.ticket-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.1);
  transform: translateY(-2px);
}

.ticket-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.ticket-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  line-height: 1.4;
  flex: 1;
}

.ticket-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 14px;
}

.ticket-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.ticket-date { font-size: 12px; color: #9ca3af; }

.severity {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}
.severity-low  { background: #dcfce7; color: #166534; }
.severity-med  { background: #fef9c3; color: #854d0e; }
.severity-high { background: #fee2e2; color: #991b1b; }

.status {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-open        { background: #dbeafe; color: #1d4ed8; }
.status-in-progress { background: #ffedd5; color: #c2410c; }
.status-resolved    { background: #dcfce7; color: #166534; }

@media (max-width: 640px) {
  .tickets-grid { grid-template-columns: 1fr; }
  .navbar { padding: 0 16px; }
  .container { padding: 20px 16px; }
}
</style>
