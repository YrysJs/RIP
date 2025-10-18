<template>
  <NuxtLayout name="user" class="users-page">
    <div class="page">
      <!-- Шапка -->
      <div class="page-head">
        <h1 class="page-title">Пользователи акимата</h1>

        <button class="add-btn" @click="isCreateModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Пригласить пользователя
        </button>
      </div>

      <!-- Таблица -->
      <div class="table">
        <div class="row thead">
          <div class="cell th">Роль</div>
          <div class="cell th">ФИО</div>
          <div class="cell th th--actions">Статус</div>
          <div class="cell th th--actions"></div>
        </div>

        <div class="tbody">
          <template v-for="role in roles">
            <div
              v-for="user in role.users"
              :key="user.id"
              class="row"
            >
              <div class="cell role">{{ roleLabel(role.role) }}</div>

              <div class="cell fio">
                {{ fio(user) }}
              </div>

              <div class="cell status-cell">
                <span class="status" :class="statusClass(user.status)">
                  {{ statusText(user.status) }}
                </span>
              </div>

              <div class="cell actions">
                <button class="kebab" @click.stop="toggleDropdown(user.id)" aria-label="Действия">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="5" cy="12" r="2" fill="#6B7280"/>
                    <circle cx="12" cy="12" r="2" fill="#6B7280"/>
                    <circle cx="19" cy="12" r="2" fill="#6B7280"/>
                  </svg>
                </button>

                <div
                  v-if="openedDropdownUserId === user.id"
                  class="dropdown"
                  @click.stop
                >
                  <button class="dropdown__item" @click="openUpdateModal(user)">Редактировать</button>
                  <button class="dropdown__item dropdown__item--danger" @click="showConfirmModal(user)">Удалить</button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Модалки -->
    <Teleport to="body">
      <AkimatSignUp
        v-if="isCreateModal"
        @finish="createUser"
        @close="isCreateModal = false"
      />
      <AkimatUserUpdate
        v-if="isUpdateModal"
        :user="selectedUser"
        @finish="updateUser"
        @close="isUpdateModal = false"
      />
      <SuccessModal
        v-if="showSuccessModal"
        :title="successText"
        :show-button="true"
        @close="closeSuccessModal"
      />

      <!-- Новая модалка подтверждения удаления -->
      <template v-if="isConfirmModal">
        <div class="dlg-backdrop" @click.self="closeConfirmModal">
          <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
            <h3 id="dlg-title" class="dlg__title">
              Вы уверены что хотите удалить пользователя?
            </h3>

            <p class="dlg__hint">
              {{ fio(selectedUser) }}
            </p>

            <div class="dlg__actions">
              <button type="button" class="btn-ghost" @click="closeConfirmModal">
                Отменить
              </button>
              <button type="button" class="btn-primary" @click="onDeleteUser">
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      </template>
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AkimatSignUp from '~/components/auth/AkimatSignUp.vue'
import AkimatUserUpdate from '~/components/auth/AkimatUserUpdate.vue'
import SuccessModal from '~/components/layout/modals/SuccessModal.vue'
// ConfirmModal не используем — сделали кастомную
import { getUsersByRole, deleteUser } from '~/services/login'

const isCreateModal = ref(false)
const showSuccessModal = ref(false)
const isConfirmModal = ref(false)
const isUpdateModal = ref(false)
const selectedUser = ref({})
const successText = ref('')

const roles = ref([])
const openedDropdownUserId = ref(null)

/* actions */
const createUser = () => {
  isCreateModal.value = false
  successText.value = 'Приглашение отправлено!'
  showSuccessModal.value = true
}
const updateUser = () => {
  isUpdateModal.value = false
  successText.value = 'Данные изменены!'
  showSuccessModal.value = true
  fetchUsers()
}
function toggleDropdown(id){
  openedDropdownUserId.value = openedDropdownUserId.value === id ? null : id
}
const openUpdateModal = (user) => {
  selectedUser.value = user
  openedDropdownUserId.value = null
  isUpdateModal.value = true
}
const closeSuccessModal = () => { showSuccessModal.value = false }
const showConfirmModal = (user) => {
  selectedUser.value = user
  openedDropdownUserId.value = null
  isConfirmModal.value = true
}
const closeConfirmModal = () => { isConfirmModal.value = false }

