package com.omnib2b.api.repository;

import com.omnib2b.api.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findAllByTenantId(UUID tenantId);
    Optional<Patient> findByIdAndTenantId(UUID id, UUID tenantId);
}
