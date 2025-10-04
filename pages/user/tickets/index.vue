<template>
  <NuxtLayout name="user" class="tickets-page">
    <div class="w-full rounded-[16px]">
      <!-- Заголовок -->
      <h2 class="page-title">Новые заявки</h2>

      <!-- Табы -->
      <div class="tabs-wrapper">
        <div class="tabs">
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'relocation' }"
            @click="activeTab = 'relocation'"
          >
            Заявки на перезахоронение
            <span class="tab-count" :class="{ 'tab-count--active': activeTab === 'relocation' }">
              {{ relocationCount }}
            </span>
          </button>

          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'akimat' }"
            @click="activeTab = 'akimat'"
          >
            Обращение в акимат
            <span class="tab-count" :class="{ 'tab-count--active': activeTab === 'akimat' }">
              {{ akimatCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Контент -->
      <template v-if="activeTab === 'relocation'">
        <!-- Верхний ряд: поиск + сортировка справа -->
        <div class="filters-row flex items-center gap-[12px] flex-wrap mb-[12px]">
          <!-- Поиск -->
          <div class="field relative flex-1 min-w-[320px]">
            <span class="field__icon" aria-hidden>
              <!-- search -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.2-4.2M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <input
              class="field__control w-full"
              type="text"
              placeholder="Поиск по заявкам"
              v-model="search"
              @input="onSearchInput"
            />
          </div>

          <!-- Сортировка (справа) -->
          <div class="ml-auto field relative min-w-[270px]">
            <span class="field__icon" aria-hidden>
              <!-- sort -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4m0 16l3-3m-3 3l-3-3"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <select class="field__control appearance-none w-full pr-[40px]" v-model="sort" @change="refetch()">
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
            <span class="field__chevron" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Нижний ряд: статус / период / заявитель (+ кастомные даты) -->
        <div class="filters-row flex flex-wrap gap-[12px] mb-[16px]">
          <!-- Статус -->
          <div class="field relative min-w-[270px]">
            <span class="field__icon" aria-hidden>
              <!-- clock -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <select
              class="field__control appearance-none w-full pr-[40px]"
              v-model="status"
              required
              @change="refetch()"
            >
              <!-- плейсхолдер: виден в контроле, НО не появляется в списке -->
              <option value="" disabled hidden>Статус</option>
              <option v-for="item in statuses" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
            <span class="field__chevron" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>

          <!-- Период заявки -->
          <div class="field relative min-w-[270px]">
            <span class="field__icon" aria-hidden>
              <!-- calendar -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M7 3v4M17 3v4M4 9h16M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <select
              class="field__control appearance-none w-full pr-[40px]"
              v-model="period"
              required
              @change="onPeriodChange"
            >
              <option value="" disabled hidden>Период заявки</option>
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="thisMonth">Этот месяц</option>
              <option value="prevMonth">Прошлый месяц</option>
              <option value="custom">Указать даты</option>
            </select>
            <span class="field__chevron" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>

          <!-- Заявитель -->
          <div class="field relative min-w-[250px]">
            <span class="field__icon" aria-hidden>
              <!-- user -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <select
              class="field__control appearance-none w-full pr-[40px]"
              v-model="applicant"
              required
              @change="refetch()"
            >
              <!-- плейсхолдер только в контроле -->
              <option value="" disabled hidden>Заявитель</option>
              <option v-for="item in applicants" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <span class="field__chevron" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>

          <!-- Даты (только для custom) -->
          <div v-if="period === 'custom'" class="field relative min-w-[180px]">
            <span class="field__icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M7 3v4M17 3v4M4 9h16" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <input
              class="field__control w-full"
              type="text"
              placeholder="Дата с (дд.мм.гггг)"
              v-model="dateFromStr"
              @blur="normalizeDateFrom"
            />
          </div>

          <div v-if="period === 'custom'" class="field relative min-w-[180px]">
            <span class="field__icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M7 3v4M17 3v4M4 9h16" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <input
              class="field__control w-full"
              type="text"
              placeholder="Дата по (дд.мм.гггг)"
              v-model="dateToStr"
              @blur="normalizeDateTo"
            />
          </div>
        </div>

        <!-- Список заявок -->
        <div class="cards">
          <div
            v-for="request in requests"
            :key="request.id"
            class="card"
            @click="handleCardClick(request.id)"
          >
<div class="card__left">
  <div class="card__header">
    <h3 class="card__title">Заявка № {{ request.id }}</h3>
    <div class="card__status">
      <span class="status" :class="statusClass(request.status?.value)">
        {{ request.status?.nameRu || '—' }}
      </span>
    </div>
  </div>

  <!-- 1) Заявитель -->
  <div class="card__row">
    <span class="card__label">Заявитель:</span>
    <span class="card__value">
      <template v-if="request.user">
        {{ request.user.surname }} {{ request.user.name }} {{ request.user.patronymic }}
      </template>
      <template v-else>
        {{ formatPhoneNumber(request.userPhone) }}
      </template>
    </span>
  </div>

  <!-- 2) Ответственный + Телефон в одной строке -->
  <div class="card__row card__row--with-phone">
    <span class="card__label">Ответственный исполнитель:</span>
    <span class="card__value">
      <template v-if="request.responsibleUser?.id">
        {{ request.responsibleUser.surname }} {{ request.responsibleUser.name }} {{ request.responsibleUser.patronymic }}
      </template>
      <button
        v-else
        class="card__link"
        @click="openSetResponsibleModal(request.id)"
      >
        Не назначен
      </button>
    </span>

     <template v-if="request.userPhone">
       <span class="card__label card__label--muted">Телефон:</span>
      <span class="card__value card__value--nowrap">
        {{ formatPhoneNumber(request.userPhone) }}
      </span>
    </template> 
  </div>


