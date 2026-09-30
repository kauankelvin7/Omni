package com.omnib2b.api.service;

import com.omnib2b.api.domain.Appointment;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;

    @Transactional(readOnly = true)
    public List<Appointment> findAll() {
        return appointmentRepository.findAllByTenantId(TenantContext.requireCurrentTenant());
    }

    @Transactional(readOnly = true)
    public Appointment findById(UUID id) {
        return appointmentRepository.findByIdAndTenantId(id, TenantContext.requireCurrentTenant())
                .orElseThrow(() -> new RuntimeException("Agendamento nao encontrado"));
    }

    @Transactional
    public Appointment create(Appointment appointment) {
        UUID tenantId = TenantContext.requireCurrentTenant();
        // Resolving through PatientService rejects patient IDs belonging to other clinics.
        Patient patient = patientService.findById(appointment.getPatient().getId());
        appointment.setPatient(patient);
        appointment.setTenantId(tenantId);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatus(UUID id, String status) {
        Appointment app = findById(id);
        app.setStatus(status);
        return appointmentRepository.save(app);
    }

    @Transactional(readOnly = true)
    public List<Appointment> findByPatientId(UUID patientId) {
        // Check patient ownership even when no appointments exist.
        patientService.findById(patientId);
        return appointmentRepository.findByPatientIdAndTenantId(patientId, TenantContext.requireCurrentTenant());
    }
}
