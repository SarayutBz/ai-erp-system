<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <div class="page-title">Audit Logs</div>
        <div class="page-sub">Track all system activity and pipeline events</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="filter-group">
        <label class="filter-label">Source</label>
        <select v-model="filterSource" class="filter-select" @change="load">
          <option v-for="opt in sourceOptions" :key="opt" :value="opt">
            {{ opt === 'all' ? 'All sources' : opt }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" class="filter-select" @change="load">
          <option v-for="opt in statusOptions" :key="opt" :value="opt">
            {{ opt === 'all' ? 'All statuses' : opt }}
          </option>
        </select>
      </div>
      <button class="refresh-btn" @click="load" :disabled="api.loading" title="Refresh">
        <v-icon size="15" :class="{ 'spin': api.loading }">mdi-refresh</v-icon>
      </button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="api.loading" class="table-loading">
        <v-progress-circular indeterminate size="24" width="2" color="#5C6BC0" />
      </div>

      <table v-else class="log-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Source</th>
            <th>Status</th>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="empty-row">No logs found</td>
          </tr>
          <tr v-for="log in logs" :key="log._id">
            <td class="cell-action">{{ log.action }}</td>
            <td>
              <span class="source-badge">{{ log.source }}</span>
            </td>
            <td>
              <span class="status-chip" :class="`status-chip--${log.status}`">
                {{ log.status }}
              </span>
            </td>
            <td class="cell-message">{{ log.message }}</td>
            <td class="cell-time">{{ formatTime(log.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from '../stores/api'

const api = useApiStore()
const logs = ref([])
const filterSource = ref('all')
const filterStatus = ref('all')

const sourceOptions = ['all', 'form', 'upload', 'system']
const statusOptions = ['all', 'success', 'error', 'processing']

const load = async () => {
  const params = new URLSearchParams()
  if (filterSource.value !== 'all') params.append('source', filterSource.value)
  if (filterStatus.value !== 'all') params.append('status', filterStatus.value)
  const q = params.toString() ? '?' + params.toString() : ''
  const data = await api.getLogs(q)
  logs.value = data.logs
}

const formatTime = (ts) => {
  const d = new Date(ts)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
</script>

<style scoped>
.page-wrapper {
  padding: 28px 32px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E2329;
}

.page-sub {
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 2px;
}

/* Filters */
.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.filter-select {
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  color: #1E2329;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 7px;
  cursor: pointer;
  outline: none;
  min-width: 140px;
  appearance: auto;
}

.filter-select:focus {
  border-color: #5C6BC0;
}

.refresh-btn {
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 7px;
  cursor: pointer;
  color: #6B7280;
  margin-top: 19px;
  transition: border-color 0.15s;
}

.refresh-btn:hover {
  border-color: #5C6BC0;
  color: #5C6BC0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table card */
.table-card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  overflow: hidden;
}

.table-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.log-table thead tr {
  background: #F9FAFB;
  border-bottom: 1px solid #EBEBEB;
}

.log-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 10px 16px;
  white-space: nowrap;
}

.log-table td {
  padding: 11px 16px;
  color: #1E2329;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
}

.log-table tbody tr:last-child td {
  border-bottom: none;
}

.log-table tbody tr:hover td {
  background: #FAFAFA;
}

.cell-action {
  font-weight: 500;
  color: #374151;
}

.cell-message {
  color: #6B7280;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-time {
  color: #9CA3AF;
  white-space: nowrap;
  font-size: 12px;
}

.source-badge {
  font-size: 11px;
  font-weight: 500;
  background: #F3F4F6;
  color: #6B7280;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: capitalize;
}

.status-chip {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  background: #F3F4F6;
  color: #6B7280;
  text-transform: capitalize;
}

.status-chip--success {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-chip--error {
  background: #FFEBEE;
  color: #C62828;
}

.status-chip--processing {
  background: #FFF8E1;
  color: #E65100;
}

.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #9CA3AF;
}
</style>
