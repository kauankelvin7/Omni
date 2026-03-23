package com.omnib2b.api.repository;

import com.omnib2b.api.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
}
