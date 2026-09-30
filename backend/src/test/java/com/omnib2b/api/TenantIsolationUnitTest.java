package com.omnib2b.api;

import com.omnib2b.api.auth.service.JwtService;
import com.omnib2b.api.core.interceptor.JwtInterceptor;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.core.tenant.service.SubscriptionGatingService;
import com.omnib2b.api.domain.Appointment;
import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.master.service.SecurityLogService;
import com.omnib2b.api.repository.AppointmentRepository;
import com.omnib2b.api.repository.PatientRepository;
import com.omnib2b.api.service.AppointmentService;
import com.omnib2b.api.service.PatientService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TenantIsolationUnitTest {

    @AfterEach
    void cleanContext() {
        TenantContext.clear();
        MDC.clear();
    }

    @Test
    void signedJwtTenantCannotBeOverriddenByRequestHeader() throws Exception {
        UUID authenticated = UUID.randomUUID();
        UUID attackerSupplied = UUID.randomUUID();
        JwtService tokens = mock(JwtService.class);
        Claims claims = mock(Claims.class);
        when(tokens.parseToken("signed-token")).thenReturn(claims);
        when(claims.get("tenant_id", String.class)).thenReturn(authenticated.toString());
        when(claims.get("user_id", String.class)).thenReturn(UUID.randomUUID().toString());

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/patients");
        request.addHeader("Authorization", "Bearer signed-token");
        request.addHeader("X-Tenant-ID", attackerSupplied.toString());
        MockHttpServletResponse response = new MockHttpServletResponse();
        JwtInterceptor interceptor = new JwtInterceptor(tokens);

        assertTrue(interceptor.preHandle(request, response, new Object()));
        assertEquals(authenticated, TenantContext.requireCurrentTenant());
        interceptor.afterCompletion(request, response, new Object(), null);
        assertNull(TenantContext.getCurrentTenant());
    }

    @Test
    void protectedRequestWithoutTenantClaimIsRejectedAndClearsOldContext() throws Exception {
        TenantContext.setCurrentTenant(UUID.randomUUID());
        JwtService tokens = mock(JwtService.class);
        Claims claims = mock(Claims.class);
        when(tokens.parseToken("signed-token")).thenReturn(claims);
        when(claims.get("user_id", String.class)).thenReturn(UUID.randomUUID().toString());

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/patients");
        request.addHeader("Authorization", "Bearer signed-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertFalse(new JwtInterceptor(tokens).preHandle(request, response, new Object()));
        assertEquals(401, response.getStatus());
        assertNull(TenantContext.getCurrentTenant());
    }

    @Test
    void patientReadsRequireTenantInRepositoryPredicate() {
        UUID owner = UUID.randomUUID();
        UUID foreignPatient = UUID.randomUUID();
        TenantContext.setCurrentTenant(owner);

        PatientRepository patients = mock(PatientRepository.class);
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        PatientService service = new PatientService(patients, appointments,
                mock(SecurityLogService.class), mock(SubscriptionGatingService.class));
        when(patients.findAllByTenantId(owner)).thenReturn(List.of());
        when(patients.findByIdAndTenantId(foreignPatient, owner)).thenReturn(Optional.empty());

        assertTrue(service.findAll().isEmpty());
        assertThrows(RuntimeException.class, () -> service.findById(foreignPatient));
        verify(patients).findAllByTenantId(owner);
        verify(patients).findByIdAndTenantId(foreignPatient, owner);
        verify(patients, never()).findById(any(UUID.class));
    }

    @Test
    void patientCreationIgnoresForgedTenantInRequestBody() {
        UUID owner = UUID.randomUUID();
        TenantContext.setCurrentTenant(owner);
        PatientRepository patients = mock(PatientRepository.class);
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        SubscriptionGatingService gating = mock(SubscriptionGatingService.class);
        when(gating.canAddPatient(owner)).thenReturn(true);
        when(patients.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        Patient incoming = new Patient();
        incoming.setTenantId(UUID.randomUUID());

        PatientService service = new PatientService(patients, appointments,
                mock(SecurityLogService.class), gating);
        Patient saved = service.create(incoming);

        assertEquals(owner, saved.getTenantId());
        verify(patients).save(incoming);
    }

    @Test
    void appointmentReadsAndWritesStayInsideAuthenticatedTenant() {
        UUID owner = UUID.randomUUID();
        UUID appointmentId = UUID.randomUUID();
        UUID patientId = UUID.randomUUID();
        TenantContext.setCurrentTenant(owner);

        AppointmentRepository appointments = mock(AppointmentRepository.class);
        PatientService patients = mock(PatientService.class);
        Patient ownedPatient = new Patient();
        ownedPatient.setId(patientId);
        ownedPatient.setTenantId(owner);
        when(patients.findById(patientId)).thenReturn(ownedPatient);
        when(appointments.findByIdAndTenantId(appointmentId, owner)).thenReturn(Optional.empty());
        when(appointments.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        AppointmentService service = new AppointmentService(appointments, patients);
        assertThrows(RuntimeException.class, () -> service.findById(appointmentId));

        Appointment incoming = new Appointment();
        Patient reference = new Patient();
        reference.setId(patientId);
        incoming.setPatient(reference);
        incoming.setTenantId(UUID.randomUUID());

        Appointment saved = service.create(incoming);
        assertEquals(owner, saved.getTenantId());
        assertSame(ownedPatient, saved.getPatient());
        verify(appointments).findByIdAndTenantId(appointmentId, owner);
        verify(appointments, never()).findById(any(UUID.class));
    }
}
