const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : window.location.origin;

let revenueChartInstance = null;
let formatChartInstance = null;
let publishingChartInstance = null;
let rawStatsData = null;
let isSyncing = false;

document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardStats();

  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const icon = refreshBtn.querySelector('i');
      if (icon) icon.classList.add('fa-spin');
      fetchDashboardStats().finally(() => {
        if (icon) icon.classList.remove('fa-spin');
      });
    });
  }

  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportStatsCSV);
  }

  // Live clock updating every 1 second (1000ms)
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // Auto-poll live stats data every 5 seconds (5000ms) with cache-busting
  setInterval(fetchDashboardStats, 5000);
});

function updateLiveClock() {
  const updatedElem = document.getElementById('last-updated');
  if (updatedElem && !isSyncing) {
    updatedElem.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  }
}

async function fetchDashboardStats() {
  isSyncing = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/stats?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`API response failed: ${response.status}`);
    }
    const data = await response.json();
    rawStatsData = data;

    updateKPIs(data.kpis);
    renderRevenueChart(data.dailyRevenue, data.dailySales);
    renderFormatChart(data.kpis);
    renderPublishingChart(data.dailyRegistrations);
    renderTopStories(data.stories);

    isSyncing = false;
    updateLiveClock();
  } catch (error) {
    isSyncing = false;
    console.error('Error loading analytics:', error);
    const updatedElem = document.getElementById('last-updated');
    if (updatedElem) {
      updatedElem.textContent = 'Live Sync Failed (Retrying...)';
    }
  }
}

function updateKPIs(kpis) {
  if (!kpis) return;
  
  animateCounter('kpi-revenue', kpis.totalRevenueFlakes || 0, ' ❄️');
  const usdElem = document.getElementById('kpi-usd-est');
  if (usdElem) {
    usdElem.textContent = `$${kpis.estimatedUsdValue || '0.00'} USD Est.`;
  }
  
  animateCounter('kpi-sales', kpis.totalSales || 0);
  animateCounter('kpi-stories', kpis.totalStories || 0);
  animateCounter('kpi-chapters', kpis.totalChapters || 0);
  animateCounter('kpi-users', kpis.totalUsers || 0);
  animateCounter('kpi-online', kpis.activeOnlineUsers || 1);
}

function animateCounter(elementId, targetValue, suffix = '') {
  const elem = document.getElementById(elementId);
  if (!elem) return;
  const startValue = parseInt(elem.getAttribute('data-value') || '0', 10);
  if (startValue === targetValue) {
    elem.textContent = targetValue.toLocaleString() + suffix;
    return;
  }

  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    elem.textContent = currentValue.toLocaleString() + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      elem.setAttribute('data-value', targetValue);
    }
  }
  requestAnimationFrame(update);
}

function renderRevenueChart(dailyRevenue = {}, dailySales = {}) {
  const ctx = document.getElementById('chart-revenue');
  if (!ctx || typeof Chart === 'undefined') return;

  const dates = Object.keys(dailyRevenue);
  const revenueValues = dates.map(d => dailyRevenue[d] || 0);
  const salesValues = dates.map(d => dailySales[d] || 0);

  const labels = dates.length ? dates : ['Today'];
  const revData = revenueValues.length ? revenueValues : [0];
  const salesData = salesValues.length ? salesValues : [0];

  if (revenueChartInstance) {
    revenueChartInstance.data.labels = labels;
    revenueChartInstance.data.datasets[0].data = revData;
    revenueChartInstance.data.datasets[1].data = salesData;
    revenueChartInstance.update();
    return;
  }

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue (Snow Flakes)',
          data: revData,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Sales (Unlocks)',
          data: salesData,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

function renderFormatChart(kpis = {}) {
  const ctx = document.getElementById('chart-format');
  if (!ctx || typeof Chart === 'undefined') return;

  const dataValues = [kpis.novelsCount || 0, kpis.comicsCount || 0];

  if (formatChartInstance) {
    formatChartInstance.data.datasets[0].data = dataValues;
    formatChartInstance.update();
    return;
  }

  formatChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Light Novels', 'Vertical Comics'],
      datasets: [{
        data: dataValues,
        backgroundColor: ['#06b6d4', '#a855f7'],
        borderColor: '#131027',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      cutout: '70%'
    }
  });
}

function renderPublishingChart(dailyRegistrations = {}) {
  const ctx = document.getElementById('chart-publishing');
  if (!ctx || typeof Chart === 'undefined') return;

  const dates = Object.keys(dailyRegistrations);
  const regValues = dates.map(d => dailyRegistrations[d] || 0);

  const labels = dates.length ? dates : ['Today'];
  const dataValues = regValues.length ? regValues : [0];

  if (publishingChartInstance) {
    publishingChartInstance.data.labels = labels;
    publishingChartInstance.data.datasets[0].data = dataValues;
    publishingChartInstance.update();
    return;
  }

  publishingChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'New Reader Signups',
        data: dataValues,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', precision: 0 } }
      }
    }
  });
}

function renderTopStories(stories = []) {
  const tbody = document.getElementById('top-stories-body');
  if (!tbody) return;

  if (!stories || !stories.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">No story metrics available.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  stories.forEach((story, idx) => {
    const isComic = isEqualsIgnoreCase('COMIC', story.type);
    const typeBadge = `<span class="badge-tag ${isComic ? 'badge-comic' : 'badge-novel'}">${story.type || 'NOVEL'}</span>`;
    const isCompleted = isEqualsIgnoreCase('COMPLETED', story.status);
    const statusBadge = `<span class="badge-tag ${isCompleted ? 'badge-completed' : 'badge-ongoing'}">${story.status || 'ONGOING'}</span>`;
    const coverUrl = story.coverUrl || 'https://via.placeholder.com/38x52';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: #94a3b8;">#${idx + 1}</td>
      <td>
        <div class="story-cell">
          <img src="${coverUrl}" class="story-thumb" alt="${escapeHtml(story.title)}" onerror="this.src='https://via.placeholder.com/38x52'">
          <div>
            <div class="story-name">${escapeHtml(story.title)}</div>
            <div style="font-size: 0.78rem; color: #64748b;">★ ${story.rating || '5.0'}</div>
          </div>
        </div>
      </td>
      <td>${typeBadge}</td>
      <td>${statusBadge}</td>
      <td style="font-weight: 600;">${(story.chaptersCount || 0).toLocaleString()}</td>
      <td style="font-weight: 700; color: #a855f7;">${(story.revenueFlakes || 0).toLocaleString()} ❄️</td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

function exportStatsCSV() {
  if (!rawStatsData || !rawStatsData.stories) {
    alert('Analytics data is still loading.');
    return;
  }
  let csvContent = 'data:text/csv;charset=utf-8,Rank,Title,Type,Status,Chapters,SalesUnlocks,RevenueFlakes\n';
  (rawStatsData.stories || []).forEach((s, i) => {
    const row = [
      i + 1,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      s.type || 'NOVEL',
      s.status || 'ONGOING',
      s.chaptersCount || 0,
      s.salesCount || 0,
      s.revenueFlakes || 0
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `YukiTales_Stats_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isEqualsIgnoreCase(str1, str2) {
  return typeof str1 === 'string' && typeof str2 === 'string' && str1.toLowerCase() === str2.toLowerCase();
}
