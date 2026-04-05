<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title">Upload Invoice</div>
      <div class="page-sub">AI will parse the invoice and create an order automatically</div>
    </div>

    <div class="form-card">
      <!-- Drop zone -->
      <label class="drop-zone" :class="{ 'drop-zone--has-file': file }">
        <input
          type="file"
          accept="image/*,application/pdf"
          class="file-input"
          @change="onFileChange"
        />
        <div v-if="!file" class="drop-content">
          <div class="drop-icon">
            <v-icon color="#9CA3AF" size="28">mdi-file-upload-outline</v-icon>
          </div>
          <div class="drop-text">Drop file here or <span class="drop-link">browse</span></div>
          <div class="drop-hint">JPG, PNG, PDF supported</div>
        </div>
        <div v-else class="file-selected">
          <v-icon color="#5C6BC0" size="20">mdi-file-check-outline</v-icon>
          <span class="file-name">{{ fileName }}</span>
          <button class="clear-btn" @click.prevent="clearFile">
            <v-icon size="14">mdi-close</v-icon>
          </button>
        </div>
      </label>

      <!-- Alerts -->
      <div v-if="api.error" class="alert alert--error">
        <v-icon size="16" color="#C62828">mdi-alert-circle-outline</v-icon>
        {{ api.error }}
      </div>

      <!-- Result -->
      <div v-if="result" class="result-box">
        <div class="result-header">
          <v-icon size="16" color="#2E7D32">mdi-check-circle-outline</v-icon>
          Order created — Total: <strong>฿{{ result.order.totalAmount.toLocaleString() }}</strong>
        </div>
        <div class="result-body">
          <div class="result-row">
            <span class="result-key">Customer</span>
            <span class="result-val">{{ result.parsed.customer_name }}</span>
          </div>
          <div class="result-divider" />
          <div class="result-items-label">Items</div>
          <div
            v-for="(item, i) in result.parsed.items"
            :key="i"
            class="result-item"
          >
            <span>{{ item.name }}</span>
            <span class="result-item-meta">× {{ item.quantity }} @ ฿{{ item.unit_price }}</span>
          </div>
        </div>
      </div>

      <button
        class="submit-btn"
        :disabled="!file || api.loading"
        @click="upload"
      >
        <v-progress-circular v-if="api.loading" indeterminate size="16" width="2" color="white" />
        <span v-else>
          <v-icon size="16" style="margin-right:6px">mdi-lightning-bolt</v-icon>
          Parse &amp; Create Order
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApiStore } from '../stores/api'

const api = useApiStore()
const file = ref(null)
const result = ref(null)

const fileName = computed(() => file.value?.name || '')

const onFileChange = (e) => {
  file.value = e.target.files[0] || null
  result.value = null
}

const clearFile = () => {
  file.value = null
  result.value = null
}

const upload = async () => {
  result.value = null
  try {
    result.value = await api.uploadInvoice(file.value)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.page-wrapper {
  padding: 28px 32px;
  max-width: 560px;
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

.form-card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  padding: 24px;
}

/* Drop zone */
.drop-zone {
  display: block;
  border: 2px dashed #E5E7EB;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  margin-bottom: 16px;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: #5C6BC0;
  background: #FAFBFF;
}

.drop-zone--has-file {
  border-style: solid;
  border-color: #C5CAE9;
  background: #F8F9FF;
}

.file-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px;
  gap: 8px;
}

.drop-icon {
  width: 48px;
  height: 48px;
  background: #F3F4F6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.drop-text {
  font-size: 13px;
  color: #6B7280;
}

.drop-link {
  color: #5C6BC0;
  font-weight: 500;
}

.drop-hint {
  font-size: 11px;
  color: #9CA3AF;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #1E2329;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #9CA3AF;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: #FFEBEE;
  color: #E53935;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.alert--error {
  background: #FFEBEE;
  color: #C62828;
}

/* Result box */
.result-box {
  border: 1px solid #E8F5E9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #E8F5E9;
  padding: 10px 14px;
  font-size: 13px;
  color: #2E7D32;
}

.result-body {
  padding: 14px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 10px;
}

.result-key {
  color: #9CA3AF;
  font-weight: 500;
}

.result-val {
  color: #1E2329;
  font-weight: 500;
}

.result-divider {
  border-top: 1px solid #F3F4F6;
  margin-bottom: 10px;
}

.result-items-label {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #1E2329;
  padding: 3px 0;
}

.result-item-meta {
  color: #9CA3AF;
  font-size: 12px;
}

/* Submit */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: #5C6BC0;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  letter-spacing: 0.2px;
}

.submit-btn:hover:not(:disabled) {
  background: #4A5AB5;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
