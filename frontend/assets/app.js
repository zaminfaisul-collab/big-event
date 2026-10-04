const API_BASE = "/api";
const TOKEN_KEY = "big_event_token";
const PAGE_SIZE = 8;

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  categories: [],
  articles: [],
  total: 0,
  pageNum: 1,
  pageSize: PAGE_SIZE,
  activeView: "dashboard",
  pendingDelete: null,
  articleSearch: "",
  categoryId: "",
  articleState: "",
  overviewArticles: [],
};

const viewMeta = {
  dashboard: { eyebrow: "工作台", title: "内容概览" },
  articles: { eyebrow: "内容库", title: "文章管理" },
  categories: { eyebrow: "内容结构", title: "分类管理" },
  profile: { eyebrow: "账号设置", title: "个人资料" },
};

const elements = {
  authView: document.querySelector("#authView"),
  appView: document.querySelector("#appView"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  openSidebar: document.querySelector("#openSidebar"),
  closeSidebar: document.querySelector("#closeSidebar"),
  logoutButton: document.querySelector("#logoutButton"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  pageTitle: document.querySelector("#pageTitle"),
  todayLabel: document.querySelector("#todayLabel"),
  welcomeName: document.querySelector("#welcomeName"),
  sidebarAvatar: document.querySelector("#sidebarAvatar"),
  sidebarNickname: document.querySelector("#sidebarNickname"),
  sidebarUsername: document.querySelector("#sidebarUsername"),
  statTotal: document.querySelector("#statTotal"),
  statPublished: document.querySelector("#statPublished"),
  statDraft: document.querySelector("#statDraft"),
  statCategories: document.querySelector("#statCategories"),
  recentArticles: document.querySelector("#recentArticles"),
  categoryChart: document.querySelector("#categoryChart"),
  articleTableBody: document.querySelector("#articleTableBody"),
  articleEmpty: document.querySelector("#articleEmpty"),
  articlePagination: document.querySelector("#articlePagination"),
  paginationSummary: document.querySelector("#paginationSummary"),
  pageIndicator: document.querySelector("#pageIndicator"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  articleSearch: document.querySelector("#articleSearch"),
  articleCategoryFilter: document.querySelector("#articleCategoryFilter"),
  articleStateFilter: document.querySelector("#articleStateFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  categoryGrid: document.querySelector("#categoryGrid"),
  categoryEmpty: document.querySelector("#categoryEmpty"),
  profileAvatar: document.querySelector("#profileAvatar"),
  profileNickname: document.querySelector("#profileNickname"),
  profileUsername: document.querySelector("#profileUsername"),
  profileEmail: document.querySelector("#profileEmail"),
  profileCreatedAt: document.querySelector("#profileCreatedAt"),
  profileForm: document.querySelector("#profileForm"),
  passwordForm: document.querySelector("#passwordForm"),
  avatarInput: document.querySelector("#avatarInput"),
  articleModal: document.querySelector("#articleModal"),
  articleModalEyebrow: document.querySelector("#articleModalEyebrow"),
  articleModalTitle: document.querySelector("#articleModalTitle"),
  articleForm: document.querySelector("#articleForm"),
  coverPreview: document.querySelector("#coverPreview"),
  coverPlaceholder: document.querySelector("#coverPlaceholder"),
  categoryModal: document.querySelector("#categoryModal"),
  categoryModalTitle: document.querySelector("#categoryModalTitle"),
  categoryForm: document.querySelector("#categoryForm"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmTitle: document.querySelector("#confirmTitle"),
  confirmMessage: document.querySelector("#confirmMessage"),
  confirmAction: document.querySelector("#confirmAction"),
  toastStack: document.querySelector("#toastStack"),
  loadingLayer: document.querySelector("#loadingLayer"),
};

function initIcons(root = document) {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.9,
      },
      nameAttr: "data-lucide",
      root,
    });
  }
}

function getApiPath(path) {
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (state.token) {
    headers.set("Authorization", state.token);
  }

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(getApiPath(path), {
      ...options,
      headers,
    });
  } catch {
    throw new Error("无法连接服务，请确认后端已在 8080 端口启动");
  }

  if (response.status === 401) {
    clearSession();
    showAuth();
    throw new Error("登录状态已过期，请重新登录");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`请求失败（${response.status}）`);
  }

  if (!response.ok) {
    throw new Error(result.message || `请求失败（${response.status}）`);
  }

  if (result.code !== 0) {
    throw new Error(result.message || "操作失败");
  }

  return result.data;
}

