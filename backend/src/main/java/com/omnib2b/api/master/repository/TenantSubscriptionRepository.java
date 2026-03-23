package com.omnib2b.api.master.repository;

import com.omnib2b.api.master.entity.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, UUID> {

    @Query(value = "SELECT * FROM tenant_subscriptions WHERE tenant_id = :tenantId ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Optional<TenantSubscription> findLatestByTenantId(UUID tenantId);

    @Query(value = "SELECT * FROM tenant_subscriptions WHERE status = :status", nativeQuery = true)
    List<TenantSubscription> findByStatus(String status);

    @Query(value = "SELECT * FROM tenant_subscriptions WHERE status = 'ACTIVE'", nativeQuery = true)
    List<TenantSubscription> findAllActive();

    @Query(value = "SELECT COALESCE(SUM(price), 0) FROM tenant_subscriptions WHERE status = 'ACTIVE'", nativeQuery = true)
    java.math.BigDecimal calculateMRR();
}
