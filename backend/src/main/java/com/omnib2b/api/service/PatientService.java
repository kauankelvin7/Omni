package com.omnib2b.api.service;

import com.omnib2b.api.domain.Patient;
import jakarta.persistence.EntityNotFoundException;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.repository.AppointmentRepository;
import com.omnib2b.api.repository.PatientRepository;
import com.omnib2b.api.master.service.SecurityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final SecurityLogService securityLogService;
    private final com.omnib2b.api.core.tenant.service.SubscriptionGatingService gatingService;

    @Transactional(readOnly = true)
    public List<Patient> findAll() {
        return patientRepository.findAllByTenantId(TenantContext.requireCurrentTenant());
    }

    @Transactional(readOnly = true)
    public Patient findById(UUID id) {
        return patientRepository.findByIdAndTenantId(id, TenantContext.requireCurrentTenant())
                .orElseThrow(() -> new EntityNotFoundException("Paciente nao encontrado"));
    }

    @Transactional
    public Patient create(Patient patient) {
        UUID tenantId = TenantContext.requireCurrentTenant();
        if (gatingService != null && !gatingService.canAddPatient(tenantId)) {
            throw new com.omnib2b.api.core.exception.SubscriptionLimitException(
                "Limite de 100 pacientes atingido para o plano Starter. Por favor, faça o upgrade para o plano Pro para continuar."
            );
        }
        // Ignore tenant_id in the request body; JWT identity is authoritative.
        patient.setTenantId(tenantId);
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient update(UUID id, Patient patientDetails) {
        Patient patient = findById(id);
        patient.setName(patientDetails.getName());
        patient.setPhone(patientDetails.getPhone());
        patient.setEmail(patientDetails.getEmail());
        return patientRepository.save(patient);
    }

    @Transactional
    public void delete(UUID id) {
        Patient patient = findById(id);
        
        // LGPD: Log the deletion of personal data
        if (securityLogService != null) {
            securityLogService.log("LGPD_PATIENT_DELETE", patient.getEmail() != null ? patient.getEmail() : patient.getPhone(), null, "Patient deleted (ID: " + id + ")", true);
        }

        appointmentRepository.deleteByPatientIdAndTenantId(id, TenantContext.requireCurrentTenant());
        patientRepository.delete(patient);
    }

}
