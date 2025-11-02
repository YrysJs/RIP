<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Cookies from "js-cookie";
import { useI18n } from 'vue-i18n';

import { getCemeteries } from "~/services/cemetery";
import { getUser } from "~/services/login";
import { getMyRequests } from "~/services/akimat";
import { parseJwt } from "~/utils/parseJwt";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

/* -------- props (необязательные) -------- */
const props = defineProps({
  requestId: { type: [String, Number], default: null },
  request: {
    type: Object,
    default: () => null,
  },

});


/* -------- state -------- */
const token = ref(Cookies.get("token"));
const userInfo = ref(null);

const cemeteries = ref([]);
const cemFallback = [
  { id: 101, name: "Центральное кладбище" },
  { id: 102, name: "Северное кладбище" },
  { id: 103, name: "Южное кладбище" },
];

const data = ref({
  id: null,
  number: "№00001",
  fromBurialId: 0,
  toBurialId: 0,
  reason: "",
  death_certificate: null,
  proof_of_relation: null,
  grave_doc: null,
  status: null,
  user: null,
  akimatDTO: null,
  foreign_cemetery: null,
});

const loading = ref(true);
const error = ref(null);

/* -------- derived -------- */
const cemList = computed(() =>
  Array.isArray(cemeteries.value) && cemeteries.value.length
    ? cemeteries.value
    : cemFallback
);

const cemNameById = (id) =>
  cemList.value.find((c) => String(c.id) === String(id))?.name || t('common.notSpecified');

/* -------- init -------- */
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // юзер (если нужен кому-то из заголовков/логики)
    const parsed = parseJwt(token.value || "");
    try {
      const u = await getUser({ phone: parsed?.sub });
      userInfo.value = u?.data ?? null;
    } catch {
      userInfo.value = null;
    }

    // кладбища
    try {
      const c = await getCemeteries();
      cemeteries.value = c?.data?.data || [];
    } catch {
      cemeteries.value = [];
    }

    // получаем ID из роута
    const requestId = route.params?.id;
    if (requestId) {
      // загружаем все запросы пользователя
      const response = await getMyRequests();
      const requests = response?.data || [];
      
      // находим запрос по ID
      const foundRequest = requests.find(req => String(req.id) === String(requestId));
      
      if (foundRequest) {
        data.value = normalize(foundRequest);
      } else {
        error.value = t('client.burial.requestNotFound');
      }
    } else if (props.request) {
      data.value = normalize(props.request);
    }
  } catch (err) {
    console.error(t('client.burial.loadError'), err);
    error.value = t('client.burial.loadErrorText');
  } finally {
    loading.value = false;
  }
});

/* -------- utils -------- */
function normalize(r) {
  return {
    id: r.id,
    number: `№${String(r.id).padStart(5, "0")}`,
    fromBurialId: r.fromBurialId ?? 0,
    toBurialId: r.toBurialId ?? 0,
    reason: r.reason || "",
    death_certificate: r.death_certificate?.url || null,
    proof_of_relation: r.proof_of_relation?.url || null,
    grave_doc: r.grave_doc?.url || null,
    status: r.status,
    user: r.user,
    akimatDTO: r.akimatDTO,
    foreign_cemetery: r.foreign_cemetery,
  };
}

function fileTitle(url) {
  if (!url || typeof url !== "string") return t('common.defaultDocument');
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name || t('common.defaultDocument');
  } catch {
    return t('common.defaultDocument');
  }
}

</script>

<template>
  <NuxtLayout name="client">
    <div>
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-state">
        <div class="loader">{{ $t('common.loading') }}</div>
      </div>

      <!-- Состояние ошибки -->
      <div v-else-if="error" class="error-state">
        <div class="error-message">{{ error }}</div>
        <button class="btn-yellow" @click="$router.push('/client/burial')">
          {{ $t('client.burial.backToList') }}
        </button>
      </div>

      <!-- Основной контент -->
      <div v-else>
        <div class="topbar">
          <h1 class="page-title">{{ $t('client.burial.reburialRequestTitle') }}</h1>
          <div class="req-info">
            <div class="req-num">{{ $t('client.burial.reburialRequest') }} {{ data.number }}</div>
