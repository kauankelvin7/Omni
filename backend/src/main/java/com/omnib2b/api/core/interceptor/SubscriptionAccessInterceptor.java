package com.omnib2b.api.core.interceptor;

import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
public class SubscriptionAccessInterceptor implements HandlerInterceptor {

    private final TenantSubscriptionRepository subscriptions;

    public SubscriptionAccessInterceptor(TenantSubscriptionRepository subscriptions) {
        this.subscriptions = subscriptions;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        UUID tenantId = TenantContext.requireCurrentTenant();
        Optional<TenantSubscription> latest = subscriptions.findLatestByTenantId(tenantId);
        OffsetDateTime now = OffsetDateTime.now();
        boolean permitted = latest.map(sub ->
                "TRIAL".equals(sub.getStatus()) ? sub.getTrialEndsAt() != null && sub.getTrialEndsAt().isAfter(now)
                : "ACTIVE".equals(sub.getStatus()) && sub.getCurrentPeriodEnd() != null && sub.getCurrentPeriodEnd().isAfter(now)
        ).orElse(false);

        if (!permitted) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Assinatura inativa ou expirada. Consulte o painel de pagamento.\"}");
        }
        return permitted;
    }
}
