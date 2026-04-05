<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title">New Order</div>
      <div class="page-sub">Fill in customer details and items below</div>
    </div>

    <div class="form-card">
      <!-- Customer info -->
      <div class="form-section-label">Customer</div>
      <div class="field-group">
        <v-text-field
          v-model="form.customerName"
          label="Customer name"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          required
        />
        <div class="field-row">
          <v-text-field
            v-model="form.customerEmail"
            label="Email (optional)"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-text-field
            v-model="form.customerPhone"
            label="Phone (optional)"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
        </div>
      </div>

      <div class="divider" />

      <!-- Items -->
      <div class="items-header">
        <div class="form-section-label" style="margin-bottom:0">Items</div>
        <button class="add-btn" @click="addItem">
          <v-icon size="14">mdi-plus</v-icon> Add item
        </button>
      </div>

      <div class="items-list">
        <div v-for="(item, i) in form.items" :key="i" class="item-row">
          <v-text-field
            v-model="item.name"
            label="Item name"
            variant="outlined"
            density="compact"
            hide-details
            class="item-name"
          />
          <v-text-field
            v-model="item.qty"
            label="Qty"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="item-qty"
          />
          <v-text-field
            v-model="item.price"
            label="Price (฿)"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="item-price"
          />
          <button
            class="remove-btn"
            @click="removeItem(i)"
            :disabled="form.items.length === 1"
            title="Remove"
          >
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>
      </div>

      <div class="divider" />

      <!-- Total -->
      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="total-value">฿{{ total.toLocaleString() }}</span>
      </div>

      <!-- Alerts -->
      <div v-if="api.error" class="alert alert--error">
        <v-icon size="16" color="#C62828">mdi-alert-circle-outline</v-icon>
        {{ api.error }}
      </div>
      <div v-if="successMsg" class="alert alert--success">
        <v-icon size="16" color="#2E7D32">mdi-check-circle-outline</v-icon>
        {{ successMsg }}
      </div>

      <!-- Submit -->
      <button class="submit-btn" @click="submit" :disabled="api.loading">
        <v-progress-circular v-if="api.loading" indeterminate size="16" width="2" color="white" />
        <span v-else>Create Order</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApiStore } from '../stores/api'

const api = useApiStore()
const successMsg = ref('')

const form = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  items: [{ name: '', qty: 1, price: 0 }],
})

const total = computed(() =>
  form.value.items.reduce((s, i) => s + Number(i.qty) * Number(i.price), 0)
)

const addItem = () => form.value.items.push({ name: '', qty: 1, price: 0 })

const removeItem = (i) => form.value.items.splice(i, 1)

const submit = async () => {
  successMsg.value = ''
  try {
    await api.createOrder(form.value)
    successMsg.value = 'Order created successfully!'
    form.value = {
      customerName: '', customerEmail: '', customerPhone: '',
      items: [{ name: '', qty: 1, price: 0 }],
    }
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.page-wrapper {
  padding: 28px 32px;
  max-width: 680px;
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

.form-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.divider {
  border-top: 1px solid #F3F4F6;
  margin: 20px 0;
}

.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #5C6BC0;
  background: #EEF0FB;
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.add-btn:hover {
  background: #E3E6F7;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  flex: 1;
}

.item-qty {
  width: 80px;
  flex-shrink: 0;
}

.item-price {
  width: 110px;
  flex-shrink: 0;
}

.remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #9CA3AF;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.remove-btn:hover:not(:disabled) {
  background: #FFEBEE;
  color: #E53935;
}

.remove-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.total-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #1E2329;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 16px;
}

.alert--error {
  background: #FFEBEE;
  color: #C62828;
}

.alert--success {
  background: #E8F5E9;
  color: #2E7D32;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
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
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