</div>


            <div class="card__right">
              <div class="card__date">
                <template v-if="request.createdAt || request.createDate">
                  Дата заявки : {{ formatDate(request.createdAt || request.createDate) }}
                </template> 
              </div>

              <button class="details-btn" @click="router.push('/user/tickets/' + request.id)">
                Подробнее
              </button>

              <!-- Стрелочка для мобильной версии -->
              <div class="card__arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>

     <template v-if="activeTab === 'akimat'">
  <!-- Фильтры сверху: поиск / тип / сортировка -->
  <div class="filters-row flex items-center gap-[12px] flex-wrap mb-[12px]">

    <!-- Поиск по обращениям -->
    <div class="field relative flex-1 min-w-[260px]">
      <span class="field__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-4.2-4.2M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <input
        class="field__control w-full"
        type="text"
        placeholder="Поиск по обращениям"
        v-model="appealSearch"
        @input="onAppealSearch"
      />
    </div>

    <!-- Тип обращения -->
    <div class="field relative min-w-[260px]">
      <span class="field__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20 7L10 17l-6-6" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <select
        class="field__control appearance-none w-full pr-[40px]"
        v-model="appealType"
        @change="refetchAppeals()"
        required
      >
        <option value="" disabled hidden>Тип обращения</option>
        <option value="COMPLAINT">Жалоба</option>
        <option value="OFFER">Предложение</option>
        <option value="REQUEST">Запрос</option>
      </select>
      <span class="field__chevron" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>

    <!-- Сортировка (справа) -->
    <div class="ml-auto field relative min-w-[260px]">
      <span class="field__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4m0 16l3-3m-3 3l-3-3"
                stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <select class="field__control appearance-none w-full pr-[40px]" v-model="appealSort" @change="refetchAppeals()">
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
      </select>
      <span class="field__chevron" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
  </div>

  <!-- Карточки обращений -->
  <div class="appeal-cards">
    <div class="appeal-card" v-for="a in appeals" :key="a.id">
      <div class="appeal-card__top">
        <h3 class="appeal-card__title">Обращение №{{ a.id }}</h3>
        <div class="appeal-card__date">
          Дата обращения : {{ formatDate(a.createTime || a.createdAt) }}
        </div>
      </div>

      <div class="appeal-card__row">
        <span class="appeal-card__label">Заявитель:</span>
        <span class="appeal-card__value">
          {{ applicantName(a) }}
        </span>
      </div>

      <div class="appeal-card__row">
        <span class="appeal-card__label">Тип обращения:</span>
        <span class="appeal-card__value">
          {{ a.type?.nameRu || a.type?.name || '—' }}
        </span>
      </div>

      <div class="appeal-card__row" v-if="a.document?.url || a.documentUrl">
        <span class="appeal-card__label">Документ:</span>
        <a class="appeal-card__file" :href="a.document?.url || a.documentUrl" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#297D85" stroke-width="1.6"/>
            <path d="M14 2v6h6" stroke="#297D85" stroke-width="1.6"/>
          </svg>
          <span>{{ a.document?.name || 'Document.pdf' }}</span>
        </a>
      </div>

      <div class="appeal-card__row">
        <span class="appeal-card__label">Обращение:</span>
        <p class="appeal-card__text">{{ a.content || a.text }}</p>
      </div>
    </div>
  </div>
  </template>

    </div>

    <!-- модалки -->
    <SetResponsibleModal
      v-if="isSetResponsibleModal"
      :roles="roles"
      :open="isSetResponsibleModal"
      @close="isSetResponsibleModal = false"
      @choose="setResponsible"
    />
    <SuccessModal v-if="showSuccessModal" :open="showSuccessModal" :text="successText" @close="closeSuccessModal" />
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getRequests, getAppeals, getStatuses, setRequestResponsible } from '@/services/akimat';
import { getUsersByRole } from '~/services/login';
import SetResponsibleModal from '~/components/user/modals/SetResponsibleModal.vue';
import SuccessModal from '~/components/layout/modals/SuccessModal.vue';

