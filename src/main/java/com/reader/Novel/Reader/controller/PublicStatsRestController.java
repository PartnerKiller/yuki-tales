package com.reader.Novel.Reader.controller;

import com.reader.Novel.Reader.model.Chapter;
import com.reader.Novel.Reader.model.Novel;
import com.reader.Novel.Reader.model.Purchase;
import com.reader.Novel.Reader.model.User;
import com.reader.Novel.Reader.service.NovelService;
import com.reader.Novel.Reader.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {
    "https://stats.nazuna.dpdns.org",
    "http://stats.nazuna.dpdns.org",
    "https://nazuna.dpdns.org",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
})
public class PublicStatsRestController {

    @Autowired
    private NovelService novelService;

    @Autowired
    private UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<?> getPublicStats(jakarta.servlet.http.HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || (!"ADMIN".equals(loggedInUser.getUser_type()) && !"OWNER".equals(loggedInUser.getUser_type()))) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized access. Please log in as an administrator or owner."));
        }
        List<Novel> allNovels = novelService.getAllNovels();
        List<Chapter> allChapters = novelService.getAllChapters();
        List<Purchase> allPurchases = novelService.getAllPurchases();
        List<User> allUsers = userService.getUsers();

        // 1. Content & Publishing Metrics
        int totalStories = allNovels.size();
        int novelsCount = 0;
        int comicsCount = 0;
        int ongoingCount = 0;
        int completedCount = 0;

        Map<Long, Novel> novelMap = new HashMap<>();
        for (Novel n : allNovels) {
            novelMap.put(n.getId(), n);
            if ("COMIC".equalsIgnoreCase(n.getType())) {
                comicsCount++;
            } else {
                novelsCount++;
            }
            if ("COMPLETED".equalsIgnoreCase(n.getStatus())) {
                completedCount++;
            } else {
                ongoingCount++;
            }
        }

        int totalChapters = allChapters.size();

        Map<Long, Chapter> chapterMap = new HashMap<>();
        Map<Long, Integer> novelChapterCounts = new HashMap<>();
        for (Chapter c : allChapters) {
            chapterMap.put(c.getId(), c);
            if (c.getNovel() != null) {
                Long nId = c.getNovel().getId();
                novelChapterCounts.put(nId, novelChapterCounts.getOrDefault(nId, 0) + 1);
            }
        }

        // 2. Sales & Revenue Metrics
        int totalSales = allPurchases.size();
        int totalRevenueFlakes = 0;

        Map<Long, Integer> novelSalesMap = new HashMap<>();
        Map<Long, Integer> novelRevenueMap = new HashMap<>();
        Map<String, Integer> dailyRevenueMap = new TreeMap<>();
        Map<String, Integer> dailySalesMap = new TreeMap<>();

        for (Purchase p : allPurchases) {
            Chapter chap = chapterMap.get(p.getChapterId());
            int price = (chap != null && chap.getPrice() != null) ? chap.getPrice() : 0;
            totalRevenueFlakes += price;

            if (chap != null && chap.getNovel() != null) {
                Long nId = chap.getNovel().getId();
                novelSalesMap.put(nId, novelSalesMap.getOrDefault(nId, 0) + 1);
                novelRevenueMap.put(nId, novelRevenueMap.getOrDefault(nId, 0) + price);
            }

            if (p.getPurchasedAt() != null) {
                String dateStr = p.getPurchasedAt().toLocalDate().toString();
                dailyRevenueMap.put(dateStr, dailyRevenueMap.getOrDefault(dateStr, 0) + price);
                dailySalesMap.put(dateStr, dailySalesMap.getOrDefault(dateStr, 0) + 1);
            }
        }

        // 3. User & Audience Metrics
        int totalUsers = allUsers.size();
        int activeOnlineUsers = 1;
        try {
            Class<?> listenerClass = Class.forName("com.reader.Novel.Reader.listener.ActiveSessionListener");
            java.lang.reflect.Method method = listenerClass.getMethod("getActiveSessionsCount");
            Object val = method.invoke(null);
            if (val instanceof Integer) {
                activeOnlineUsers = (Integer) val;
            }
        } catch (Exception ignored) {
            // ActiveSessionListener is omitted from public git builds
        }
        Map<String, Integer> dailyRegistrationsMap = new TreeMap<>();
        int authorsCount = 0;
        int readersCount = 0;

        for (User u : allUsers) {
            if ("EDITOR".equals(u.getUser_type()) || "ADMIN".equals(u.getUser_type()) || "OWNER".equals(u.getUser_type())) {
                authorsCount++;
            } else {
                readersCount++;
            }
        }

        // 4. Top Performing Stories
        List<Map<String, Object>> topStories = new ArrayList<>();
        for (Novel n : allNovels) {
            Map<String, Object> storyMap = new LinkedHashMap<>();
            storyMap.put("id", n.getId());
            storyMap.put("title", n.getTitle());
            storyMap.put("type", n.getType());
            storyMap.put("status", n.getStatus());
            storyMap.put("coverUrl", n.getCoverUrl());
            storyMap.put("rating", n.getRating());
            storyMap.put("chaptersCount", novelChapterCounts.getOrDefault(n.getId(), 0));
            storyMap.put("salesCount", novelSalesMap.getOrDefault(n.getId(), 0));
            storyMap.put("revenueFlakes", novelRevenueMap.getOrDefault(n.getId(), 0));
            topStories.add(storyMap);
        }
        // Sort top stories by revenue descending
        topStories.sort((a, b) -> {
            int revA = a.get("revenueFlakes") != null ? (Integer) a.get("revenueFlakes") : 0;
            int revB = b.get("revenueFlakes") != null ? (Integer) b.get("revenueFlakes") : 0;
            return Integer.compare(revB, revA);
        });

        // Assemble Final JSON Payload
        Map<String, Object> response = new LinkedHashMap<>();
        
        // Summary KPIs
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalRevenueFlakes", totalRevenueFlakes);
        kpis.put("estimatedUsdValue", String.format("%.2f", totalRevenueFlakes * 0.01)); // $0.01 per flake conversion rate
        kpis.put("totalSales", totalSales);
        kpis.put("totalStories", totalStories);
        kpis.put("novelsCount", novelsCount);
        kpis.put("comicsCount", comicsCount);
        kpis.put("ongoingCount", ongoingCount);
        kpis.put("completedCount", completedCount);
        kpis.put("totalChapters", totalChapters);
        kpis.put("totalUsers", totalUsers);
        kpis.put("readersCount", readersCount);
        kpis.put("authorsCount", authorsCount);
        kpis.put("activeOnlineUsers", activeOnlineUsers);
        response.put("kpis", kpis);

        // Detailed Lists for Modals
        List<Map<String, Object>> usersList = new ArrayList<>();
        for (User u : allUsers) {
            Map<String, Object> uMap = new LinkedHashMap<>();
            uMap.put("id", u.getId());
            uMap.put("username", u.getUsername());
            uMap.put("email", u.getEmail());
            uMap.put("name", u.getName());
            uMap.put("userType", u.getUser_type());
            uMap.put("banned", u.getBanned());
            usersList.add(uMap);
        }
        response.put("usersList", usersList);

        List<Map<String, Object>> chaptersList = new ArrayList<>();
        for (Chapter c : allChapters) {
            Map<String, Object> cMap = new LinkedHashMap<>();
            cMap.put("id", c.getId());
            cMap.put("chapterNumber", c.getChapterNumber());
            cMap.put("title", c.getTitle());
            cMap.put("price", c.getPrice());
            cMap.put("publishAt", c.getPublishAt() != null ? c.getPublishAt().toString() : "Immediately");
            cMap.put("novelTitle", c.getNovel() != null ? c.getNovel().getTitle() : "Unknown");
            chaptersList.add(cMap);
        }
        response.put("chaptersList", chaptersList);

        List<Map<String, Object>> purchasesList = new ArrayList<>();
        for (Purchase p : allPurchases) {
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("id", p.getId());
            pMap.put("purchasedAt", p.getPurchasedAt() != null ? p.getPurchasedAt().toString() : "");
            
            User buyer = null;
            for (User u : allUsers) {
                if (u.getId() != null && u.getId().equals(p.getUserId())) {
                    buyer = u;
                    break;
                }
            }
            pMap.put("username", buyer != null ? buyer.getUsername() : "User #" + p.getUserId());
            pMap.put("email", buyer != null ? buyer.getEmail() : "");

            Chapter chap = chapterMap.get(p.getChapterId());
            pMap.put("chapterNumber", chap != null ? chap.getChapterNumber() : "Unknown");
            pMap.put("chapterTitle", chap != null ? chap.getTitle() : "Unknown");
            pMap.put("price", chap != null ? chap.getPrice() : 0);
            pMap.put("novelTitle", (chap != null && chap.getNovel() != null) ? chap.getNovel().getTitle() : "Unknown");

            purchasesList.add(pMap);
        }
        response.put("purchasesList", purchasesList);

        List<Map<String, Object>> activeUsersPayload = new ArrayList<>();
        try {
            Class<?> listenerClass = Class.forName("com.reader.Novel.Reader.listener.ActiveSessionListener");
            java.lang.reflect.Method method = listenerClass.getMethod("getActiveUsersList");
            Object val = method.invoke(null);
            if (val instanceof List) {
                List<?> rawList = (List<?>) val;
                for (Object item : rawList) {
                    if (item instanceof User) {
                        User u = (User) item;
                        Map<String, Object> uMap = new LinkedHashMap<>();
                        uMap.put("id", u.getId());
                        uMap.put("username", u.getUsername());
                        uMap.put("email", u.getEmail());
                        uMap.put("name", u.getName());
                        uMap.put("userType", u.getUser_type());
                        activeUsersPayload.add(uMap);
                    }
                }
            }
        } catch (Exception ignored) {
        }
        response.put("activeUsersList", activeUsersPayload);

        // Timelines for Charts
        response.put("dailyRevenue", dailyRevenueMap);
        response.put("dailySales", dailySalesMap);
        response.put("dailyRegistrations", dailyRegistrationsMap);

        // Top Content Ranking
        response.put("stories", topStories);

        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
}
