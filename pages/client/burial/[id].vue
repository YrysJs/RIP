<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Cookies from "js-cookie";

import { getCemeteries } from "~/services/cemetery";
import { getUser } from "~/services/login";
import { parseJwt } from "~/utils/parseJwt";
// Если у тебя есть API для получения запроса по id — подключи:
// import { getRequestById } from "~/services/client";

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
  number: "№00001",
  fromBurialId: 102,
  toBurialId: 102,
  reason: "Lorem ipsum dolor sit amet...",
  death_certificate: "",
  proof_of_relation: "",
  grave_doc: "",
});

/* -------- derived -------- */
const cemList = computed(() =>
  Array.isArray(cemeteries.value) && cemeteries.value.length
    ? cemeteries.value
    : cemFallback
);

const cemNameById = (id) =>
  cemList.value.find((c) => String(c.id) === String(id))?.name || "—";

/* -------- init -------- */
onMounted(async () => {
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
    cemeteries.value = c?.data || [];
  } catch {
    cemeteries.value = [];
  }

  // источник данных: 1) API по id  2) props.request  3) мок
  const id = props.requestId || route.params?.id;
  if (id) {
    // Раскомментируй при наличии API:
    // const r = await getRequestById(id);
    // if (r?.data) data.value = normalize(r.data);
    data.value.number = `№${String(id).padStart(5, "0")}`;
  } else if (props.request) {
    data.value = normalize(props.request);
  }
});

/* -------- utils -------- */
function normalize(r) {
  return {
    number: r.number || "№00001",
    fromBurialId: r.fromBurialId ?? 0,
    toBurialId: r.toBurialId ?? 0,
    reason: r.reason || "",
    death_certificate: r.death_certificate || "",
    proof_of_relation: r.proof_of_relation || "",
    grave_doc: r.grave_doc || "",
  };
}

function fileTitle(url) {
  if (!url || typeof url !== "string") return "Document.pdf";
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name || "Document.pdf";
  } catch {
    return "Document.pdf";
  }
}

</script>

<template>
  <NuxtLayout name="client">
    <div>
      <div class="topbar">
        <h1 class="page-title">ЗАПРОС НА ПЕРЕЗАХОРОНЕНИЕ</h1>
        <div class="req-num">Запрос на перезахоронение {{ data.number }}</div>
      </div>

      <div class="view-card">
        <div class="rows">
          <div class="row">
            <div class="label">Старое место<br />захоронения:</div>
            <div class="value">{{ cemNameById(data.fromBurialId) }}</div>
          </div>

          <div class="row">
            <div class="label">Новое место<br />захоронения:</div>
            <div class="value">{{ cemNameById(data.toBurialId) }}</div>
          </div>

          <div class="row">
            <div class="label">Причина:</div>
            <div class="value">{{ data.reason ?? "" }}</div>
          </div>

          <div class="row">
            <div class="label">Свидетельство о<br />смерти:</div>
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
              <span v-else>—</span>
            </div>
          </div>

          <div class="row">
            <div class="label">Подтверждение<br />родства заявителя:</div>
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
              <span v-else>—</span>
            </div>
          </div>

          <div class="row">
            <div class="label">Документ на могилу:</div>
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
              <span v-else>—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.topbar {
  padding-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #eee;
}
.page-title {
  font-family: "FoglihtenNo06", serif;
  letter-spacing: 0.02em;
  font-size: 32px;
  color: #1c140e;
  margin: 0;
}
.req-num {
  color: #8c8c8c;
  font-size: 14px;
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
  .row {
    grid-template-columns: 1fr;
  }
  .label {
    color: #000;
    font-weight: 500;
  }
}
</style>
