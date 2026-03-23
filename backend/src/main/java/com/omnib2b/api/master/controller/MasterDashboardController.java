package com.omnib2b.api.master.controller;

import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/master")
public class MasterDashboardController {

    private final TenantSubscriptionRepository subscriptionRepo;

    // We use native queries on the tenant table directly
    private final javax.sql.DataSource dataSource;

    public MasterDashboardController(TenantSubscriptionRepository subscriptionRepo, javax.sql.DataSource dataSource) {
        this.subscriptionRepo = subscriptionRepo;
        this.dataSource = dataSource;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> result = new HashMap<>();

        try (var conn = dataSource.getConnection()) {
            // Total tenants
            try (var stmt = conn.prepareStatement("SELECT COUNT(*) FROM tenants")) {
                var rs = stmt.executeQuery();
                rs.next();
                result.put("total_tenants", rs.getLong(1));
            }

            // New this month
            try (var stmt = conn.prepareStatement(
                    "SELECT COUNT(*) FROM tenants WHERE created_at >= date_trunc('month', CURRENT_DATE)")) {
                var rs = stmt.executeQuery();
                rs.next();
                result.put("new_this_month", rs.getLong(1));
            }

            // Subscription stats
            List<TenantSubscription> allSubs = subscriptionRepo.findAll();
            long active = allSubs.stream().filter(s -> "ACTIVE".equals(s.getStatus())).count();
            long trial = allSubs.stream().filter(s -> "TRIAL".equals(s.getStatus())).count();
            long suspended = allSubs.stream().filter(s -> "SUSPENDED".equals(s.getStatus())).count();
            long cancelled = allSubs.stream().filter(s -> "CANCELLED".equals(s.getStatus())).count();

            result.put("active_tenants", active);
            result.put("trial_tenants", trial);
            result.put("suspended_tenants", suspended);
            result.put("cancelled_tenants", cancelled);

            BigDecimal mrr = subscriptionRepo.calculateMRR();
            result.put("mrr", mrr);

            // Growth chart (last 6 months)
            List<Map<String, Object>> growthChart = new ArrayList<>();
            try (var stmt = conn.prepareStatement(
                    "SELECT date_trunc('month', created_at) AS month, COUNT(*) AS cnt " +
                    "FROM tenants WHERE created_at >= NOW() - INTERVAL '6 months' " +
                    "GROUP BY month ORDER BY month")) {
                var rs = stmt.executeQuery();
                while (rs.next()) {
                    growthChart.add(Map.of("month", rs.getString(1), "count", rs.getLong(2)));
                }
            }
            result.put("growth_chart", growthChart);

            // Revenue chart (last 6 months)
            List<Map<String, Object>> revenueChart = new ArrayList<>();
            try (var stmt = conn.prepareStatement(
                    "SELECT date_trunc('month', created_at) AS month, COALESCE(SUM(price), 0) AS revenue " +
                    "FROM tenant_subscriptions WHERE status = 'ACTIVE' AND created_at >= NOW() - INTERVAL '6 months' " +
                    "GROUP BY month ORDER BY month")) {
                var rs = stmt.executeQuery();
                while (rs.next()) {
                    revenueChart.add(Map.of("month", rs.getString(1), "revenue", rs.getBigDecimal(2)));
                }
            }
            result.put("revenue_chart", revenueChart);

        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}
