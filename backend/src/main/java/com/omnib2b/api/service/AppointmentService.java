package com.omnib2b.api.service;

import com.omnib2b.api.domain.Appointment;
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
        return appointmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Appointment findById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nao encontrado"));
    }

    @Transactional
    public Appointment create(Appointment appointment) {
        Patient patient = patientService.findById(appointment.getPatient().getId());
        appointment.setPatient(patient);
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
        return appointmentRepository.findByPatientId(patientId);
    }
}
