<template>
  <v-app>
    <v-navigation-drawer permanent width="220" class="app-sidebar">
      <!-- Logo area -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <v-icon color="primary" size="20">mdi-lightning-bolt</v-icon>
        </div>
        <div>
          <div class="logo-title">AI ERP(DEMO)</div>
          <div class="logo-sub">Automation</div>
        </div>
      </div>

      <v-divider class="mx-3 mb-2" />

      <div class="px-2 pt-1">
        <div class="nav-section-label">MENU</div>
        <v-list nav density="compact" class="pa-0">
          <v-list-item
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            class="nav-item mb-1"
            active-class="nav-item--active"
          />
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="app-main">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
const navItems = [
  { title: 'Dashboard',       to: '/',        icon: 'mdi-view-dashboard-outline' },
  { title: 'New Order',       to: '/orders',  icon: 'mdi-plus-circle-outline' },
  { title: 'Upload Invoice',  to: '/upload',  icon: 'mdi-file-upload-outline' },
  { title: 'Logs',            to: '/logs',    icon: 'mdi-text-box-multiple-outline' },
]
</script>

<style scoped>
.app-sidebar {
  border-right: 1px solid #EBEBEB !important;
  background: #FFFFFF !important;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: #EEF0FB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-title {
  font-size: 14px;
  font-weight: 700;
  color: #1E2329;
  line-height: 1.2;
  letter-spacing: 0.3px;
}

.logo-sub {
  font-size: 11px;
  color: #9CA3AF;
  line-height: 1.2;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  color: #9CA3AF;
  letter-spacing: 0.8px;
  padding: 0 12px 6px;
}

.nav-item {
  color: #6B7280;
  font-size: 13px;
}

.app-main {
  background: #F4F5F7;
}
</style>
