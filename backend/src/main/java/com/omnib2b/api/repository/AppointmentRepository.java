package com.omnib2b.api.repository;

import com.omnib2b.api.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
    void deleteByPatientId(UUID patientId);
}
