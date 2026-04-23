<template>
  <div class="page">

    <!-- Navbar -->
    <nav class="navbar">
      <span class="navbar-brand">AuthX</span>
      <div class="navbar-actions">
        <button @click="$router.push('/tickets')" class="btn btn-ghost">← Back</button>
        <button v-if="canEdit"   @click="showEditModal = true"  class="btn btn-secondary">Edit</button>
        <button v-if="canDelete" @click="handleDelete"          class="btn btn-danger">Delete</button>
        <button @click="handleLogout" class="btn btn-ghost">Logout</button>
      </div>
    </nav>

    <div class="container">

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Loading ticket...</p>
      </div>

      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <div v-else-if="ticket" class="ticket-detail">

        <!-- Header -->
        <div class="detail-header">
          <div class="detail-title-row">
            <h1 class="detail-title">{{ ticket.title }}</h1>
            <span :class="'severity severity-' + ticket.severity.toLowerCase()">{{ ticket.severity }}</span>
          </div>
          <span :class="'status status-' + ticket.status.toLowerCase().replace('_', '-')">
            {{ ticket.status.replace('_', ' ') }}
          </span>
        </div>

        <!-- Meta -->
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">{{ formatDate(ticket.created_at) }}</span>
          </div>
          <div v-if="ticket.updated_at !== ticket.created_at" class="meta-item">
            <span class="meta-label">Updated</span>
            <span class="meta-value">{{ formatDate(ticket.updated_at) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Owner ID</span>
            <span class="meta-value">#{{ ticket.owner_id }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-body">
          <h3 class="section-title">Description</h3>
          <!-- VULNERABILITY 4.9: XSS — v-html renders unsanitized input -->
          <div v-if="ticket.description" v-html="ticket.description" class="description"></div>
          <p v-else class="no-content">No description provided.</p>
        </div>

      </div>
    </div>

    <!-- Edit modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Ticket</h2>
          <button class="close-btn" @click="showEditModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="editForm.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description" rows="6"></textarea>
          </div>
          <div class="form-group">
            <label>Severity *</label>
            <select v-model="editForm.severity" required>
              <option value="LOW">Low</option>
              <option value="MED">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select v-model="editForm.status" required>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div v-if="editError" class="alert-error">{{ editError }}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authAPI } from '../api/auth'
import { getTicket, updateTicket, deleteTicket } from '../api/tickets'

const router = useRouter()
const route  = useRoute()

const ticket      = ref(null)
const currentUser = ref(null)
const loading     = ref(false)
const error       = ref('')

const showEditModal = ref(false)
const saving        = ref(false)
const editError     = ref('')
const editForm = ref({ title: '', description: '', severity: '', status: '' })

const canEdit = computed(() => {
  if (!ticket.value || !currentUser.value) return false
  return currentUser.value.role === 'MANAGER' || ticket.value.owner_id === currentUser.value.id
})

const canDelete = computed(() => currentUser.value?.role === 'MANAGER')

async function loadTicket() {
  loading.value = true
  try {
    const data = await getTicket(route.params.id)
    ticket.value = data.ticket
    editForm.value = {
      title:       ticket.value.title,
      description: ticket.value.description || '',
      severity:    ticket.value.severity,
      status:      ticket.value.status
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  editError.value = ''
  saving.value = true
  try {
    await updateTicket(route.params.id, editForm.value)
    showEditModal.value = false
    await loadTicket()
  } catch (err) {
    editError.value = err.message
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this ticket?')) return
  try {
    await deleteTicket(route.params.id)
    router.push('/tickets')
  } catch (err) {
    error.value = err.message
  }
}

async function handleLogout() {
  await authAPI.logout()
  router.push('/')
}

function formatDate(d) {
  return new Date(d).toLocaleString()
}

onMounted(async () => {
  try {
    const data = await authAPI.getMe()
    currentUser.value = data.user
  } catch {}
  await loadTicket()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* ── Navbar ── */
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

.navbar-actions { display: flex; gap: 10px; }

/* ── Buttons ── */
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
.btn:disabled { opacity: .5; cursor: not-allowed; }

.btn-primary   { background: #2563eb; color: #fff; }
.btn-secondary { background: #6b7280; color: #fff; }
.btn-danger    { background: #dc2626; color: #fff; }
.btn-ghost     { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }

/* ── States ── */
.state-box {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

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

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

/* ── Ticket detail card ── */
.ticket-detail {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.detail-header {
  padding: 28px 32px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-title-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.detail-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #111;
  flex: 1;
  line-height: 1.3;
}

.detail-meta {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  padding: 18px 32px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.meta-item { display: flex; flex-direction: column; gap: 3px; }
.meta-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: .6px;
}
.meta-value { font-size: 14px; color: #374151; }

.detail-body { padding: 28px 32px; }

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 14px;
}

.description {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
}

.no-content {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

/* ── Severity & status ── */
.severity {
  padding: 4px 12px;
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
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}
.status-open        { background: #dbeafe; color: #1d4ed8; }
.status-in-progress { background: #ffedd5; color: #c2410c; }
.status-resolved    { background: #dcfce7; color: #166534; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-header h2 { margin: 0; font-size: 18px; color: #111; }

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}
.close-btn:hover { color: #374151; }

.modal form { padding: 22px 24px; }

.form-group { margin-bottom: 18px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color .15s;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus { border-color: #2563eb; }
.form-group textarea { resize: vertical; min-height: 110px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

@media (max-width: 640px) {
  .navbar { padding: 0 16px; }
  .container { padding: 20px 16px; }
  .detail-header,
  .detail-meta,
  .detail-body { padding-left: 20px; padding-right: 20px; }
  .detail-title { font-size: 20px; }
}
</style>
