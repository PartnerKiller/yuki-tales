# 🌸 Yuki Tales (Web Novel & Comic Platform)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java Version](https://img.shields.io/badge/Java-21-blue.svg)](https://openjdk.org/projects/jdk/21/)
[![Database](https://img.shields.io/badge/Database-H2-orange.svg)](https://www.h2database.com/)

Yuki Tales is a premium, high-performance web platform designed for hosting, reading, and managing web novels and vertical comics. Built with an optimized Spring Boot backend and a sleek, responsive Thymeleaf & Bootstrap frontend, it delivers an immersive reading experience with customizable layouts, real-time interactions, dynamic themes, secure premium content unlocking, and dedicated analytics.

---

## 🚀 Core Features

### 📖 Immersive Reading Layout
* **Fluid Viewports:** Fully responsive reader UI adapting flawlessly to mobile, tablet, and desktop screens.
* **Canvas Lock:** Zoom-locking controls to guarantee layout stability across touch devices.
* **Reader Settings:** Toggleable fonts, sizes, line heights, and custom reader themes (Light, Sepia, Dark/OLED).
* **Horizontal Carousels:** Smooth story sliders with touch support, auto-fading scroll controls, and layout margin offsets.

### 🎨 Customization & UI Themes
* **Dynamic Theme Engine:** System-wide palette selector allowing readers to switch between themes (**Default Violet**, **Ocean Blue**, **Forest Green**, and **Sakura Pink**).
* **Responsive Design:** Optimized layout with glassmorphism overlays and CSS micro-animations.

### 📊 Real-Time Analytics & Companion Portal
* **Dedicated Statistics Dashboard (`/stats/`)**: Dark-mode glassmorphism analytics web application featuring KPI cards, Chart.js trends, ranking tables, and CSV report export.
* **REST Analytics API (`/api/public/stats`)**: Endpoint exposing platform metrics:
  * **Revenue & Sales Volume**: Snow Flakes earnings, USD estimates, and daily transaction timelines.
  * **Content Publishing**: Distribution by format (Light Novels vs Vertical Comics), status, and chapter release activity.
  * **Audience Metrics**: Live active connections, registered user growth, and reader/author breakdown.
* **Live Auto-Polling & Subdomain Routing**: Dynamic 5-second polling with HTTP cache-busting, 1-second live clock ticker, and host header routing (`stats.nazuna.dpdns.org`).

### 🛡️ Enterprise-Grade Security Hardening
* **Secure Authentication:** Implemented Spring Security filter chains with session-fixation protection.
* **BCrypt Migration:** Automatic, silent user password upgrade from legacy AES encryption to modern `BCryptPasswordEncoder` on login.
* **XSS Mitigation:** Integrated `jsoup` HTML sanitization on all chapter publication paths to strip malicious scripts and event handlers.
* **Malicious File Protection:** Strict magic-bytes file signature checking for PNG, JPEG, GIF, and WEBP image uploads to block disguised web shells.

### 💬 Real-Time Comments & Soft-Deletion
* **Threaded Comment Feed:** Real-time commenting and nested replies powered by Server-Sent Events (SSE).
* **Smart Soft-Deletion:**
  * Deleted comments display a placeholder (`This comment has been deleted.`) to preserve reply trees for standard users.
  * Parent comments with no active replies are completely filtered out.
  * Administrators can view soft-deleted comments clearly highlighted with `[Deleted]` prefixes and original text.
  * **Permanent Deletion:** Administrators can click delete on a soft-deleted comment to remove it permanently from the database.

### 💳 Monetization & Alerts
* **Digital Snow Flakes:** Internal token economy for purchasing and unlocking premium chapters.
* **Payment Gateways:** Standardized integrations for **Razorpay**, with a local **Mock Checkout** option restricted to admin accounts.
* **Coupon System:** System-wide discount coupons with support for percentage-off rates and strict restrictions by user email/username.
* **Sign-up Alerts:** Configurable system alerts to notify admins via email upon new user registrations (configurable in credentials settings).

---

## ⚡ Performance Optimizations

* **Tomcat Thread Tuning:** Configured Tomcat connector pool with `max-threads=200`, `max-connections=2000`, and `accept-count=500` to handle high concurrent requests.
* **HikariCP Tuning:** Configured connection leak-detection thresholds (`2000ms`) and idle timeouts (`10000ms`) to recycle database resources.
* **Payload Compression:** GZIP compression enabled on JSON and HTML payloads to minimize network transit time.
* **Aggressive Caching:** Long-term HTTP caching headers configured for static assets and user uploads (`/uploads/**` cached for 1 year; `/css/**`, `/js/**`, and `/scripts/**` cached for 24 hours).

---

## 🛠️ Tech Stack

* **Backend Framework:** Spring Boot 3.4.5, Spring Security, Spring Data JPA
* **Database Engine:** H2 Database (File-based storage locally under `./data/bookstore`)
* **Templates & View Layer:** Thymeleaf HTML5 templates, Bootstrap 5, FontAwesome Icons
* **Client Logic & Visualizations:** Vanilla Javascript, jQuery, Server-Sent Events (SSE), Chart.js
* **Build Automation:** Maven 3.9.x (wrapped)

---

## 📋 Getting Started

### Prerequisites
* **Java SDK:** OpenJDK 21 or newer installed.
* **Build System:** Maven wrapper (`mvnw`) included in the project root.

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PartnerKiller/yuki-tales.git
   cd yuki-tales
   ```

2. **Configure environment properties (Optional):**
   Create or edit the environment variable parameters or override `src/main/resources/application.properties`.

3. **Build the application:**
   ```bash
   # On Linux/macOS
   ./mvnw clean compile
   
   # On Windows (PowerShell)
   .\mvnw.cmd clean compile
   ```

4. **Run the Spring Boot application:**
   ```bash
   # On Linux/macOS
   ./mvnw spring-boot:run
   
   # On Windows (PowerShell)
   .\mvnw.cmd spring-boot:run
   ```

5. **Access the application:**
   - Main Platform: [http://localhost:8080](http://localhost:8080)
   - Statistics Dashboard: [http://localhost:8080/stats/](http://localhost:8080/stats/)

---

## 🔒 Copyright & Ownership

Copyright © 2026 Yuki Tales. All Rights Reserved.

This software and its associated documentation are proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