function setLoading(visible) {
  elements.loadingLayer.hidden = !visible;
}

function showToast(message, type = "success", title) {
  const icon = {
    success: "circle-check",
    error: "circle-alert",
    info: "info",
  }[type];
  const heading = title || {
    success: "操作成功",
    error: "操作失败",
    info: "提示",
  }[type];
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon"><i data-lucide="${icon}"></i></span>
    <div><strong>${escapeHtml(heading)}</strong><span>${escapeHtml(message)}</span></div>
  `;
  elements.toastStack.append(toast);
  initIcons(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(12px)";
    window.setTimeout(() => toast.remove(), 180);
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fallbackAvatar(name = "用户") {
  const initial = escapeHtml(String(name || "用").slice(0, 1));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
      <rect width="100%" height="100%" rx="80" fill="#e9efff"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        fill="#315efb" font-family="sans-serif" font-size="64" font-weight="700">${initial}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function fallbackCover(title = "文章") {
  const safeTitle = escapeHtml(String(title || "文").slice(0, 1));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#e9efff"/>
          <stop offset="1" stop-color="#dce8ff"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="390" cy="60" r="90" fill="#fff" opacity=".38"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        fill="#315efb" font-family="sans-serif" font-size="74" font-weight="700">${safeTitle}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function formatDate(value, includeTime = false) {
  if (!value) return "-";
  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  }).format(date);
}

function getCategoryName(categoryId) {
  return (
    state.categories.find((item) => Number(item.id) === Number(categoryId))
      ?.categoryName || "未分类"
  );
}

function categoryOptionMarkup(selectedId = "") {
  if (!state.categories.length) {
    return '<option value="">请先创建分类</option>';
  }
  return [
    '<option value="">请选择分类</option>',
    ...state.categories.map(
      (category) => `
        <option value="${category.id}" ${
          String(selectedId) === String(category.id) ? "selected" : ""
        }>${escapeHtml(category.categoryName)}</option>
      `,
    ),
  ].join("");
}

function renderCategoryFilters() {
  elements.articleCategoryFilter.innerHTML = [
    '<option value="">全部分类</option>',
    ...state.categories.map(
      (category) =>
        `<option value="${category.id}">${escapeHtml(category.categoryName)}</option>`,
    ),
  ].join("");
  elements.articleCategoryFilter.value = state.categoryId;
  elements.articleStateFilter.value = state.articleState;
}

function setAuthTab(tab) {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    const active = button.dataset.authTab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  elements.loginForm.hidden = tab !== "login";
  elements.registerForm.hidden = tab !== "register";
}

function showAuth() {
  elements.authView.hidden = false;
  elements.appView.hidden = true;
  closeSidebar();
  setAuthTab("login");
}

function showApp() {
  elements.authView.hidden = true;
  elements.appView.hidden = false;
}

function clearSession() {
  state.token = "";
  state.user = null;
  state.categories = [];
  state.articles = [];
  state.overviewArticles = [];
  localStorage.removeItem(TOKEN_KEY);
}

function updateUserUi() {
  const user = state.user || {};
  const avatar = user.userPic || fallbackAvatar(user.nickname || user.username);
  const nickname = user.nickname || "内容创作者";
  const username = user.username ? `@${user.username}` : "@user";

  elements.sidebarAvatar.src = avatar;
  elements.sidebarNickname.textContent = nickname;
  elements.sidebarUsername.textContent = username;
  elements.welcomeName.textContent = nickname;
  elements.profileAvatar.src = avatar;
  elements.profileNickname.textContent = nickname;
  elements.profileUsername.textContent = username;
  elements.profileEmail.textContent = user.email || "未填写邮箱";
  elements.profileCreatedAt.textContent = user.createTime
    ? `加入于 ${formatDate(user.createTime)}`
    : "创建时间未知";
  elements.profileForm.elements.nickname.value = user.nickname || "";
  elements.profileForm.elements.email.value = user.email || "";
}

async function loadCategories() {
  state.categories = (await request("/category")) || [];
  renderCategoryFilters();
  renderCategories();
}

async function loadUser() {
  state.user = await request("/user/userInfo");
  updateUserUi();
}

async function loadOverviewArticles() {
  const data = await request(
    `/article?pageNum=1&pageSize=1000&_=${Date.now()}`,
  );
  state.overviewArticles = data?.items || [];
  state.total = Number(data?.total || 0);
  renderOverview();
}

async function loadArticles() {
  elements.articleTableBody.innerHTML = `
    ${Array.from(
      { length: 5 },
      () => `
        <tr>
          <td><div class="article-cell"><span class="skeleton" style="width:58px;height:44px"></span><div><span class="skeleton" style="width:180px;height:13px"></span><span class="skeleton" style="width:100px;height:10px"></span></div></div></td>
          <td><span class="skeleton" style="display:block;width:72px;height:12px"></span></td>
          <td><span class="skeleton" style="display:block;width:54px;height:22px;border-radius:20px"></span></td>
          <td><span class="skeleton" style="display:block;width:110px;height:12px"></span></td>
          <td></td>
        </tr>
      `,
    ).join("")}
  `;

  const params = new URLSearchParams({
    pageNum: String(state.pageNum),
    pageSize: String(state.pageSize),
  });

  if (state.categoryId) params.set("categoryId", state.categoryId);
  if (state.articleState) params.set("state", state.articleState);

  const data = await request(`/article?${params.toString()}`);
  state.articles = data?.items || [];
  state.total = Number(data?.total || 0);
  renderArticles();
}

function renderOverview() {
  const published = state.overviewArticles.filter(
    (article) => article.state === "已发布",
  ).length;
  const drafts = state.overviewArticles.filter(
    (article) => article.state === "草稿",
  ).length;

  elements.statTotal.textContent = String(state.total);
  elements.statPublished.textContent = String(published);
  elements.statDraft.textContent = String(drafts);
  elements.statCategories.textContent = String(state.categories.length);

  const recent = [...state.overviewArticles]
    .sort((a, b) => String(b.updateTime || "").localeCompare(String(a.updateTime || "")))
    .slice(0, 5);

  if (!recent.length) {
    elements.recentArticles.innerHTML = `
      <div class="empty-state">
        <span><i data-lucide="files"></i></span>
        <h3>还没有文章</h3>
        <p>新建文章后，最近更新会展示在这里。</p>
      </div>
    `;
  } else {
    elements.recentArticles.innerHTML = recent
      .map(
        (article) => `
          <article class="recent-item">
            <img class="recent-item__cover" src="${escapeHtml(
              article.coverImg || fallbackCover(article.title),
            )}" alt="" onerror="this.src='${fallbackCover(article.title)}'" />
            <div class="recent-item__content">
              <strong>${escapeHtml(article.title)}</strong>
              <div class="recent-item__meta">
                <span><i data-lucide="folder"></i>${escapeHtml(
                  getCategoryName(article.categoryId),
                )}</span>
                <span><i data-lucide="clock-3"></i>${formatDate(
                  article.updateTime,
                )}</span>
              </div>
            </div>
            <span class="status-chip ${
              article.state === "已发布"
                ? "status-chip--published"
                : "status-chip--draft"
            }">${escapeHtml(article.state)}</span>
          </article>
        `,
      )
      .join("");
  }

  const categoryCounts = state.categories.map((category) => ({
    name: category.categoryName,
    count: state.overviewArticles.filter(
      (article) => Number(article.categoryId) === Number(category.id),
    ).length,
  }));
  const maxCount = Math.max(1, ...categoryCounts.map((item) => item.count));

  if (!categoryCounts.length) {
    elements.categoryChart.innerHTML = `
      <div class="empty-state" style="padding:38px 8px">
        <span><i data-lucide="folder-plus"></i></span>
        <h3>暂无分类数据</h3>
        <p>创建分类后即可查看分布。</p>
      </div>
    `;
  } else {
    elements.categoryChart.innerHTML = categoryCounts
      .slice(0, 6)
      .map(
        (item, index) => `
          <div class="chart-item">
            <div class="chart-item__header">
              <span>${escapeHtml(item.name)}</span>
              <span>${item.count} 篇</span>
            </div>
            <div class="chart-track">
              <span style="width:${Math.max(
                (item.count / maxCount) * 100,
                item.count ? 6 : 1,
              )}%;opacity:${1 - index * 0.08}"></span>
            </div>
          </div>
        `,
      )
      .join("");
  }

  initIcons(elements.recentArticles);
  initIcons(elements.categoryChart);
}

function renderArticles() {
  const search = state.articleSearch.trim().toLowerCase();
  const visibleArticles = search
    ? state.articles.filter((article) =>
        String(article.title || "").toLowerCase().includes(search),
      )
    : state.articles;

  const hasArticles = visibleArticles.length > 0;
  elements.articleEmpty.hidden = hasArticles;
  elements.articlePagination.hidden = !state.total;
  elements.articleTableBody.closest(".table-wrap").hidden = !hasArticles;

  elements.articleTableBody.innerHTML = visibleArticles
    .map(
      (article) => `
        <tr>
          <td>
            <div class="article-cell">
              <img src="${escapeHtml(
                article.coverImg || fallbackCover(article.title),
              )}" alt="" onerror="this.src='${fallbackCover(article.title)}'" />
              <div>
                <strong>${escapeHtml(article.title)}</strong>
                <span># ${String(article.id).padStart(4, "0")}</span>
              </div>
            </div>
          </td>
          <td>${escapeHtml(getCategoryName(article.categoryId))}</td>
          <td>
            <span class="status-chip ${
              article.state === "已发布"
                ? "status-chip--published"
                : "status-chip--draft"
            }">${escapeHtml(article.state)}</span>
          </td>
          <td>${formatDate(article.updateTime, true)}</td>
          <td>
            <div class="table-actions">
              <button class="icon-button" type="button" data-edit-article="${
                article.id
              }" aria-label="编辑文章" title="编辑">
                <i data-lucide="pencil"></i>
              </button>
              <button class="icon-button icon-button--danger" type="button" data-delete-article="${
                article.id
              }" aria-label="删除文章" title="删除">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
  const currentStart = state.total ? (state.pageNum - 1) * state.pageSize + 1 : 0;
  const currentEnd = Math.min(state.pageNum * state.pageSize, state.total);

  elements.paginationSummary.textContent = search
    ? `当前页找到 ${visibleArticles.length} 篇，全部共 ${state.total} 篇`
    : `显示 ${currentStart}-${currentEnd} 篇，共 ${state.total} 篇`;
  elements.pageIndicator.textContent = `${state.pageNum} / ${totalPages}`;
  elements.prevPage.disabled = state.pageNum <= 1;
  elements.nextPage.disabled = state.pageNum >= totalPages;
  initIcons(elements.articleTableBody);
}

