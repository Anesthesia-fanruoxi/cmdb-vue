import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapse: false
  }),
  
  actions: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}) 