<!--            <div v-if="data.status" class="req-status" :class="`status-${data.status.value.toLowerCase()}`">-->
<!--              {{ data.status.nameRu }}-->
<!--            </div>-->
          </div>
        </div>

        <div class="view-card">
          <div class="rows">
            <div class="row">
              <div class="label">{{ $t('burialCreate.oldBurialPlace') }}</div>
              <div class="value">{{ cemNameById(data.fromBurialId) }}</div>
            </div>

            <div class="row">
              <div class="label">{{ $t('burialCreate.newBurialPlace') }}</div>
              <div class="value">{{ cemNameById(data.toBurialId) }}</div>
            </div>

            <div v-if="data.foreign_cemetery" class="row">
              <div class="label">{{ $t('client.burial.foreignCemetery') }}</div>
              <div class="value">{{ data.foreign_cemetery }}</div>
            </div>

            <div class="row">
              <div class="label">{{ $t('burialCreate.reason') }}</div>
              <div class="value">{{ data.reason || $t('common.notSpecified') }}</div>
            </div>

            <div v-if="data.user" class="row">
              <div class="label">{{ $t('client.burial.applicant') }}</div>
              <div class="value">{{ data.user.fio }}</div>
            </div>

            <div class="row">
              <div class="label">{{ $t('burialCreate.deathCertificate') }}</div>
              <div class="value">
                <a
                  v-if="data.death_certificate"
                  class="doc-link"
                  :href="data.death_certificate"
                  target="_blank"
                  rel="noopener"
                >
                  <img class="doc-ico" src="/icons/file.svg" alt="" />
                  <span>{{ fileTitle(data.death_certificate) }}</span>
                </a>
                <span v-else class="no-doc">{{ $t('common.notSpecified') }}</span>
              </div>
            </div>

            <div class="row">
              <div class="label">{{ $t('burialCreate.proofOfRelation') }}</div>
              <div class="value">
                <a
                  v-if="data.proof_of_relation"
                  class="doc-link"
                  :href="data.proof_of_relation"
                  target="_blank"
                  rel="noopener"
                >
                  <img class="doc-ico" src="/icons/file.svg" alt="" />
                  <span>{{ fileTitle(data.proof_of_relation) }}</span>
                </a>
                <span v-else class="no-doc">{{ $t('common.notSpecified') }}</span>
              </div>
            </div>

            <div class="row">
              <div class="label">{{ $t('burialCreate.graveDocument') }}</div>
              <div class="value">
                <a
                  v-if="data.grave_doc"
                  class="doc-link"
                  :href="data.grave_doc"
                  target="_blank"
                  rel="noopener"
                >
                  <img class="doc-ico" src="/icons/file.svg" alt="" />
                  <span>{{ fileTitle(data.grave_doc) }}</span>
                </a>
                <span v-else class="no-doc">{{ $t('common.notSpecified') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Состояния загрузки и ошибки */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.loader {
  font-size: 18px;
  color: #8c8c8c;
}

.error-message {
  font-size: 18px;
  color: #ef4444;
  text-align: center;
}

.topbar {
  padding-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #eee;
}
.page-title {
  font-family: "Manrope", serif;
  letter-spacing: 0.02em;
  font-size: 32px;
  color: #1c140e;
  margin: 0;
}
.req-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.req-num {
  color: #8c8c8c;
  font-size: 14px;
}
.req-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}
.status-new {
  background: #dbeafe;
  color: #1e40af;
}
.status-in_progress {
  background: #fef3c7;
  color: #d97706;
}
.status-completed {
  background: #d1fae5;
  color: #059669;
}
.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

/* Карточка просмотра */
.view-card {
  background: #fff;
  padding: 20px 16px;
  border-radius: 12px;
}
.rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.row {
  display: grid;
  grid-template-columns: 220px 1fr;
  align-items: start;
  gap: 16px;
}
.label {
  font-size: 14px;
  color: #5c6771;
  line-height: 1.3;
}
.value {
  font-size: 16px;
  color: #111827;
}

/* Детали акимата */
.akimat-details {
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

/* Ссылки на документы */
.doc-link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #1e3a8a;
  text-decoration: none;
}
.doc-link:hover {
  text-decoration: underline;
}
.doc-ico {
  width: 18px;
  height: 18px;
}
.no-doc {
  color: #9ca3af;
  font-style: italic;
}

/* Кнопка */
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.btn-yellow {
  background: #e9b949;
  color: #000;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  transition: background-color 0.15s ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.btn-yellow:hover {
  background-color: #d1a53f;
}
.btn-yellow:active {
  background-color: #b88f34;
}

/* Адаптив */
@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .req-info {
    align-items: flex-start;
  }
  .page-title {
    font-size: 24px;
  }
  .row {
    grid-template-columns: 1fr;
  }
  .label {
    color: #000;
    font-weight: 500;
  }
  .btn-yellow {
    width: 100%;
  }
}
</style>
