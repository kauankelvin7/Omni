package com.omnib2b.api;

import com.omnib2b.api.core.entity.Tenant;
import com.omnib2b.api.core.repository.TenantRepository;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.domain.PatientTelegramLinkToken;
import com.omnib2b.api.repository.PatientRepository;
import com.omnib2b.api.repository.PatientTelegramLinkTokenRepository;
import com.omnib2b.api.service.TelegramLinkService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TelegramLinkIntegrationTest {
    @Autowired private TenantRepository tenants;
    @Autowired private PatientRepository patients;
    @Autowired private PatientTelegramLinkTokenRepository tokens;
    @Autowired private TelegramLinkService links;
    @Autowired private EntityManager em;

    @AfterEach void clear() { TenantContext.clear(); }

    private Tenant tenant(String name) {
        Tenant t = new Tenant();
        t.setName(name);
        return tenants.saveAndFlush(t);
    }

    private Patient patient(Tenant t, String name) {
        TenantContext.setCurrentTenant(t.getId());
        Patient p = new Patient();
        p.setName(name);
        p.setPhone("000000000");
        p.setTenantId(t.getId());
        return patients.saveAndFlush(p);
    }

    @Test
    void tokenIsHashedTenantScopedOneUseAndNeverAUuid() {
        Tenant alpha = tenant("link-alpha");
        Tenant beta = tenant("link-beta");
        Patient patient = patient(alpha, "Alpha");
        TenantContext.setCurrentTenant(alpha.getId());

        TelegramLinkService.IssuedLink issued = links.issue(patient.getId());
        assertTrue(issued.token().matches("[A-Za-z0-9_-]{43}"));
        assertFalse(issued.token().equals(patient.getId().toString()));
        List<PatientTelegramLinkToken> stored = tokens.findUnusedByPatient(alpha.getId(), patient.getId());
        assertEquals(1, stored.size());
        assertNotEquals(issued.token(), stored.get(0).getTokenHash());
        assertEquals(64, stored.get(0).getTokenHash().length());

        // A different clinic's service account cannot redeem the same token.
        TenantContext.setCurrentTenant(beta.getId());
        assertThrows(IllegalArgumentException.class, () -> links.redeem(issued.token(), 123L));
        assertNull(patient.getTelegramChatId());

        TenantContext.setCurrentTenant(alpha.getId());
        links.redeem(issued.token(), 123L);
        em.flush();
        assertEquals(123L, patients.findByIdAndTenantId(patient.getId(), alpha.getId())
                .orElseThrow().getTelegramChatId());
        assertThrows(IllegalArgumentException.class, () -> links.redeem(issued.token(), 999L));
        assertEquals(123L, patient.getTelegramChatId());
    }

    @Test
    void issuingSecondLinkRevokesFirstAndExpiredLinksFail() {
        Tenant tenant = tenant("link-rotate");
        Patient patient = patient(tenant, "Beta");
        TelegramLinkService.IssuedLink first = links.issue(patient.getId());
        TelegramLinkService.IssuedLink second = links.issue(patient.getId());
        assertNotEquals(first.token(), second.token());
        assertEquals(1, tokens.findUnusedByPatient(tenant.getId(), patient.getId()).size());
        assertThrows(IllegalArgumentException.class, () -> links.redeem(first.token(), 123L));

        PatientTelegramLinkToken current = tokens.findUnusedByPatient(tenant.getId(), patient.getId()).get(0);
        current.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        tokens.saveAndFlush(current);
        assertThrows(IllegalArgumentException.class, () -> links.redeem(second.token(), 123L));
    }

    @Test
    void invalidLinkPayloadNeverBindsPatient() {
        Tenant tenant = tenant("link-invalid");
        Patient patient = patient(tenant, "Gamma");
        assertThrows(IllegalArgumentException.class,
                () -> links.redeem(patient.getId().toString(), 123L));
        assertThrows(IllegalArgumentException.class,
                () -> links.redeem("", 123L));
        assertThrows(IllegalArgumentException.class,
                () -> links.redeem("x".repeat(43), -1L));
        assertNull(patient.getTelegramChatId());
    }
}
