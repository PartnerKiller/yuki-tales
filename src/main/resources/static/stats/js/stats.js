const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : window.location.origin;

let revenueChartInstance = null;
let formatChartInstance = null;
let publishingChartInstance = null;
let rawStatsData = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardStats();

  document.getElementById('btn-refresh').addEventListener('click', () => {
    const icon = document.querySelector('#btn-refresh i');
    if (icon) icon.classList.add('fa-spin');
    fetchDashboardStats().finally(() => {
      if (icon) icon.classList.remove('fa-spin');
    });
  });

  document.getElementById('btn-export').addEventListener('click', exportStatsCSV);

  // Auto-poll live stats every 10 seconds
  setInterval(fetchDashboardStats, 10000);
});

async function fetchDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/stats`);
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

    document.getElementById('last-updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error('Error loading analytics:', error);
    document.getElementById('last-updated').textContent = 'Live Sync Failed (Retrying...)';
  }
}

function updateKPIs(kpis) {
  if (!kpis) return;
  
  animateCounter('kpi-revenue', kpis.totalRevenueFlakes || 0, ' ❄️');
  document.getElementById('kpi-usd-est').textContent = `$${kpis.estimatedUsdValue || '0.00'} USD Est.`;
  
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
  const duration = 1000;
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
  if (!ctx) return;

  const dates = Object.keys(dailyRevenue);
  const revenueValues = dates.map(d => dailyRevenue[d] || 0);
  const salesValues = dates.map(d => dailySales[d] || 0);

  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates.length ? dates : ['No Sales Yet'],
      datasets: [
        {
          label: 'Revenue (Snow Flakes)',
          data: revenueValues.length ? revenueValues : [0],
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
          data: salesValues.length ? salesValues : [0],
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
  if (!ctx) return;

  if (formatChartInstance) {
    formatChartInstance.destroy();
  }

  formatChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Light Novels', 'Vertical Comics'],
      datasets: [{
        data: [kpis.novelsCount || 0, kpis.comicsCount || 0],
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
  if (!ctx) return;

  const dates = Object.keys(dailyRegistrations);
  const regValues = dates.map(d => dailyRegistrations[d] || 0);

  if (publishingChartInstance) {
    publishingChartInstance.destroy();
  }

  publishingChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates.length ? dates : ['Today'],
      datasets: [{
        label: 'New Reader Signups',
        data: regValues.length ? regValues : [0],
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

  tbody.innerHTML = '';
  if (!stories.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">No story metrics available.</td></tr>`;
    return;
  }

  stories.forEach((story, idx) => {
    const isComic = 'COMIC'.equalsIgnoreCase(story.type);
    const typeBadge = `<span class="badge-tag ${isComic ? 'badge-comic' : 'badge-novel'}">${story.type || 'NOVEL'}</span>`;
    const isCompleted = 'COMPLETED'.equalsIgnoreCase(story.status);
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
  if (!rawStatsData) {
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

// Case insensitive helper
String.prototype.equalsIgnoreCase = function (other) {
  return typeof other === 'string' && this.toLowerCase() === other.toLowerCase();
};
