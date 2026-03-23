package com.omnib2b.api.service;

import com.omnib2b.api.domain.Patient;
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

    @Transactional(readOnly = true)
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente nao encontrado"));
    }

    @Transactional
    public Patient create(Patient patient) {
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

        appointmentRepository.deleteByPatientId(id);
        patientRepository.delete(patient);
    }

    @Transactional
    public Patient updateTelegramChatId(UUID id, Long chatId) {
        Patient patient = findById(id);
        patient.setTelegramChatId(chatId);
        return patientRepository.save(patient);
    }
}
