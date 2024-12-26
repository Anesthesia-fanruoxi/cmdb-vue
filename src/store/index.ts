import { createPinia } from 'pinia'

const pinia = createPinia()

export { useUserStore } from './modules/user'
export { useSidebarStore } from './modules/sidebar'

export default pinia 