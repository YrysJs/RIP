export const useAuthModalStore = () => {
  // Состояние для управления модалками
  const showLoginMenu = ref(false)
  const activeModal = ref('')
  
  // Методы для управления главным меню входа
  const toggleLoginMenu = () => {
    showLoginMenu.value = !showLoginMenu.value
  }
  
  const closeLoginMenu = () => {
    showLoginMenu.value = false
  }
  
  const openLoginMenu = () => {
    showLoginMenu.value = true
  }
  
  // Методы для управления конкретными модалками
  const openModal = (type) => {
    closeLoginMenu()
    activeModal.value = type
  }
  
  const closeModal = () => {
    activeModal.value = ''
  }
  
  // Конкретные методы для каждого типа модалки
  const openClientModal = () => openModal('client')
  const openManagerModal = () => openModal('manager')
  const openSupplierModal = () => openModal('supplier')
  const openAkimatModal = () => openModal('akimat')
  
  return {
    // Состояние
    showLoginMenu: readonly(showLoginMenu),
    activeModal: readonly(activeModal),
    
    // Методы для главного меню
    toggleLoginMenu,
    closeLoginMenu,
    openLoginMenu,
    
    // Методы для модалок
    openModal,
    closeModal,
    openClientModal,
    openManagerModal,
    openSupplierModal,
    openAkimatModal
  }
}
