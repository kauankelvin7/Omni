package com.omnib2b.api.repository;

import com.omnib2b.api.domain.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, UUID> {
    Optional<ClinicSettings> findByTenantId(UUID tenantId);
}
