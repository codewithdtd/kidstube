// State management
let currentTab = 'videos';
let categories = [];
let allVideos = [];
let selectedCategoryId = null;
let searchQuery = '';
let statusFilter = 'ALL'; // 'ALL', 'ACTIVE', 'INACTIVE'
let pendingDeleteVideoId = null;

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadCategories();
  loadVideos();
  loadAppStatus();
  loadSettings();
  loadHistoryData();
  setInterval(loadAppStatus, 30000);
});

function switchTab(tab) {
  currentTab = tab;
  ['videos', 'settings', 'history'].forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tab) {
      section.classList.remove('hidden');
      btn.className = 'whitespace-nowrap shrink-0 border-b-2 border-sky-600 text-sky-600 py-2.5 sm:py-3.5 px-2.5 sm:px-1 text-xs sm:text-sm font-bold sm:font-semibold flex items-center space-x-1.5 sm:space-x-2 transition';
    } else {
      section.classList.add('hidden');
      btn.className = 'whitespace-nowrap shrink-0 border-b-2 border-transparent text-slate-500 hover:text-slate-700 py-2.5 sm:py-3.5 px-2.5 sm:px-1 text-xs sm:text-sm font-bold sm:font-semibold flex items-center space-x-1.5 sm:space-x-2 transition';
    }
  });
  lucide.createIcons();
  if (tab === 'history') {
    loadHistoryData();
    loadAppStatus();
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold transition-all transform duration-300 ease-out translate-y-4 opacity-0 max-w-full ${
    type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-white border-rose-200 text-rose-800'
  }`;
  const icon = type === 'success' ? 'check-circle-2' : 'alert-circle';
  const color = type === 'success' ? 'text-emerald-500' : 'text-rose-500';
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0 ${color}"></i><span class="truncate">${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  requestAnimationFrame(() => toast.classList.remove('translate-y-4', 'opacity-0'));
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

async function loadCategories() {
  try {
    const res = await fetch('/api/v1/categories');
    if (!res.ok) throw new Error('Không thể tải danh mục');
    categories = await res.json();

    // Populate Category Carousel Filter Bar
    const filterBar = document.getElementById('category-filter-bar');
    if (filterBar) {
      filterBar.innerHTML = `
        <button onclick="filterVideosByCategory(null)" class="category-pill active-pill whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white transition active:scale-95" data-id="all">Tất cả</button>
        ${categories.map(c => `
          <button onclick="filterVideosByCategory(${c.id})" class="category-pill whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-sky-300 text-slate-700 transition active:scale-95" data-id="${c.id}">${escapeHtml(c.name)}</button>
        `).join('')}
      `;
    }

    // Populate Import Category Select Dropdown
    const categorySelect = document.getElementById('import-category-select');
    if (categorySelect) {
      categorySelect.innerHTML = `
        <option value="auto">🎲 Tự động</option>
        ${categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
      `;
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadVideos() {
  try {
    const url = selectedCategoryId ? `/api/v1/parent/videos?categoryId=${selectedCategoryId}` : '/api/v1/parent/videos';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải video');
    allVideos = await res.json();
    renderVideos();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function filterVideosByCategory(categoryId) {
  selectedCategoryId = categoryId;
  document.querySelectorAll('.category-pill').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if ((categoryId === null && id === 'all') || (categoryId !== null && id == categoryId)) {
      btn.className = 'category-pill active-pill whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white transition active:scale-95';
    } else {
      btn.className = 'category-pill whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-sky-300 text-slate-700 transition active:scale-95';
    }
  });
  loadVideos();
}
function handleSearchVideos(val) {
  searchQuery = (val || '').trim();
  const clearBtn = document.getElementById('btn-clear-search');
  if (clearBtn) {
    if (searchQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderVideos();
}

function clearVideoSearch() {
  const input = document.getElementById('video-search-input');
  if (input) input.value = '';
  searchQuery = '';
  const clearBtn = document.getElementById('btn-clear-search');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderVideos();
}

function filterByStatus(status) {
  statusFilter = status;
  ['ALL', 'SHORTS', 'ACTIVE', 'INACTIVE'].forEach(s => {
    const btn = document.getElementById(`filter-status-${s.toLowerCase()}`);
    if (btn) {
      if (s === status) {
        btn.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-900 font-bold transition whitespace-nowrap';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition whitespace-nowrap';
      }
    }
  });
  renderVideos();
}

function resetAllFilters() {
  clearVideoSearch();
  filterByStatus('ALL');
  filterVideosByCategory(null);
}

function getFilteredVideos() {
  return allVideos.filter(video => {
    // 1. Status & Type filter
    if (statusFilter === 'SHORTS' && !video.isShort) return false;
    if (statusFilter === 'ACTIVE' && !video.isActive) return false;
    if (statusFilter === 'INACTIVE' && video.isActive) return false;

    // 2. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (video.title || '').toLowerCase().includes(q);
      const channelMatch = (video.channelTitle || '').toLowerCase().includes(q);
      if (!titleMatch && !channelMatch) return false;
    }

    return true;
  });
}

function openVideoPreview(youtubeVideoId, title) {
  const modal = document.getElementById('preview-modal');
  const iframe = document.getElementById('preview-iframe');
  const titleEl = document.getElementById('preview-title');
  if (titleEl) titleEl.textContent = title || 'Xem trước video';
  if (iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0`;
  }
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeVideoPreview() {
  const modal = document.getElementById('preview-modal');
  const iframe = document.getElementById('preview-iframe');
  if (iframe) iframe.src = '';
  if (modal) modal.classList.add('hidden');
}




function renderVideos() {
  const grid = document.getElementById('video-grid');
  const empty = document.getElementById('video-empty-state');
  const badge = document.getElementById('video-count-badge');
  const emptyTitle = document.getElementById('video-empty-title');
  const emptyDesc = document.getElementById('video-empty-desc');
  const resetBtn = document.getElementById('btn-reset-filters');

  const filtered = getFilteredVideos();
  const totalActive = allVideos.filter(v => v.isActive).length;

  if (searchQuery || statusFilter !== 'ALL' || selectedCategoryId !== null) {
    badge.textContent = `Hiển thị ${filtered.length} / ${allVideos.length} video (${totalActive} đang mở cho bé)`;
  } else {
    badge.textContent = `Tổng cộng: ${allVideos.length} video (${totalActive} đang mở cho bé)`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    if (allVideos.length === 0) {
      if (emptyTitle) emptyTitle.textContent = 'Chưa có video nào';
      if (emptyDesc) emptyDesc.textContent = 'Hãy dán link video hoặc kênh YouTube ở khung trên để nạp thêm video cho bé.';
      if (resetBtn) resetBtn.classList.add('hidden');
    } else {
      if (emptyTitle) emptyTitle.textContent = 'Không tìm thấy video phù hợp';
      if (emptyDesc) emptyDesc.textContent = 'Thử tìm từ khóa khác hoặc thiết lập lại bộ lọc.';
      if (resetBtn) resetBtn.classList.remove('hidden');
    }
    lucide.createIcons();
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filtered.map(video => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition group">
      <div>
        <div class="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onclick="openVideoPreview('${video.youtubeVideoId}', '${escapeHtml(video.title)}')">
          <img src="${video.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop'}"
               alt="${escapeHtml(video.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">

          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div class="p-3 rounded-full bg-white/90 text-sky-600 shadow-lg transform group-hover:scale-110 transition">
              <i data-lucide="play" class="w-5 h-5 fill-current"></i>
            </div>
          </div>

          <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-medium pointer-events-none">
            ${formatSeconds(video.durationSeconds)}
          </span>
          <div class="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${video.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'}">
              ${video.isActive ? '🟢 Đang mở' : '⚪ Đang ẩn'}
            </span>
            ${video.isShort ? '<span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-600 text-white shadow-sm flex items-center gap-0.5"><i data-lucide="zap" class="w-2.5 h-2.5"></i>Shorts</span>' : ''}
          </div>
        </div>
        <div class="p-3.5 sm:p-4 space-y-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold truncate max-w-[130px]">
              ${escapeHtml(video.categoryName || 'Chung')}
            </span>
            ${video.channelTitle ? `
              <span class="text-slate-500 font-medium truncate max-w-[140px] flex items-center space-x-1" title="${escapeHtml(video.channelTitle)}">
                <i data-lucide="tv" class="w-3 h-3 text-slate-400 shrink-0"></i>
                <span class="truncate">${escapeHtml(video.channelTitle)}</span>
              </span>` : ''}
          </div>
          <h4 class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-sky-600 transition"
              onclick="openVideoPreview('${video.youtubeVideoId}', '${escapeHtml(video.title)}')"
              title="${escapeHtml(video.title)}">
            ${escapeHtml(video.title)}
          </h4>
        </div>
      </div>
      <div class="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <label class="flex items-center space-x-2 cursor-pointer select-none py-1">
          <input type="checkbox" ${video.isActive ? 'checked' : ''} onchange="toggleVideoStatus(${video.id}, this.checked)" class="w-5 h-5 rounded text-sky-600 accent-sky-600 cursor-pointer">
          <span class="text-xs font-bold ${video.isActive ? 'text-emerald-700' : 'text-slate-500'}">${video.isActive ? 'Mở cho bé' : 'Đang ẩn'}</span>
        </label>
        <div class="flex items-center space-x-1 sm:space-x-1.5">
          <button onclick="openVideoPreview('${video.youtubeVideoId}', '${escapeHtml(video.title)}')"
                  class="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition flex items-center gap-1 text-xs font-semibold active:scale-95" title="Xem trước video">
            <i data-lucide="play" class="w-4 h-4 text-sky-600"></i>
            <span class="hidden sm:inline">Xem</span>
          </button>
          <a href="https://www.youtube.com/watch?v=${video.youtubeVideoId}" target="_blank" rel="noopener noreferrer"
             class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition active:scale-95" title="Mở trên YouTube">
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>
          <button onclick="promptDeleteVideo(${video.id})" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-95" title="Xóa video khỏi app bé">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

async function toggleVideoStatus(videoId, isActive) {
  try {
    const res = await fetch(`/api/v1/parent/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái');
    showToast(isActive ? 'Đã bật hiển thị video' : 'Đã ẩn video');
    loadVideos();
  } catch (err) {
    showToast(err.message, 'error');
    loadVideos();
  }
}

function promptDeleteVideo(id) {
  pendingDeleteVideoId = id;
  document.getElementById('delete-modal').classList.remove('hidden');
  document.getElementById('btn-confirm-delete').onclick = confirmDeleteVideo;
}

function closeDeleteModal() {
  pendingDeleteVideoId = null;
  document.getElementById('delete-modal').classList.add('hidden');
}

async function confirmDeleteVideo() {
  if (!pendingDeleteVideoId) return;
  try {
    const res = await fetch(`/api/v1/parent/videos/${pendingDeleteVideoId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa video');
    showToast('Đã xóa video thành công');
    closeDeleteModal();
    loadVideos();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleImportVideo(e) {
  e.preventDefault();
  const urlInput = document.getElementById('import-url');
  const shortsOnlyInput = document.getElementById('import-shorts-only');
  const categorySelect = document.getElementById('import-category-select');
  const btn = document.getElementById('btn-import-submit');
  const url = urlInput.value.trim();
  const shortsOnly = shortsOnlyInput ? shortsOnlyInput.checked : false;

  // Lấy danh mục được chọn hoặc tự động chọn ngẫu nhiên
  let targetCategoryId = null;
  if (categorySelect && categorySelect.value !== 'auto') {
    targetCategoryId = parseInt(categorySelect.value, 10);
  } else {
    targetCategoryId = (categories && categories.length > 0)
      ? categories[Math.floor(Math.random() * categories.length)].id
      : null;
  }

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Đang quét & nạp...</span>`;
  lucide.createIcons();

  try {
    const res = await fetch('/api/v1/parent/videos/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, categoryId: targetCategoryId, shortsOnly })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Không thể nạp video');
    showToast(data.message || `Đã nạp thành công ${data.importedCount} video!`);
    urlInput.value = '';
    handleImportUrlChange('');
    if (shortsOnlyInput) shortsOnlyInput.checked = false;
    loadVideos();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="download-cloud" class="w-4 h-4"></i><span>Nạp Video Ngay</span>`;
    lucide.createIcons();
  }
}

async function handlePasteFromClipboard() {
  const urlInput = document.getElementById('import-url');
  if (!urlInput) return;
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      urlInput.focus();
      showToast('Vui lòng chạm giữ ô nhập để dán link', 'error');
      return;
    }
    const text = await navigator.clipboard.readText();
    if (!text || !text.trim()) {
      showToast('Bộ nhớ tạm đang trống', 'error');
      return;
    }
    urlInput.value = text.trim();
    handleImportUrlChange(urlInput.value);
    urlInput.focus();
    showToast('Đã dán link từ bộ nhớ tạm! 🎉');
  } catch (err) {
    urlInput.focus();
    showToast('Vui lòng chạm giữ ô nhập để dán link', 'error');
  }
}

function handleImportUrlChange(val) {
  const clearBtn = document.getElementById('btn-clear-url');
  if (clearBtn) {
    if (val && val.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
}

function handleClearImportUrl() {
  const urlInput = document.getElementById('import-url');
  if (urlInput) {
    urlInput.value = '';
    urlInput.focus();
  }
  const clearBtn = document.getElementById('btn-clear-url');
  if (clearBtn) clearBtn.classList.add('hidden');
}

function fillSampleChannel(channelHandle, isShorts) {
  const urlInput = document.getElementById('import-url');
  const shortsOnlyInput = document.getElementById('import-shorts-only');
  if (urlInput) {
    urlInput.value = channelHandle;
    handleImportUrlChange(channelHandle);
    urlInput.focus();
  }
  if (shortsOnlyInput && typeof isShorts === 'boolean') {
    shortsOnlyInput.checked = isShorts;
  }
  showToast(`Đã điền kênh mẫu ${channelHandle}. Nhấn "Nạp Video Ngay" để quét!`);
}

async function loadSettings() {
  try {
    const res = await fetch('/api/v1/parent/settings');
    if (!res.ok) return;
    const s = await res.json();
    const limit = s.dailyLimitMinutes ?? s.dailyTimeLimitMinutes ?? 45;
    document.getElementById('input-daily-limit').value = limit;
    updateLimitDisplay(limit);
    document.getElementById('input-bedtime-start').value = s.bedtimeStart;
    document.getElementById('input-bedtime-end').value = s.bedtimeEnd;
    document.getElementById('input-is-locked').checked = Boolean(s.isLocked);
    renderUiModeState(s.uiMode || 'KIDS_WORLD');
  } catch (err) {
    console.error(err);
  }
}

let currentUiMode = 'KIDS_WORLD';

function renderUiModeState(mode) {
  currentUiMode = (mode === 'YOUTUBE') ? 'YOUTUBE' : 'KIDS_WORLD';
  const isKidsWorld = currentUiMode === 'KIDS_WORLD';

  const badge = document.getElementById('badge-current-ui-mode');
  if (badge) {
    badge.textContent = isKidsWorld ? '🚀 KidsZone (6-7 tuổi)' : '📺 YouTube Kids';
    badge.className = isKidsWorld
      ? 'text-[11px] text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold'
      : 'text-[11px] text-sky-700 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold';
  }

  const headerIcon = document.getElementById('header-uimode-icon');
  const headerText = document.getElementById('header-uimode-text');
  if (headerIcon && headerText) {
    headerIcon.textContent = isKidsWorld ? '🚀' : '📺';
    headerText.textContent = isKidsWorld ? 'KidsZone' : 'YouTube Kids';
  }

  const btnKw = document.getElementById('btn-mode-kidsworld');
  const btnYt = document.getElementById('btn-mode-youtube');
  const checkKw = document.getElementById('check-kidsworld');
  const checkYt = document.getElementById('check-youtube');

  if (btnKw && btnYt) {
    if (isKidsWorld) {
      btnKw.className = 'p-3.5 rounded-xl border-2 transition text-left relative flex flex-col justify-between bg-white border-indigo-500 shadow-sm cursor-pointer';
      btnYt.className = 'p-3.5 rounded-xl border-2 transition text-left relative flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 cursor-pointer';
      if (checkKw) checkKw.classList.remove('hidden');
      if (checkYt) checkYt.classList.add('hidden');
    } else {
      btnYt.className = 'p-3.5 rounded-xl border-2 transition text-left relative flex flex-col justify-between bg-white border-sky-500 shadow-sm cursor-pointer';
      btnKw.className = 'p-3.5 rounded-xl border-2 transition text-left relative flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 cursor-pointer';
      if (checkYt) checkYt.classList.remove('hidden');
      if (checkKw) checkKw.classList.add('hidden');
    }
  }
}

async function handleSelectUiMode(mode) {
  try {
    const res = await fetch(`/api/v1/parent/settings/ui-mode?uiMode=${mode}`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Không thể cập nhật giao diện ứng dụng');
    const s = await res.json();
    renderUiModeState(s.uiMode || mode);
    showToast(mode === 'KIDS_WORLD' ? 'Đã đổi sang giao diện 🌈 Thế Giới Kỳ Diệu cho bé!' : 'Đã đổi sang giao diện 📺 YouTube Kids cho bé!');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleQuickUiMode() {
  const nextMode = currentUiMode === 'KIDS_WORLD' ? 'YOUTUBE' : 'KIDS_WORLD';
  await handleSelectUiMode(nextMode);
}

function updateLimitDisplay(val) {
  document.getElementById('slider-limit-display').textContent = `${val} phút`;
}

function setLimitPreset(val) {
  const slider = document.getElementById('input-daily-limit');
  if (slider) {
    slider.value = val;
    updateLimitDisplay(val);
  }
}

function setBedtimePreset(start, end) {
  const startEl = document.getElementById('input-bedtime-start');
  const endEl = document.getElementById('input-bedtime-end');
  if (startEl) startEl.value = start;
  if (endEl) endEl.value = end;
}

async function handleInstantLockToggle(checked) {
  await toggleLockApi(checked);
}

async function toggleQuickLock() {
  const lockInput = document.getElementById('input-is-locked');
  const nextState = lockInput ? !lockInput.checked : true;
  await toggleLockApi(nextState);
}

async function toggleLockApi(isLocked) {
  try {
    const res = await fetch(`/api/v1/parent/settings/lock?isLocked=${isLocked}`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái khóa');
    showToast(isLocked ? 'Đã khóa ứng dụng của bé ngay lập tức' : 'Đã mở khóa ứng dụng của bé');
    await loadSettings();
    await loadAppStatus();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const dailyTimeLimitMinutes = parseInt(document.getElementById('input-daily-limit').value, 10);
  const bedtimeStart = document.getElementById('input-bedtime-start').value;
  const bedtimeEnd = document.getElementById('input-bedtime-end').value;
  const isLocked = document.getElementById('input-is-locked').checked;
  const btn = document.getElementById('btn-save-settings');
  btn.disabled = true;

  try {
    const payload = {
      dailyTimeLimitMinutes: isNaN(dailyTimeLimitMinutes) ? 45 : dailyTimeLimitMinutes,
      dailyLimitMinutes: isNaN(dailyTimeLimitMinutes) ? 45 : dailyTimeLimitMinutes,
      bedtimeStart,
      bedtimeEnd,
      isLocked,
      uiMode: currentUiMode
    };
    const res = await fetch('/api/v1/parent/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.detail || (data.validationErrors ? Object.values(data.validationErrors).join(', ') : 'Không thể lưu cấu hình');
      throw new Error(errorMsg);
    }
    showToast('Đã lưu cấu hình cài đặt thành công!');
    await loadSettings();
    await loadAppStatus();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function loadAppStatus() {
  try {
    const res = await fetch('/api/v1/status');
    if (!res.ok) return;
    const s = await res.json();

    const pill = document.getElementById('header-status-pill');
    const dot = document.getElementById('header-status-dot');
    const text = document.getElementById('header-status-text');

    const usedSeconds = s.todayUsedSeconds ?? s.usedSecondsToday ?? 0;
    const dailyLimitMinutes = s.dailyLimitMinutes ?? Math.round((s.dailyLimitSeconds || 0) / 60) ?? 45;
    const dailyLimitSeconds = dailyLimitMinutes * 60;
    const remainingSeconds = s.remainingSeconds ?? Math.max(0, dailyLimitSeconds - usedSeconds);

    const usedMin = Math.round(usedSeconds / 60);
    const limitMin = dailyLimitMinutes;
    const remainMin = Math.max(0, Math.round(remainingSeconds / 60));
    const percent = Math.min(100, Math.round((usedSeconds / Math.max(1, dailyLimitSeconds)) * 100));

    document.getElementById('metric-used-time').textContent = usedMin;
    document.getElementById('metric-limit-time').textContent = limitMin;
    document.getElementById('metric-remaining-time').textContent = remainMin;

    const bar = document.getElementById('metric-progress-bar');
    bar.style.width = `${percent}%`;
    bar.className = percent >= 100 ? 'bg-rose-500 h-2 rounded-full' : (percent >= 80 ? 'bg-amber-500 h-2 rounded-full' : 'bg-sky-500 h-2 rounded-full');

    const mTitle = document.getElementById('metric-status-title');
    const mDesc = document.getElementById('metric-status-desc');

    const isAllowed = (s.isAllowed !== undefined) ? s.isAllowed : (s.canWatch !== undefined ? s.canWatch : true);

    if (isAllowed) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      text.textContent = 'Được xem';
      pill.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200';
      mTitle.textContent = 'Được phép xem';
      mDesc.textContent = `Bé còn ${remainMin} phút xem hôm nay`;
    } else {
      let rText = 'Đã khóa';
      let rDesc = 'Ứng dụng đang bị khóa';
      if (s.lockReason === 'BEDTIME' || s.isBedtime) {
        rText = 'Giờ ngủ 🌙'; rDesc = 'Đang trong giờ đi ngủ của bé';
        dot.className = 'w-2 h-2 rounded-full bg-indigo-500';
      } else if (s.lockReason === 'TIME_LIMIT_EXCEEDED') {
        rText = 'Hết giờ ⏳'; rDesc = 'Bé đã xem hết thời gian hôm nay';
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
      } else {
        rText = 'Khóa thủ công 🔒'; rDesc = 'Ba mẹ đã bật khóa khẩn cấp';
        dot.className = 'w-2 h-2 rounded-full bg-rose-500';
      }
      text.textContent = rText;
      mTitle.textContent = rText;
      mDesc.textContent = rDesc;
    }

    // Cập nhật trạng thái nút Khóa Nhanh ở Header và Thẻ Khóa ở Tab Cài đặt
    const quickLockBtn = document.getElementById('btn-quick-toggle-lock');
    const quickLockText = document.getElementById('header-quick-lock-text');
    const lockCard = document.getElementById('instant-lock-card');
    const lockInput = document.getElementById('input-is-locked');

    const isLockedNow = Boolean(s.isLocked) || (s.lockReason === 'MANUAL_LOCK') || (lockInput && lockInput.checked);

    if (isLockedNow) {
      if (quickLockBtn) {
        quickLockBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 bg-rose-600 border-rose-700 text-white shadow-sm hover:bg-rose-700';
      }
      if (quickLockText) quickLockText.textContent = 'Mở Khóa';
      if (lockCard) lockCard.className = 'bg-rose-100 rounded-xl p-5 border-2 border-rose-400 flex items-center justify-between transition shadow-sm';
      if (lockInput) lockInput.checked = true;
    } else {
      if (quickLockBtn) {
        quickLockBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200';
      }
      if (quickLockText) quickLockText.textContent = 'Khóa Ngay';
      if (lockCard) lockCard.className = 'bg-rose-50 rounded-xl p-5 border border-rose-200 flex items-center justify-between transition';
      if (lockInput) lockInput.checked = false;
    }

    lucide.createIcons();
  } catch (err) {
    console.error(err);
  }
}

async function loadHistoryData() {
  const refreshIcon = document.getElementById('history-refresh-icon');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');

  try {
    const res = await fetch('/api/v1/parent/history?limit=20');
    if (!res.ok) return;
    const summary = await res.json();
    const tbody = document.getElementById('history-table-body');
    const empty = document.getElementById('history-empty-state');
    const countBadge = document.getElementById('history-count-badge');

    if (!summary.recentLogs || summary.recentLogs.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      if (countBadge) countBadge.textContent = '(0)';
      return;
    }
    empty.classList.add('hidden');
    if (countBadge) countBadge.textContent = `(${summary.recentLogs.length} phiên gần nhất)`;

    tbody.innerHTML = summary.recentLogs.map(item => {
      const d = new Date(item.watchedAt);
      const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const min = Math.floor(item.watchedSeconds / 60);
      const sec = item.watchedSeconds % 60;
      const durationFormatted = min > 0 ? `${min} phút ${sec > 0 ? `${sec}s` : ''}` : `${sec} giây`;

      return `
        <tr class="hover:bg-slate-50 transition group">
          <td class="py-3.5 px-6 flex items-center space-x-3.5">
            <div class="relative w-14 h-9 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer shadow-sm group-hover:shadow group-hover:scale-105 transition duration-200"
                 onclick="openVideoPreview('${item.youtubeVideoId}', '${escapeHtml(item.title)}')"
                 title="Bấm để xem lại video">
              <img src="${item.thumbnailUrl || ''}" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <i data-lucide="play" class="w-4 h-4 text-white fill-white"></i>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <span class="font-bold text-slate-800 text-xs line-clamp-1 cursor-pointer hover:text-sky-600 transition"
                    onclick="openVideoPreview('${item.youtubeVideoId}', '${escapeHtml(item.title)}')"
                    title="${escapeHtml(item.title)}">
                ${escapeHtml(item.title)}
              </span>
            </div>
          </td>
          <td class="py-3.5 px-6 text-xs whitespace-nowrap">
            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200">
              ${durationFormatted}
            </span>
          </td>
          <td class="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
            <span class="font-semibold text-slate-700">${timeStr}</span> <span class="text-slate-400">· ${dateStr}</span>
          </td>
        </tr>
      `;
    }).join('');
    lucide.createIcons();
  } catch (err) {
    console.error(err);
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }
}

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