const router = useRouter();

const goToDetails = (id) => {
  router.push(`/user/tickets/${id}`);
};

const handleCardClick = (id) => {
  // Проверяем, что это мобильное устройство
  if (window.innerWidth <= 768) {
    goToDetails(id);
  }
};

const activeTab = ref('relocation');

const relocationCount = computed(() => {
  const src = requests.value?.items ?? requests.value;
   if (Array.isArray(src)) return src.length;
   if (typeof requests.value?.total === 'number') return requests.value.total;
   return 0;
});
const roles = ref([]);
const akimatCount = computed(() => {
  const src = appeals.value?.items ?? appeals.value;
  if (Array.isArray(src)) return src.length;
  if (typeof appeals.value?.total === 'number') return appeals.value.total;
  return 0;
});
const appealSearch = ref('');
const appealSort = ref('newest');
const appealType = ref('');

const requests = ref([]);
const appeals = ref([]);
const statuses = ref([]);

const status = ref('');
const period = ref('');
const applicant = ref('');
const sort = ref('newest');
const search = ref('');

const dateFrom = ref('');
const dateTo = ref('');
const dateFromStr = ref('');
const dateToStr = ref('');

const successText = ref('Ответственный назначен!');
const showSuccessModal = ref(false);
const selectedRequest = ref({});
const isSetResponsibleModal = ref(false);
const applicants = ref([]); // если будет список заявителей — подставится сюда


// лёгкий debounce для поиска
let tAppeal = null
const onAppealSearch = () => {
  clearTimeout(tAppeal)
  tAppeal = setTimeout(() => refetchAppeals(), 350)
}

// единая перезагрузка списка обращений
function refetchAppeals() {
  return fetchAppeals({
    search: appealSearch.value || undefined,
    sort: appealSort.value || undefined,
    type: appealType.value || undefined,
  })
}

let t = null;
const onSearchInput = () => {
  clearTimeout(t);
  t = setTimeout(() => refetch(), 350);
};

const toIsoDate = (dateStr) => (dateStr ? `${dateStr}T00:00:00Z` : undefined);

