export const useAuthModalStore = () => {
  console.log('useAuthModalStore called')
  
  // Используем useState с уникальными ключами
  const showLoginMenu = useState('auth-showLoginMenu-v2', () => false)
  const activeModal = useState('auth-activeModal-v2', () => '')
  
  console.log('Initial state:', {
    showLoginMenu: showLoginMenu.value,
    activeModal: activeModal.value
  })
  
  // Принудительно сбрасываем состояние только на клиенте
  if (process.client && typeof window !== 'undefined') {
    // Сбрасываем только при первой загрузке страницы
    if (!window.__authStoreInitialized) {
      console.log('Initializing auth store for the first time')
      showLoginMenu.value = false
      activeModal.value = ''
      window.__authStoreInitialized = true
    }
  }
  
  // Методы для управления главным меню входа
  const toggleLoginMenu = () => {
    console.log('toggleLoginMenu called, current value:', showLoginMenu.value)
    showLoginMenu.value = !showLoginMenu.value
    console.log('toggleLoginMenu new value:', showLoginMenu.value)
  }
  
  const closeLoginMenu = () => {
    showLoginMenu.value = false
  }
  
  const openLoginMenu = () => {
    console.log('openLoginMenu called')
    showLoginMenu.value = true
  }
  
  // Методы для управления конкретными модалками
  const openModal = (type) => {
    console.log('openModal called with type:', type)
    closeLoginMenu()
    activeModal.value = type
  }
  
  const closeModal = () => {
    console.log('closeModal called')
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
