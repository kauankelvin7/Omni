package com.omnib2b.api.master.controller;

import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import com.omnib2b.api.master.service.MasterActionLogService;
import com.omnib2b.api.master.service.MasterAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/master")
public class MasterTenantController {

    private final javax.sql.DataSource dataSource;
    private final TenantSubscriptionRepository subscriptionRepo;
    private final MasterActionLogService actionLogService;
    private final MasterAuthService masterAuthService;

    public MasterTenantController(
            javax.sql.DataSource dataSource,
            TenantSubscriptionRepository subscriptionRepo,
            MasterActionLogService actionLogService,
            MasterAuthService masterAuthService
    ) {
        this.dataSource = dataSource;
        this.subscriptionRepo = subscriptionRepo;
        this.actionLogService = actionLogService;
        this.masterAuthService = masterAuthService;
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<Map<String, Object>>> listTenants(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String search
    ) {
        List<Map<String, Object>> tenants = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT t.id, t.name, t.created_at, " +
            "COALESCE(ts.plan_name, 'TRIAL') AS plan_name, COALESCE(ts.status, 'TRIAL') AS sub_status, " +
            "ts.trial_ends_at, " +
            "(SELECT COUNT(*) FROM patients p WHERE p.tenant_id = t.id) AS patients_count, " +
            "(SELECT COUNT(*) FROM appointments a WHERE a.tenant_id = t.id AND a.created_at >= date_trunc('month', CURRENT_DATE)) AS appointments_month, " +
            "(SELECT email FROM users u WHERE u.tenant_id = t.id LIMIT 1) AS email " +
            "FROM tenants t LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = t.id " +
            "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append("AND ts.status = ? ");
            params.add(status);
        }
        if (plan != null && !plan.isBlank()) {
            sql.append("AND ts.plan_name = ? ");
            params.add(plan);
        }
        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(t.name) LIKE ? OR EXISTS (SELECT 1 FROM users u WHERE u.tenant_id = t.id AND LOWER(u.email) LIKE ?)) ");
            params.add("%" + search.toLowerCase() + "%");
            params.add("%" + search.toLowerCase() + "%");
        }
        sql.append("ORDER BY t.created_at DESC LIMIT 100");

        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            var rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", rs.getString("id"));
                row.put("name", rs.getString("name"));
                row.put("email", rs.getString("email"));
                row.put("plan", rs.getString("plan_name"));
                row.put("status", rs.getString("sub_status"));
                row.put("trial_ends_at", rs.getString("trial_ends_at"));
                row.put("patients_count", rs.getLong("patients_count"));
                row.put("appointments_month", rs.getLong("appointments_month"));
                row.put("created_at", rs.getString("created_at"));
                tenants.add(row);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok(tenants);
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<Map<String, Object>> tenantDetail(@PathVariable UUID id) {
        Map<String, Object> detail = new LinkedHashMap<>();
        try (var conn = dataSource.getConnection()) {
            try (var stmt = conn.prepareStatement("SELECT * FROM tenants WHERE id = ?")) {
                stmt.setObject(1, id);
                var rs = stmt.executeQuery();
                if (!rs.next()) return ResponseEntity.notFound().build();
                detail.put("id", rs.getString("id"));
                detail.put("name", rs.getString("name"));
                detail.put("created_at", rs.getString("created_at"));
            }
            // Subscription
            subscriptionRepo.findLatestByTenantId(id).ifPresent(sub -> {
                detail.put("subscription", Map.of(
                    "plan", sub.getPlanName(), "status", sub.getStatus(),
                    "price", sub.getPrice(),
                    "trial_ends_at", String.valueOf(sub.getTrialEndsAt()),
                    "current_period_end", String.valueOf(sub.getCurrentPeriodEnd())
                ));
            });
            // Stats
            try (var stmt = conn.prepareStatement("SELECT COUNT(*) FROM patients WHERE tenant_id = ?")) {
                stmt.setObject(1, id);
                var rs = stmt.executeQuery(); rs.next();
                detail.put("patients_count", rs.getLong(1));
            }
            try (var stmt = conn.prepareStatement("SELECT COUNT(*) FROM appointments WHERE tenant_id = ?")) {
                stmt.setObject(1, id);
                var rs = stmt.executeQuery(); rs.next();
                detail.put("appointments_total", rs.getLong(1));
            }
            // Admin user email
            try (var stmt = conn.prepareStatement("SELECT name, email FROM users WHERE tenant_id = ? LIMIT 1")) {
                stmt.setObject(1, id);
                var rs = stmt.executeQuery();
                if (rs.next()) {
                    detail.put("admin_name", rs.getString("name"));
                    detail.put("admin_email", rs.getString("email"));
                }
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok(detail);
    }

    @PutMapping("/tenants/{id}/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String newStatus = body.get("status");
        if (newStatus == null || !List.of("ACTIVE", "SUSPENDED", "CANCELLED").contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status inválido"));
        }

        var subOpt = subscriptionRepo.findLatestByTenantId(id);
        if (subOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TenantSubscription sub = subOpt.get();
        sub.setStatus(newStatus);
        subscriptionRepo.save(sub);

        UUID adminId = UUID.fromString((String) request.getAttribute("admin_id"));
        actionLogService.log(adminId, "UPDATE_STATUS", id, getClientIp(request),
                Map.of("new_status", newStatus));

        return ResponseEntity.ok(Map.of("message", "Status atualizado para " + newStatus));
    }

    @PutMapping("/tenants/{id}/plan")
    public ResponseEntity<Map<String, String>> updatePlan(
            @PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        
        var subOpt = subscriptionRepo.findLatestByTenantId(id);
        if (subOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TenantSubscription sub = subOpt.get();

        String newPlan = body.get("plan_name");
        String newStatus = body.get("status");
        String currentPeriodEndStr = body.get("current_period_end");

        if (newPlan != null && !newPlan.isBlank()) {
            sub.setPlanName(newPlan);
            // Set price based on plan
            switch (newPlan) {
                case "STARTER": sub.setPrice(new java.math.BigDecimal("197.00")); break;
                case "PRO": sub.setPrice(new java.math.BigDecimal("397.00")); break;
                case "CLINIC_PLUS": sub.setPrice(new java.math.BigDecimal("797.00")); break;
                default: break;
            }
        }
        if (newStatus != null && !newStatus.isBlank()) sub.setStatus(newStatus);
        
        if (currentPeriodEndStr != null && !currentPeriodEndStr.isBlank()) {
            try {
                sub.setCurrentPeriodEnd(OffsetDateTime.parse(currentPeriodEndStr));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formato de current_period_end inválido. Use ISO-8601"));
            }
        }

        subscriptionRepo.save(sub);

        UUID adminId = UUID.fromString((String) request.getAttribute("admin_id"));
        Map<String, Object> logDetails = new HashMap<>(body);
        actionLogService.log(adminId, "UPDATE_PLAN", id, getClientIp(request), logDetails);

        return ResponseEntity.ok(Map.of("message", "Assinatura do tenant atualizada com sucesso"));
    }

    @PostMapping("/tenants/{id}/impersonate")
    public ResponseEntity<AuthResponse> impersonate(@PathVariable UUID id, HttpServletRequest request) {
        UUID adminId = UUID.fromString((String) request.getAttribute("admin_id"));
        try {
            return ResponseEntity.ok(masterAuthService.impersonate(adminId, id, getClientIp(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable UUID id, HttpServletRequest request) {
        UUID adminId = UUID.fromString((String) request.getAttribute("admin_id"));
        try (var conn = dataSource.getConnection()) {
            // Log to ensure traceability when a master admin deletes a tenant
            actionLogService.log(adminId, "DELETE_TENANT", id, getClientIp(request), Map.of("reason", "Master deletion"));
            
            try (var stmt = conn.prepareStatement("DELETE FROM tenants WHERE id = ?")) {
                stmt.setObject(1, id);
                int rows = stmt.executeUpdate();
                if (rows == 0) return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