const onDeleteUser = async () => {
  try {
    await deleteUser(selectedUser.value.phone)
    isConfirmModal.value = false
    fetchUsers()
  } catch (e) {
    console.error(e)
  }
}

/* data */
const fetchUsers = async () => {
  try {
    const { data } = await getUsersByRole({ roleIds: '7,8' })
    roles.value = data
  } catch (e) {
    console.error('Ошибка при получении пользователей:', e)
  }
}
onMounted(fetchUsers)

/* helpers */
function fio(u){ return `${u.surname || ''} ${u.name || ''} ${u.patronymic || ''}`.trim() || '—' }
function roleLabel(code){
  switch (code) {
    case 'AKIMAT_ADMIN': return 'Администратор'
    case 'AKIMAT_MANAGER': return 'Менеджер'
    case 'AKIMAT_WRITER': return 'Писатель'
    default: return '—'
  }
}
function statusText(s){
  switch (s) {
    case 'blocked': return 'Заблокирован'
    case 'pending': return 'Приглашение отправлено'
    case 'active':
    default: return 'Активен'
  }
}
function statusClass(s){
  switch (s) {
    case 'blocked': return 'status--blocked'
    case 'pending': return 'status--pending'
    case 'active':
    default: return 'status--active'
  }
}

/* UX для модалки: Esc + блок скролла фона */
function onEsc(e) {
  if (e.key === 'Escape') closeConfirmModal()
}
function lockBody(){ document.body.style.overflow = 'hidden' }
function freeBody(){ document.body.style.overflow = '' }

watch(isConfirmModal, (open) => {
  if (open) {
    lockBody()
    window.addEventListener('keydown', onEsc)
  } else {
    freeBody()
    window.removeEventListener('keydown', onEsc)
  }
})
</script>

<style scoped>
/* Страница без карточного бордера */
.page{ background: transparent; padding: 0; margin-top: 8px; }

