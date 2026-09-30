package com.omnib2b.api;

import com.omnib2b.api.core.entity.Tenant;
import com.omnib2b.api.core.repository.TenantRepository;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.domain.Appointment;
import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.repository.AppointmentRepository;
import com.omnib2b.api.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TenantRepositoryIntegrationTest {

    @Autowired
    private TenantRepository tenants;

    @Autowired
    private PatientRepository patients;

    @Autowired
    private AppointmentRepository appointments;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void patientsAndAppointmentsCannotBeRetrievedUsingAnotherTenantId() {
        Tenant alpha = tenant("Clinic A");
        Tenant beta = tenant("Clinic B");

        TenantContext.setCurrentTenant(alpha.getId());
        Patient a = patient(alpha.getId(), "Alpha");
        Appointment appointmentA = appointment(alpha.getId(), a);

        TenantContext.setCurrentTenant(beta.getId());
        Patient b = patient(beta.getId(), "Beta");
        Appointment appointmentB = appointment(beta.getId(), b);

        // Explicit tenant predicates must work even when entities are already in the persistence context.
        entityManager.flush();
        entityManager.clear();
        TenantContext.setCurrentTenant(alpha.getId());

        List<Patient> alphaPatients = patients.findAllByTenantId(alpha.getId());
        assertEquals(1, alphaPatients.size());
        assertEquals(a.getId(), alphaPatients.get(0).getId());
        assertTrue(patients.findByIdAndTenantId(b.getId(), alpha.getId()).isEmpty());

        List<Appointment> alphaAppointments = appointments.findAllByTenantId(alpha.getId());
        assertEquals(1, alphaAppointments.size());
        assertEquals(appointmentA.getId(), alphaAppointments.get(0).getId());
        assertTrue(appointments.findByIdAndTenantId(appointmentB.getId(), alpha.getId()).isEmpty());
        assertTrue(appointments.findByPatientIdAndTenantId(b.getId(), alpha.getId()).isEmpty());

        TenantContext.setCurrentTenant(beta.getId());
        assertEquals(b.getId(), patients.findByIdAndTenantId(b.getId(), beta.getId()).orElseThrow().getId());
    }

    private Tenant tenant(String name) {
        Tenant tenant = new Tenant();
        tenant.setName(name);
        return tenants.saveAndFlush(tenant);
    }

    private Patient patient(UUID owner, String name) {
        Patient patient = new Patient();
        patient.setTenantId(owner);
        patient.setName(name);
        patient.setPhone("0000000000");
        return patients.saveAndFlush(patient);
    }

    private Appointment appointment(UUID owner, Patient patient) {
        Appointment app = new Appointment();
        app.setTenantId(owner);
        app.setPatient(patient);
        app.setAppointmentDate(ZonedDateTime.now());
        return appointments.saveAndFlush(app);
    }
}
