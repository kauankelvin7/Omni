package com.omnib2b.api.repository;

import com.omnib2b.api.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findAllByTenantId(UUID tenantId);
    Optional<Appointment> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Appointment> findByPatientIdAndTenantId(UUID patientId, UUID tenantId);
    void deleteByPatientIdAndTenantId(UUID patientId, UUID tenantId);
}