const refetch = async () => {
  const params = {
    status: status.value || undefined,
    from: dateFrom.value ? toIsoDate(dateFrom.value) : undefined,
    to: dateTo.value ? toIsoDate(dateTo.value) : undefined,
    sort: sort.value || undefined,
    search: search.value || undefined,
    applicantId: applicant.value || undefined,
  };
  await fetchRequests(params);
};

const onPeriodChange = () => {
  // расчёт диапазона по предустановкам
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period.value === '7d') {
    start.setDate(now.getDate() - 6);
  } else if (period.value === '30d') {
    start.setDate(now.getDate() - 29);
  } else if (period.value === 'thisMonth') {
    start.setDate(1);
  } else if (period.value === 'prevMonth') {
    start.setMonth(now.getMonth() - 1, 1);
    end.setMonth(now.getMonth(), 0);
  } else if (period.value === 'custom') {
    // ручной ввод — не трогаем
    return;
  } else {
    // пусто
    dateFrom.value = '';
    dateTo.value = '';
    dateFromStr.value = '';
    dateToStr.value = '';
    return refetch();
  }

  dateFrom.value = toInputDate(start);
  dateTo.value = toInputDate(end);
  dateFromStr.value = toHumanDate(start);
  dateToStr.value = toHumanDate(end);
  refetch();
};

function normalizeDateFrom() {
  const d = parseHumanDate(dateFromStr.value);
  dateFrom.value = d ? toInputDate(d) : '';
  refetch();
}
function normalizeDateTo() {
  const d = parseHumanDate(dateToStr.value);
  dateTo.value = d ? toInputDate(d) : '';
  refetch();
}


function parseHumanDate(s) {
  // ждём дд.мм.гггг
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s || '');
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(+d) ? null : d;
}
function toInputDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}
function toHumanDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function formatDate(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(+d)) return '—';
  return toHumanDate(d);
}

function statusClass(value) {
  switch (value) {
    case 'NEW':
    case 'CONFIRMED':
      return 'status--new';
    case 'IN_PROCESS':
      return 'status--inwork';
    case 'PENDING':
      return 'status--waiting';
    case 'REJECTED':
    case 'CLOSED':
      return 'status--rejected';
    default:
      return '';
  }
}

const closeSuccessModal = () => { showSuccessModal.value = false; };

async function fetchAppeals(params = {}) {
  const response = await getAppeals(params)
  appeals.value = response.data?.items ?? response.data ?? []
}

async function fetchStatuses() {
  const response = await getStatuses();
  statuses.value = response.data;
}
async function fetchRequests(params) {
  const response = await getRequests(params);
  requests.value = response.data?.items ?? response.data ?? [];
}
const fetchUsers = async () => {
  try {
    const response = await getUsersByRole({ roleIds: '8' });
    roles.value = response.data;
  } catch (e) {
    console.error('Ошибка при получении пользователей:', e);
  }
};

