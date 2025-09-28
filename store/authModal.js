export const useAuthModalStore = () => {
  // Используем useState с уникальными ключами
  const showLoginMenu = useState('auth-showLoginMenu-v2', () => false)
  const activeModal = useState('auth-activeModal-v2', () => '')
  
  // Принудительно сбрасываем состояние только на клиенте
  if (process.client && typeof window !== 'undefined') {
    // Сбрасываем только при первой загрузке страницы
    if (!window.__authStoreInitialized) {
      showLoginMenu.value = false
      activeModal.value = ''
      window.__authStoreInitialized = true
    }
  }
  
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