function renderCategories() {
  const hasCategories = state.categories.length > 0;
  elements.categoryGrid.hidden = !hasCategories;
  elements.categoryEmpty.hidden = hasCategories;

  elements.categoryGrid.innerHTML = state.categories
    .map(
      (category) => `
        <article class="category-card">
          <div class="category-card__top">
            <span class="category-card__icon"><i data-lucide="folder"></i></span>
            <div class="category-card__actions">
              <button class="icon-button" type="button" data-edit-category="${
                category.id
              }" aria-label="编辑分类" title="编辑">
                <i data-lucide="pencil"></i>
              </button>
            </div>
          </div>
          <h3>${escapeHtml(category.categoryName)}</h3>
          <p>创建于 ${formatDate(category.createTime)}</p>
          <span class="category-card__alias">
            <i data-lucide="tag"></i>
            ${escapeHtml(category.categoryAlias)}
          </span>
        </article>
      `,
    )
    .join("");

  initIcons(elements.categoryGrid);
  initIcons(elements.categoryEmpty);
}

async function navigate(view) {
  if (!viewMeta[view]) return;
  state.activeView = view;
  const meta = viewMeta[view];

  elements.pageEyebrow.textContent = meta.eyebrow;
  elements.pageTitle.textContent = meta.title;
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== view;
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (!state.user) {
    setLoading(true);
    try {
      await loadUser();
    } catch (error) {
      showToast(error.message, "error");
      return;
    } finally {
      setLoading(false);
    }
  }

  if (view === "dashboard") {
    setLoading(true);
    try {
      await Promise.all([loadOverviewArticles(), loadCategories()]);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (view === "articles" && !state.categories.length) {
    try {
      await loadCategories();
    } catch (error) {
      showToast(error.message, "error");
    }
  }
}

function openSidebar() {
  elements.sidebar.classList.add("is-open");
  elements.sidebarBackdrop.classList.add("is-open");
  document.body.classList.add("is-locked");
}

function closeSidebar() {
  elements.sidebar.classList.remove("is-open");
  elements.sidebarBackdrop.classList.remove("is-open");
  document.body.classList.remove("is-locked");
}

function openModal(modalElement) {
  modalElement.hidden = false;
  document.body.classList.add("is-locked");
  const firstInput = modalElement.querySelector("input:not([type='hidden']), select, textarea");
  window.setTimeout(() => firstInput?.focus(), 80);
}

function closeModal(modalElement) {
  modalElement.hidden = true;
  if (!document.querySelector(".modal:not([hidden])")) {
    document.body.classList.remove("is-locked");
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.hidden = true;
  });
  document.body.classList.remove("is-locked");
}

function openArticleModal(article = null) {
  elements.articleForm.reset();
  const form = elements.articleForm;
  form.elements.id.value = article?.id || "";
  form.elements.title.value = article?.title || "";
  form.elements.content.value = article?.content || "";
  form.elements.categoryId.innerHTML = categoryOptionMarkup(
    article?.categoryId || "",
  );
  form.elements.state.value = article?.state || "草稿";
  form.elements.coverImg.value = article?.coverImg || "";
  elements.articleModalEyebrow.textContent = article ? "编辑内容" : "文章编辑器";
  elements.articleModalTitle.textContent = article ? "编辑文章" : "新建文章";
  updateCoverPreview();
  openModal(elements.articleModal);
}

function updateCoverPreview() {
  const url = elements.articleForm.elements.coverImg.value.trim();
  elements.coverPreview.hidden = !url;
  elements.coverPlaceholder.hidden = Boolean(url);
  if (url) {
    elements.coverPreview.src = url;
    elements.coverPreview.onerror = () => {
      elements.coverPreview.hidden = true;
      elements.coverPlaceholder.hidden = false;
    };
  } else {
    elements.coverPreview.removeAttribute("src");
  }
}

async function fetchArticleDetail(id) {
  try {
    setLoading(true);
    return await request(`/article/detail?id=${encodeURIComponent(id)}`);
  } finally {
    setLoading(false);
  }
}

async function handleArticleEdit(id) {
  try {
    const article = await fetchArticleDetail(id);
    if (!article) {
      showToast("文章不存在或已被删除", "error");
      return;
    }
    openArticleModal(article);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function openCategoryModal(category = null) {
  elements.categoryForm.reset();
  elements.categoryForm.elements.id.value = category?.id || "";
  elements.categoryForm.elements.categoryName.value = category?.categoryName || "";
  elements.categoryForm.elements.categoryAlias.value = category?.categoryAlias || "";
  elements.categoryModalTitle.textContent = category ? "编辑分类" : "新建分类";
  openModal(elements.categoryModal);
}

function askDelete({ title, message, onConfirm }) {
  state.pendingDelete = onConfirm;
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  openModal(elements.confirmModal);
}

async function submitLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const body = new URLSearchParams({
    username: form.elements.username.value.trim(),
    password: form.elements.password.value,
  });

  setLoading(true);
  try {
    const token = await request("/user/login", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    state.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    form.reset();
    await enterApp();
    showToast("欢迎回来，工作台已准备就绪", "success", "登录成功");
  } catch (error) {
    showToast(error.message, "error", "登录失败");
  } finally {
    setLoading(false);
  }
}

async function submitRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;
  const confirmPassword = form.elements.confirmPassword.value;

  if (password !== confirmPassword) {
    showToast("两次输入的密码不一致", "error");
    return;
  }

  const body = new URLSearchParams({ username, password });
  setLoading(true);
  try {
    await request("/user/register", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    form.reset();
    setAuthTab("login");
    elements.loginForm.elements.username.value = username;
    elements.loginForm.elements.password.focus();
    showToast("账号创建成功，请继续登录", "success", "注册成功");
  } catch (error) {
    showToast(error.message, "error", "注册失败");
  } finally {
    setLoading(false);
  }
}

async function submitArticle(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  if (!state.categories.length) {
    showToast("请先创建文章分类", "error");
    return;
  }

  const id = form.elements.id.value;
  const payload = {
    ...(id ? { id: Number(id) } : {}),
    title: form.elements.title.value.trim(),
    content: form.elements.content.value.trim(),
    coverImg: form.elements.coverImg.value.trim(),
    state: form.elements.state.value,
    categoryId: Number(form.elements.categoryId.value),
  };

  setLoading(true);
  try {
    await request("/article", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    closeModal(elements.articleModal);
    await Promise.all([loadArticles(), loadOverviewArticles()]);
    showToast(id ? "文章内容已经更新" : "新文章已经保存", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function deleteArticle(id) {
  const article = state.articles.find((item) => Number(item.id) === Number(id));
  askDelete({
    title: "删除这篇文章？",
    message: `“${article?.title || "当前文章"}”删除后无法恢复。`,
    onConfirm: async () => {
      setLoading(true);
      try {
        await request(`/article?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        closeModal(elements.confirmModal);
        if (state.articles.length === 1 && state.pageNum > 1) {
          state.pageNum -= 1;
        }
        await Promise.all([loadArticles(), loadOverviewArticles()]);
        showToast("文章已经删除", "success");
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    },
  });
}

async function submitCategory(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const id = form.elements.id.value;
  const payload = {
    ...(id ? { id: Number(id) } : {}),
    categoryName: form.elements.categoryName.value.trim(),
    categoryAlias: form.elements.categoryAlias.value.trim(),
  };

  setLoading(true);
  try {
    await request("/category", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    closeModal(elements.categoryModal);
    await loadCategories();
    await loadOverviewArticles();
    showToast(id ? "分类信息已经更新" : "新分类已经创建", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function submitProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity() || !state.user) return;

  setLoading(true);
  try {
    await request("/user/update", {
      method: "PUT",
      body: JSON.stringify({
        id: state.user.id,
        nickname: form.elements.nickname.value.trim(),
        email: form.elements.email.value.trim(),
      }),
    });
    await loadUser();
    showToast("个人资料已经更新", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function submitPassword(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const oldPassword = form.elements.oldPassword.value;
  const newPassword = form.elements.newPassword.value;
  const confirmPassword = form.elements.confirmPassword.value;

  if (newPassword !== confirmPassword) {
    showToast("两次输入的新密码不一致", "error");
    return;
  }

  setLoading(true);
  try {
    await request("/user/updatePwd", {
      method: "PATCH",
      body: JSON.stringify({
        old_pwd: oldPassword,
        new_pwd: newPassword,
        re_pwd: confirmPassword,
      }),
    });
    form.reset();
    showToast("密码已经更新，请妥善保管", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function uploadAvatar(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("图片大小不能超过 5MB", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setLoading(true);
  try {
    const avatarUrl = await request("/upload", {
      method: "POST",
      body: formData,
    });
    await request("/user/updateAvatar", {
      method: "PATCH",
      body: new URLSearchParams({ avatarUrl }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    await loadUser();
    showToast("头像已经更新", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    elements.avatarInput.value = "";
    setLoading(false);
  }
}

async function enterApp() {
  showApp();
  setLoading(true);
  try {
    await Promise.all([loadUser(), loadCategories()]);
    await navigate("dashboard");
  } catch (error) {
    showToast(error.message, "error", "加载失败");
  } finally {
    setLoading(false);
  }
}

function applyArticleFilters() {
  state.articleSearch = elements.articleSearch.value;
  state.categoryId = elements.articleCategoryFilter.value;
  state.articleState = elements.articleStateFilter.value;
  state.pageNum = 1;

  if (state.articleSearch) {
    renderArticles();
    return;
  }

  loadArticles().catch((error) => showToast(error.message, "error"));
}

function resetFilters() {
  elements.articleSearch.value = "";
  elements.articleCategoryFilter.value = "";
  elements.articleStateFilter.value = "";
  state.articleSearch = "";
  state.categoryId = "";
  state.articleState = "";
  state.pageNum = 1;
  loadArticles().catch((error) => showToast(error.message, "error"));
}

function bindEvents() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => setAuthTab(button.dataset.authTab));
  });

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.setAttribute("aria-label", shouldShow ? "隐藏密码" : "显示密码");
      button.innerHTML = `<i data-lucide="${shouldShow ? "eye-off" : "eye"}"></i>`;
      initIcons(button);
    });
  });

  elements.loginForm.addEventListener("submit", submitLogin);
  elements.registerForm.addEventListener("submit", submitRegister);
  elements.logoutButton.addEventListener("click", () => {
    clearSession();
    closeAllModals();
    showAuth();
    showToast("你已安全退出登录", "info");
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.view));
  });

  document.querySelectorAll("[data-go-view], [data-view-link]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(button.dataset.goView || button.dataset.viewLink);
    });
  });

  elements.openSidebar.addEventListener("click", openSidebar);
  elements.closeSidebar.addEventListener("click", closeSidebar);
  elements.sidebarBackdrop.addEventListener("click", closeSidebar);

  document.querySelectorAll("[data-add-article], #quickAddArticle").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.activeView !== "articles") navigate("articles");
      if (!state.categories.length) {
        showToast("请先创建文章分类", "info");
        navigate("categories");
        return;
      }
      openArticleModal();
    });
  });

  document.querySelectorAll("[data-add-category]").forEach((button) => {
    button.addEventListener("click", () => openCategoryModal());
  });

  elements.articleTableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-article]");
    const deleteButton = event.target.closest("[data-delete-article]");
    if (editButton) handleArticleEdit(editButton.dataset.editArticle);
    if (deleteButton) deleteArticle(deleteButton.dataset.deleteArticle);
  });

  elements.categoryGrid.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-category]");
    if (!editButton) return;
    const category = state.categories.find(
      (item) => Number(item.id) === Number(editButton.dataset.editCategory),
    );
    if (category) openCategoryModal(category);
  });

  elements.articleForm.addEventListener("submit", submitArticle);
  elements.categoryForm.addEventListener("submit", submitCategory);
  elements.profileForm.addEventListener("submit", submitProfile);
  elements.passwordForm.addEventListener("submit", submitPassword);
  elements.articleForm.elements.coverImg.addEventListener("input", updateCoverPreview);
  elements.avatarInput.addEventListener("change", (event) =>
    uploadAvatar(event.target.files?.[0]),
  );

  elements.articleSearch.addEventListener("input", applyArticleFilters);
  elements.articleCategoryFilter.addEventListener("change", applyArticleFilters);
  elements.articleStateFilter.addEventListener("change", applyArticleFilters);
  elements.resetFilters.addEventListener("click", resetFilters);

  elements.prevPage.addEventListener("click", () => {
    if (state.pageNum <= 1) return;
    state.pageNum -= 1;
    loadArticles().catch((error) => showToast(error.message, "error"));
  });

  elements.nextPage.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.pageNum >= totalPages) return;
    state.pageNum += 1;
    loadArticles().catch((error) => showToast(error.message, "error"));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal")));
  });

  elements.confirmAction.addEventListener("click", async () => {
    const action = state.pendingDelete;
    state.pendingDelete = null;
    if (typeof action === "function") await action();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openModalElement = document.querySelector(".modal:not([hidden])");
      if (openModalElement) closeModal(openModalElement);
      closeSidebar();
    }
  });
}

function init() {
  initIcons();
  bindEvents();
  elements.todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  if (state.token) {
    enterApp().catch(() => {
      clearSession();
      showAuth();
    });
  } else {
    showAuth();
  }
}

init();
