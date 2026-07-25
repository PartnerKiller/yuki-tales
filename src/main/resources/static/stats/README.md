# 📊 Yuki Stats Dashboard (stats.nazuna.dpdns.org)

Standalone statistics single-page web application (SPA) connected to the **Yuki Tales** Spring Boot platform.

## 🚀 Features
- **Real-Time KPIs**: Total Revenue (Snow Flakes & USD value), Sales Volume, Published Series, Published Chapters, Registered Readers, and Live Active Traffic.
- **Interactive Chart.js Visualizations**:
  - Revenue & Sales Velocity area trends.
  - Content format distribution (Light Novels vs Vertical Comics).
  - Reader registration growth rate.
- **Top Series Performance Ranking**: Detailed breakdown of chapter counts, status, and earnings per story.
- **CSV Data Exporter**: Download platform performance reports directly.
- **Live Sync**: Auto-polling live active traffic every 10 seconds.

## ⚙️ Deployment Setup for `stats.nazuna.dpdns.org`

### Option 1: Nginx Configuration

Create `/etc/nginx/sites-available/stats.nazuna.dpdns.org`:

```nginx
server {
    listen 80;
    server_name stats.nazuna.dpdns.org;

    root /home/sakura/test-cloudflare/yuki-tales/stats;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Option 2: Cloudflare Tunnel / Caddy / Static Host

Point host `stats.nazuna.dpdns.org` to serve the static root folder `./stats` or proxy static assets to port `8080` (Spring Boot static handlers).