/* Шапка */
.page-head{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
.page-title{
  font-family: "FoglihtenNo06", sans-serif;
  text-transform:uppercase; letter-spacing:.02em;
  font-weight:700; font-size:32px; line-height:36px; color:#1c140e;
}

/* add-btn в твоём стиле */
.add-btn{
  display:flex; align-items:center; gap:8px;
  color:#0069FF; padding:10px 16px;
  font-weight:700; font-size:14px; cursor:pointer;
  background: transparent; border: none;
}

/* Таблица (без рамок, с серой шапкой и зеброй) */
.table{ margin-top:12px; }
.row{
  display:grid;
  grid-template-columns: 220px minmax(320px, 1fr) auto 44px; /* роль | ФИО | статус(по контенту) | ... */
  align-items:center;
  column-gap:16px;
  padding:12px 14px;
  border-radius:12px;
}

/* Шапка использует ту же сетку и выравнивание заголовка статуса вправо */
.thead{
  background:#E9EEF5;
  font-weight:700;
  color:#111827;
  grid-template-columns: 220px minmax(320px, 1fr) auto 44px;
}
.th--actions{ justify-self: end; }

/* ФИО — одна строка + min-width:0, чтобы грид не растягивал соседей */
.fio{
  color:#111827; font-weight:600;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  min-width:0;
}

/* Зебра для строк */
.tbody .row:nth-child(even){ background:#EEF3F8; }

.cell{ min-width:0; }
.role{ color:#111827; }
.status-cell{ justify-self: end; }

.status{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 12px; border-radius:999px; font-size:12px; font-weight:700; white-space:nowrap;
  position:relative;
}
.status::before{
  content:""; width:8px; height:8px; border-radius:999px; background:currentColor; opacity:.95;
}
.status--active   { background:#E8F6EC; color:#2F9B3C; }
.status--pending  { background:#FFF1DC; color:#C77700; }
.status--blocked  { background:#FDECEC; color:#D33030; }

/* Действия */
.actions{ display:flex; justify-content:flex-end; position:relative; }
.kebab{
  border-radius:10px; width:36px; height:36px;
  display:inline-flex; align-items:center; justify-content:center; cursor:pointer;
}
.dropdown{
  position:absolute; right:0; top:calc(100% + 8px); width:176px;
  background:#fff; border:1px solid #E6E8EC; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,.06); overflow:hidden; z-index:10;
}
.dropdown__item{
  width:100%; text-align:left; padding:10px 12px; font-size:14px; background:#fff; border:none; cursor:pointer;
}
.dropdown__item:hover{ background:#F3F4F6; }
.dropdown__item--danger{ color:#D33030; }

/* === Confirm dialog === */
.dlg-backdrop{
  position: fixed; inset: 0;
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.dlg{
  width: min(760px, calc(100% - 32px));
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 55px rgba(0,0,0,.15);
  padding: 28px 28px 22px;
  text-align: center;
}
.dlg__title{
  font-weight: 800;
  font-size: 28px;
  line-height: 1.25;
  color: #0F172A;
  margin: 4px 0 8px;
}
.dlg__hint{
  color: #6B7280;
  font-size: 16px;
  margin: 0 0 18px;
}
.dlg__actions{
  display: flex; gap: 20px; justify-content: center; margin-top: 8px;
}

/* Кнопки модалки */
.btn-ghost{
  min-width: 160px; height: 48px;
  padding: 0 18px; border-radius: 12px;
  border: 1px solid #E6E8EC; background:#fff; color:#111827;
  font-weight: 700; cursor: pointer;
}
.btn-ghost:hover{ background:#F3F4F6; }

.btn-primary{
  min-width: 180px; height: 48px;
  padding: 0 20px; border-radius: 12px; border: none;
  background: #F7B500; color: #fff; font-weight: 700; cursor: pointer;
}
.btn-primary:hover{ filter: brightness(.98); }

/* Адаптив */
@media (max-width: 1100px){
  .row{ grid-template-columns: 200px 1fr 280px 40px; }
}
@media (max-width: 720px){
  .row{ grid-template-columns: 1fr; row-gap:8px; }
  .status-cell{ justify-self: start; }  /* на мобилках статус под ФИО */
  .actions{ justify-content:flex-start; }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  /* Белый фон для страницы пользователей */
  :global(.users-page) {
    background: #ffffff !important;
  }
  
  :global(.users-page .user) {
    background: #ffffff !important;
  }

  /* Добавляем top padding */
  .page {
    padding-top: 20px;
  }

  /* Адаптируем заголовок */
  .page-title {
    font-size: 24px;
    line-height: 28px;
    margin-bottom: 16px;
    font-family: "FoglihtenNo06", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Адаптируем кнопку добавления */
  .add-btn {
    font-size: 16px;
    padding: 12px 16px;
    align-self: flex-start;
  }

  /* Выравниваем заголовок и кнопку */
  .page-head {
    align-items: center;
    margin-bottom: 16px;
  }

  /* Преобразуем таблицу в карточки */
  .table {
    margin-top: 0;
  }

  .row {
    flex-direction: column;
    background: #F4F0E7 !important;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    position: relative;
  }

  /* Мобильная версия: используем CSS Grid для правильного расположения */
  .row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-areas: 
      "role status actions"
      "fio fio fio";
    gap: 8px;
    align-items: center;
  }

  /* Скрываем заголовок таблицы на мобильных */
  .thead {
    display: none;
  }

  /* Адаптируем карточки пользователей */
  .cell {
    margin-bottom: 0;
  }

  .cell:last-child {
    margin-bottom: 0;
  }

  /* Роль - крупно и жирно */
  .role {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0;
    grid-area: role;
  }

  /* ФИО - под ролью */
  .fio {
    font-size: 16px;
    color: #6B7280;
    margin-bottom: 0;
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    grid-area: fio;
  }

  .fio-label {
    font-size: 14px;
    color: #9CA3AF;
    margin-right: 4px;
  }

  /* Статус - справа от роли */
  .status-cell {
    grid-area: status;
    justify-self: end;
  }

  .status {
    font-size: 14px;
    padding: 6px 12px;
  }

  /* Действия - справа */
  .actions {
    grid-area: actions;
    justify-self: end;
  }

  /* Адаптируем модальные окна */
  .dlg {
    width: calc(100% - 32px);
    padding: 24px 20px 20px;
  }

  .dlg__title {
    font-size: 20px;
    line-height: 24px;
  }

  .dlg__hint {
    font-size: 14px;
  }

  .dlg__actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn-ghost,
  .btn-primary {
    width: 100%;
    min-width: auto;
  }
}
</style>
