<template>
  <div class="page-wrapper">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-sub">Overview of your ERP activity</div>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-icon" :style="{ background: card.bg }">
          <v-icon :color="card.color" size="20">{{ card.icon }}</v-icon>
        </div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- Pipeline section -->
    <div class="section-title">Pipeline Status</div>

    <div v-if="Object.keys(status.pipeline).length === 0" class="empty-state">
      <v-icon color="#D1D5DB" size="40">mdi-chart-box-outline</v-icon>
      <div>No pipeline data yet</div>
    </div>

    <div v-else class="pipeline-grid">
      <div v-for="(stat, source) in status.pipeline" :key="source" class="pipeline-card">
        <div class="pipeline-source">{{ source }}</div>
        <div class="pipeline-chips">
          <span
            v-for="(count, s) in stat"
            :key="s"
            class="status-chip"
            :class="`status-chip--${s}`"
          >
            {{ s }} · {{ count }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApiStore } from '../stores/api'

const api = useApiStore()
const orders = ref([])
const status = ref({ pipeline: {}, summary: {} })

onMounted(async () => {
  const [o, s] = await Promise.all([api.getOrders(), api.getPipelineStatus()])
  orders.value = o
  status.value = s
})

const statCards = computed(() => [
  {
    label: 'Total Orders',
    value: orders.value.length,
    icon: 'mdi-clipboard-list-outline',
    color: '#5C6BC0',
    bg: '#EEF0FB',
  },
  {
    label: 'Successful',
    value: status.value.summary?.success || 0,
    icon: 'mdi-check-circle-outline',
    color: '#43A047',
    bg: '#E8F5E9',
  },
  {
    label: 'Errors',
    value: status.value.summary?.error || 0,
    icon: 'mdi-alert-circle-outline',
    color: '#E53935',
    bg: '#FFEBEE',
  },
])
</script>

<style scoped>
.page-wrapper {
  padding: 28px 32px;
  max-width: 960px;
}

.page-header {
  margin-bottom: 24px;
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

/* Stat cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  padding: 20px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E2329;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

/* Pipeline */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E2329;
  margin-bottom: 12px;
}

.pipeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.pipeline-card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  padding: 16px;
}

.pipeline-source {
  font-size: 13px;
  font-weight: 600;
  color: #1E2329;
  text-transform: capitalize;
  margin-bottom: 10px;
}

.pipeline-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-chip {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  background: #F3F4F6;
  color: #6B7280;
}

.status-chip--done,
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

.status-chip--pending {
  background: #F3F4F6;
  color: #6B7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: #9CA3AF;
  font-size: 13px;
}
</style>
