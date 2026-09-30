package com.omnib2b.api;

import com.omnib2b.api.core.interceptor.SubscriptionAccessInterceptor;
import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.job.SubscriptionJob;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import com.omnib2b.api.master.service.SecurityLogService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SubscriptionSecurityTest {
    @AfterEach
    void clear() { TenantContext.clear(); }

    private TenantSubscription subscription(UUID tenant, String status, OffsetDateTime expiry) {
        TenantSubscription s = new TenantSubscription();
        s.setTenantId(tenant);
        s.setStatus(status);
        s.setPlanName("STARTER");
        s.setTrialEndsAt(expiry);
        s.setCurrentPeriodEnd(expiry);
        return s;
    }

    @Test
    void accessIsDeniedToExpiredOrSuspendedTenants() throws Exception {
        UUID tenant = UUID.randomUUID();
        TenantContext.setCurrentTenant(tenant);
        TenantSubscriptionRepository repo = mock(TenantSubscriptionRepository.class);
        SubscriptionAccessInterceptor interceptor = new SubscriptionAccessInterceptor(repo);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/patients");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(repo.findLatestByTenantId(tenant))
                .thenReturn(Optional.of(subscription(tenant, "TRIAL", OffsetDateTime.now().minusHours(1))));
        assertFalse(interceptor.preHandle(request, response, new Object()));
        assertEquals(403, response.getStatus());

        when(repo.findLatestByTenantId(tenant))
                .thenReturn(Optional.of(subscription(tenant, "SUSPENDED", OffsetDateTime.now().plusDays(1))));
        assertFalse(interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));

        when(repo.findLatestByTenantId(tenant))
                .thenReturn(Optional.of(subscription(tenant, "ACTIVE", OffsetDateTime.now().plusDays(1))));
        assertTrue(interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));
    }

    @Test
    void automatedExpiryDoesNotWriteFakeAdminIdToForeignKeyTable() {
        UUID tenant = UUID.randomUUID();
        TenantSubscriptionRepository repo = mock(TenantSubscriptionRepository.class);
        SecurityLogService log = mock(SecurityLogService.class);
        TenantSubscription expired = subscription(tenant, "TRIAL", OffsetDateTime.now().minusDays(1));
        when(repo.findAll()).thenReturn(List.of(expired));

        new SubscriptionJob(repo, log).checkExpiredSubscriptions();
        assertEquals("SUSPENDED", expired.getStatus());
        verify(repo).save(expired);
        verify(log).log(eq("TRIAL_EXPIRED"), isNull(), isNull(), contains(tenant.toString()), eq(true));
    }
}
