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
      btn.className = 'border-b-2 border-sky-600 text-sky-600 py-3.5 px-1 text-sm font-semibold flex items-center space-x-2 transition';
    } else {
      section.classList.add('hidden');
      btn.className = 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 py-3.5 px-1 text-sm font-semibold flex items-center space-x-2 transition';
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
  toast.className = `pointer-events-auto flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all transform duration-300 ease-out translate-y-4 opacity-0 ${
    type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-white border-rose-200 text-rose-800'
  }`;
  const icon = type === 'success' ? 'check-circle-2' : 'alert-circle';
  const color = type === 'success' ? 'text-emerald-500' : 'text-rose-500';
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 ${color}"></i><span>${message}</span>`;
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

    const filterBar = document.getElementById('category-filter-bar');
    filterBar.innerHTML = `
      <button onclick="filterVideosByCategory(null)" class="category-pill active-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white transition" data-id="all">Tất cả</button>
      ${categories.map(c => `
        <button onclick="filterVideosByCategory(${c.id})" class="category-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-sky-300 text-slate-700 transition" data-id="${c.id}">${escapeHtml(c.name)}</button>
      `).join('')}
    `;
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
      btn.className = 'category-pill active-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white transition';
    } else {
      btn.className = 'category-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-sky-300 text-slate-700 transition';
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
  ['ALL', 'ACTIVE', 'INACTIVE'].forEach(s => {
    const btn = document.getElementById(`filter-status-${s.toLowerCase()}`);
    if (btn) {
      if (s === status) {
        btn.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-900 font-bold transition';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition';
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
    // 1. Status filter
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
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${video.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'} pointer-events-none">
            ${video.isActive ? '🟢 Đang mở' : '⚪ Đang ẩn'}
          </span>
        </div>
        <div class="p-4 space-y-1.5">
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
      <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <label class="flex items-center space-x-2 cursor-pointer select-none">
          <input type="checkbox" ${video.isActive ? 'checked' : ''} onchange="toggleVideoStatus(${video.id}, this.checked)" class="w-4 h-4 rounded text-sky-600 accent-sky-600 cursor-pointer">
          <span class="text-xs font-semibold ${video.isActive ? 'text-emerald-700' : 'text-slate-500'}">${video.isActive ? 'Mở cho bé' : 'Đang ẩn'}</span>
        </label>
        <div class="flex items-center space-x-1">
          <a href="https://www.youtube.com/watch?v=${video.youtubeVideoId}" target="_blank" rel="noopener noreferrer"
             class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Mở trên YouTube">
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>
          <button onclick="promptDeleteVideo(${video.id})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Xóa video khỏi app bé">
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
  const btn = document.getElementById('btn-import-submit');
  const url = urlInput.value.trim();

  // Tự động chọn danh mục ngẫu nhiên để ba mẹ không cần thao tác phức tạp
  const randomCategory = (categories && categories.length > 0)
    ? categories[Math.floor(Math.random() * categories.length)].id
    : null;

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Đang nạp...</span>`;
  lucide.createIcons();

  try {
    const res = await fetch('/api/v1/parent/videos/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, categoryId: randomCategory })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Không thể nạp video');
    showToast(data.message || `Đã nạp thành công ${data.importedCount} video!`);
    urlInput.value = '';
    loadVideos();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="download-cloud" class="w-4 h-4"></i><span>Nạp Video Ngay</span>`;
    lucide.createIcons();
  }
}

async function loadSettings() {
  try {
    const res = await fetch('/api/v1/parent/settings');
    if (!res.ok) return;
    const s = await res.json();
    document.getElementById('input-daily-limit').value = s.dailyLimitMinutes;
    updateLimitDisplay(s.dailyLimitMinutes);
    document.getElementById('input-bedtime-start').value = s.bedtimeStart;
    document.getElementById('input-bedtime-end').value = s.bedtimeEnd;
    document.getElementById('input-is-locked').checked = s.isLocked;
  } catch (err) {
    console.error(err);
  }
}

function updateLimitDisplay(val) {
  document.getElementById('slider-limit-display').textContent = `${val} phút`;
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const dailyLimitMinutes = parseInt(document.getElementById('input-daily-limit').value, 10);
  const bedtimeStart = document.getElementById('input-bedtime-start').value;
  const bedtimeEnd = document.getElementById('input-bedtime-end').value;
  const isLocked = document.getElementById('input-is-locked').checked;
  const btn = document.getElementById('btn-save-settings');
  btn.disabled = true;

  try {
    const res = await fetch('/api/v1/parent/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyLimitMinutes, bedtimeStart, bedtimeEnd, isLocked })
    });
    if (!res.ok) throw new Error('Không thể lưu cấu hình');
    showToast('Đã lưu cấu hình cài đặt thành công!');
    loadAppStatus();
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

    const usedMin = Math.round(s.usedSecondsToday / 60);
    const limitMin = Math.round(s.dailyLimitSeconds / 60);
    const remainMin = Math.max(0, Math.round(s.remainingSeconds / 60));
    const percent = Math.min(100, Math.round((s.usedSecondsToday / Math.max(1, s.dailyLimitSeconds)) * 100));

    document.getElementById('metric-used-time').textContent = usedMin;
    document.getElementById('metric-limit-time').textContent = limitMin;
    document.getElementById('metric-remaining-time').textContent = remainMin;

    const bar = document.getElementById('metric-progress-bar');
    bar.style.width = `${percent}%`;
    bar.className = percent >= 100 ? 'bg-rose-500 h-2 rounded-full' : (percent >= 80 ? 'bg-amber-500 h-2 rounded-full' : 'bg-sky-500 h-2 rounded-full');

    const mTitle = document.getElementById('metric-status-title');
    const mDesc = document.getElementById('metric-status-desc');

    if (s.canWatch) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      text.textContent = 'Được xem';
      pill.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200';
      mTitle.textContent = 'Được phép xem';
      mDesc.textContent = `Bé còn ${remainMin} phút xem hôm nay`;
    } else {
      let rText = 'Đã khóa';
      let rDesc = 'Ứng dụng đang bị khóa';
      if (s.lockReason === 'BEDTIME') {
        rText = 'Giờ ngủ'; rDesc = 'Đang trong giờ đi ngủ của bé';
        dot.className = 'w-2 h-2 rounded-full bg-indigo-500';
      } else if (s.lockReason === 'TIME_LIMIT_EXCEEDED') {
        rText = 'Hết giờ'; rDesc = 'Bé đã xem hết thời gian hôm nay';
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
      } else {
        rText = 'Khóa thủ công'; rDesc = 'Ba mẹ đã bấm nút khóa từ xa';
        dot.className = 'w-2 h-2 rounded-full bg-rose-500';
      }
      text.textContent = rText;
      mTitle.textContent = rText;
      mDesc.textContent = rDesc;
    }
    lucide.createIcons();
  } catch (err) {
    console.error(err);
  }
}

async function loadHistoryData() {
  try {
    const res = await fetch('/api/v1/parent/history?limit=20');
    if (!res.ok) return;
    const summary = await res.json();
    const tbody = document.getElementById('history-table-body');
    const empty = document.getElementById('history-empty-state');

    if (!summary.recentLogs || summary.recentLogs.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    tbody.innerHTML = summary.recentLogs.map(item => {
      const d = new Date(item.watchedAt);
      const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const min = Math.round(item.watchedSeconds / 60);

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-6 flex items-center space-x-3">
            <img src="${item.thumbnailUrl || ''}" class="w-12 h-8 object-cover rounded bg-slate-100 flex-shrink-0">
            <span class="font-bold text-slate-800 truncate text-xs" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
          </td>
          <td class="py-3 px-6 text-xs font-semibold text-slate-700">${min > 0 ? `${min}p ` : ''}${item.watchedSeconds % 60}s</td>
          <td class="py-3 px-6 text-xs text-slate-500">${timeStr} (${dateStr})</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
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

