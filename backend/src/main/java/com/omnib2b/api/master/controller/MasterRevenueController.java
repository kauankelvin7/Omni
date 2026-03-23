package com.omnib2b.api.master.controller;

import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/master")
public class MasterRevenueController {

    private final TenantSubscriptionRepository subscriptionRepo;
    private final javax.sql.DataSource dataSource;

    public MasterRevenueController(TenantSubscriptionRepository subscriptionRepo, javax.sql.DataSource dataSource) {
        this.subscriptionRepo = subscriptionRepo;
        this.dataSource = dataSource;
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> revenue() {
        Map<String, Object> result = new LinkedHashMap<>();

        BigDecimal mrr = subscriptionRepo.calculateMRR();
        result.put("mrr", mrr);

        List<TenantSubscription> allSubs = subscriptionRepo.findAll();
        BigDecimal totalAccumulated = allSubs.stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()) || "CANCELLED".equals(s.getStatus()))
                .map(s -> s.getPrice() != null ? s.getPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        result.put("total_revenue", totalAccumulated);

        long activeCount = allSubs.stream().filter(s -> "ACTIVE".equals(s.getStatus())).count();
        result.put("avg_per_clinic", activeCount > 0 ? mrr.divide(BigDecimal.valueOf(activeCount), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);

        // Active subscriptions with tenant name
        List<Map<String, Object>> activeSubs = new ArrayList<>();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement(
                 "SELECT ts.*, t.name AS tenant_name FROM tenant_subscriptions ts " +
                 "JOIN tenants t ON t.id = ts.tenant_id WHERE ts.status = 'ACTIVE' ORDER BY ts.current_period_end ASC")) {
            var rs = stmt.executeQuery();
            while (rs.next()) {
                activeSubs.add(Map.of(
                    "tenant_name", rs.getString("tenant_name"),
                    "plan", rs.getString("plan_name"),
                    "price", rs.getBigDecimal("price"),
                    "next_payment", String.valueOf(rs.getString("current_period_end"))
                ));
            }
        } catch (Exception e) {
            // fallback
        }
        result.put("active_subscriptions", activeSubs);

        // Pending payments (trial expired without active)
        List<Map<String, Object>> pending = new ArrayList<>();
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement(
                 "SELECT ts.*, t.name AS tenant_name FROM tenant_subscriptions ts " +
                 "JOIN tenants t ON t.id = ts.tenant_id " +
                 "WHERE ts.status = 'TRIAL' AND ts.trial_ends_at < NOW() ORDER BY ts.trial_ends_at ASC")) {
            var rs = stmt.executeQuery();
            while (rs.next()) {
                pending.add(Map.of(
                    "tenant_name", rs.getString("tenant_name"),
                    "trial_ended", String.valueOf(rs.getString("trial_ends_at"))
                ));
            }
        } catch (Exception e) {
            // fallback
        }
        result.put("pending_payments", pending);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<TenantSubscription>> allSubscriptions() {
        return ResponseEntity.ok(subscriptionRepo.findAll());
    }
}
