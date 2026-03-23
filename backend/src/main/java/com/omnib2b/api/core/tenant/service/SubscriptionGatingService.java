package com.omnib2b.api.core.tenant.service;

import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionGatingService {

    private final TenantSubscriptionRepository subscriptionRepository;
    private final DataSource dataSource;

    public boolean canAddPatient(UUID tenantId) {
        TenantSubscription sub = subscriptionRepository.findLatestByTenantId(tenantId)
                .orElse(null);

        // Default to TRIAL or STARTER limits if no subscription found (should not happen with regular flow)
        String plan = (sub != null) ? sub.getPlanName() : "TRIAL";
        
        if ("PRO".equals(plan) || "CLINIC_PLUS".equals(plan)) {
            return true;
        }

        // STARTER or TRIAL limit: 100 patients
        long count = getPatientCount(tenantId);
        return count < 100;
    }

    public boolean hasAccessToAdvancedReports(String planName) {
        return "PRO".equals(planName) || "CLINIC_PLUS".equals(planName);
    }

    public boolean canAddUser(UUID tenantId) {
        TenantSubscription sub = subscriptionRepository.findLatestByTenantId(tenantId)
                .orElse(null);
        String plan = (sub != null) ? sub.getPlanName() : "TRIAL";

        if ("PRO".equals(plan) || "CLINIC_PLUS".equals(plan)) {
            return true;
        }

        // STARTER or TRIAL limit: 1 admin user
        long count = getUserCount(tenantId);
        return count < 1;
    }

    private long getPatientCount(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM patients WHERE tenant_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, tenantId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (Exception e) {
            return 999; // Fail safe to block if DB error
        }
        return 0;
    }

    private long getUserCount(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM users WHERE tenant_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, tenantId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (Exception e) {
            return 999;
        }
        return 0;
    }
}