const openSetResponsibleModal = (requestId) => {
  selectedRequest.value = requestId;
  isSetResponsibleModal.value = true;
};
const setResponsible = (userId) => {
  setRequestResponsible({ requestId: selectedRequest.value, responsibleUserId: userId, comment: '' }).then(() => {
    refetch();
    isSetResponsibleModal.value = false;
    showSuccessModal.value = true;
  });
};

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';
  return `+${phone[0]} ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

onMounted(async () => {
  await fetchRequests();
  await fetchStatuses();
  await fetchAppeals();
  await fetchUsers();
});

const applicantName = (a) => {
   const u = a?.applicant || a?.user || null
   if (u) {
     // 1) готовые поля
     if (u.fullName) return u.fullName
     if (u.fio)      return u.fio
     // 2) склеиваем сами
     const glued = [u.surname, u.name, u.patronymic].filter(Boolean).join(' ').trim()
     if (glued) return glued
   }
   // 3) если нет ФИО — показываем телефон как у заявок на перезахоронение
   const phone = u?.phone || a?.userPhone
   return phone ? formatPhoneNumber(String(phone)) : '—'
 }
</script>

<style lang="scss" scoped>
/* Заголовок как в фигме (высота строки 48px) */
.page-title {
  letter-spacing: 0.02em;
  line-height: 44px;
  font-family: "FoglihtenNo06", sans-serif;
  font-size: 32px;
  margin-bottom: 8px;
}

/* Табы */
.tabs-wrapper { padding-bottom: 8px; }
.tabs { display: flex; gap: 10px; }
.tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: 12px;
  background: #F3F4F6; color: #374151; font-weight: 700; font-size: 16px;
  cursor: pointer; user-select: none;
}
.tab--active { background: #E7EAEE; color: #111827; }
.tab-count {
  min-width: 22px; height: 22px; padding: 0 6px; line-height: 22px; border-radius: 999px;
  background:#CED3D9; color:#374151; font-size:12px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;
}
.tab-count--active { background:#F7B500; color:#1F2937; font-weight:800; }

/* Поля */
.field { position: relative; }
.field__control {
  border: 1px solid #D2D8DF;
  background: #FFFFFF;
  padding: 12px 40px 12px 44px;
  border-radius: 12px;
  font-size: 16px; line-height: 24px; color: #111827; width: 100%;
}
.field__control::placeholder { color: #6B7280; }
.field__icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  display: inline-flex; pointer-events: none;
}
.field__chevron {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  pointer-events: none;
}
select.field__control { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
/* плейсхолдер виден в контроле, но его нет в выпадающем списке */
select[required].field__control:invalid { color: #6B7280; }
option[disabled][hidden] { display: none; }

/* Карточки */
.cards { display: flex; flex-direction: column; gap: 12px; }

/* две колонки как в макете */
.card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px 24px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
  transition: background-color .12s ease;
}
.card:hover { background: #F9FAFB; }

.card__left { display: grid; gap: 6px; align-content: start; }

/* заголовок */
.card__title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
}
/* базовая строка — как у тебя */
.card__row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: start;
  column-gap: 16px;
  row-gap: 2px;
  width: 100%;
}

.card__label { color: #6B7280; line-height: 24px; }
.card__value { color: #111827; line-height: 24px; min-width: 0; word-break: break-word; }

.card__row--with-phone {
  grid-template-columns: 120px fit-content(480px) max-content max-content;
  column-gap: 16px;          /* подвинуть ближе/дальше: 12–20px */
  align-items: center;
}

/* Посветлее лейбл "Телефон:" как на макете */
.card__label--muted { color: #9CA3AF; }

/* чтобы номер не рвался */
.card__value--nowrap { white-space: nowrap; }

/* мобила: всё в столбик */
@media (max-width: 720px) {
  .card__row { grid-template-columns: 1fr; row-gap: 4px; }
  .card__row--with-phone { grid-template-columns: 1fr; }
}


.card__link {
  color: #9CA3AF;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  background: none;
  border: none;
  font: inherit;
}

.card__status { margin-top: 8px; }

/* правая колонка: дата сверху, кнопка снизу */
.card__right {
  width: 200px;
  display: grid;
  align-content: space-between;
  justify-items: end;
  gap: 12px;
  white-space: nowrap;
}
.card__date { color: #6B7280; font-size: 14px; }

/* статусы с точкой */
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: nowrap;
}
.status::before { content: ""; width: 8px; height: 8px; border-radius: 999px; background: currentColor; opacity: .95; }
.status--new      { background: #E8F6EC; color: #2F9B3C; }
.status--inwork   { background: #E7F2F4; color: #297D85; }
.status--waiting  { background: #FFF1DC; color: #C77700; }
.status--rejected { background: #FDECEC; color: #D33030; }

/* кнопка "Подробнее" — жёлтая */
.details-btn {
  background: #F7B500;
  color: #1F2937;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
}
.details-btn:hover { filter: brightness(0.98); }
/* АКИМАТ — карточки */
.appeal-cards { display: flex; flex-direction: column; gap: 12px; }

.appeal-card{
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

.appeal-card__top{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
  gap: 12px;
}

.appeal-card__title{
  font-size: 24px;
  font-weight: 700;
  color: #1C140E;
  margin: 0;
}

.appeal-card__date{ color: #6B7280; font-size: 14px; }

.appeal-card__row{
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: start;
  column-gap: 16px;
  row-gap: 6px;
  margin: 6px 0;
}

.appeal-card__label{ color:#6B7280; font-weight:600; }
.appeal-card__value{ color:#111827; }
.appeal-card__text{ color:#111827; line-height: 1.5; }

.appeal-card__file{
  display: inline-flex; align-items: center; gap: 8px;
  color: #297D85; font-weight: 700; text-decoration: none;
}
.appeal-card__file:hover{ text-decoration: underline; }

@media (max-width: 720px){
  .appeal-card__top{ flex-direction: column; align-items: flex-start; gap: 4px; }
  .appeal-card__row{ grid-template-columns: 1fr; }
}


/* адаптив: правая колонка вниз */
@media (max-width: 720px) {
  .card { grid-template-columns: 1fr; }
  .card__right { width: 100%; justify-items: stretch; }
  .details-btn { justify-self: end; }
}


/* Мобильная адаптация */
@media (max-width: 768px) {
  /* Упрощаем фильтры на мобильных */
  .filters-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .field {
    min-width: 100%;
  }
  
  /* Скрываем фильтр "Заявитель" на мобильных */
  .field:nth-child(3) {
    display: none;
  }
  
  /* Адаптируем карточки для мобильных */
  .card {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    background: #FEFEFE;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
  
  .card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card__title {
    font-size: 20px;
    line-height: 26px;
    margin-bottom: 0;
    font-weight: 700;
    color: #1c1c1c;
    font-family: "FoglihtenNo06", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex: 1;
  }

  .card__status {
    margin-left: 12px;
  }

  /* Улучшаем строки в карточках */
  .card__row {
    margin-bottom: 8px;
  }

  .card__label {
    font-size: 14px;
    color: #6B7280;
    font-weight: 500;
  }

  .card__value {
    font-size: 14px;
    color: #1c1c1c;
    font-weight: 400;
  }
  
  /* Скрываем кнопку "Подробнее" на мобильных */
  .details-btn {
    display: none;
  }
  
  /* Стили для стрелочки */
  .card__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    cursor: pointer;
    z-index: 1;
  }

  .card__arrow svg {
    transition: transform 0.2s ease;
  }

  .card:hover .card__arrow svg {
    transform: translateX(2px);
  }
}

/* Скрываем стрелочку на десктопе */
@media (min-width: 769px) {
  .card__arrow {
    display: none;
  }
  
  /* Убираем курсор pointer с карточек на десктопе */
  .card {
    cursor: default;
  }
}

/* Адаптируем статусы */
.status {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 12px;
}

/* Адаптируем дату */
.card__date {
  font-size: 12px;
  margin-bottom: 8px;
  color: #6B7280;
}

  /* Улучшаем общий фон страницы на мобильных */
  .page-title {
    color: #1c1c1c;
    margin-top: 20px;
    padding-top: 20px;
  }

  /* Улучшаем табы */
  .tab {
    color: #1c1c1c;
  }

  .tab--active {
    color: #1c1c1c;
  }

  /* Улучшаем поля фильтров */
  .field__control {
    background: #f9f9f9;
    border: 1px solid #E5E7EB;
    color: #1c1c1c;
  }

  .field__control:focus {
    border-color: #F7B500;
    box-shadow: 0 0 0 2px rgba(247, 181, 0, 0.1);
  }

  /* Исправляем стили сортировки */
  .field__control {
    background: #f9f9f9 !important;
    border: 1px solid #E5E7EB !important;
    color: #6B7280 !important;
  }

  .field__control:focus {
    border-color: #F7B500 !important;
    box-shadow: 0 0 0 2px rgba(247, 181, 0, 0.1) !important;
  }

  /* Принудительно устанавливаем бежевый фон для страницы заявок */
  :global(.tickets-page) {
    background: #faf7ef !important;
  }
  
  :global(.tickets-page .user) {
    background: #faf7ef !important;
  }
</style>
