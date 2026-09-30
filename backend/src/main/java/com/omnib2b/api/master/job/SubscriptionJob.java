package com.omnib2b.api.master.job;

import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import com.omnib2b.api.master.service.SecurityLogService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Component
public class SubscriptionJob {

    private final TenantSubscriptionRepository subscriptionRepository;
    private final SecurityLogService securityLogService;

    public SubscriptionJob(TenantSubscriptionRepository subscriptionRepository, SecurityLogService securityLogService) {
        this.subscriptionRepository = subscriptionRepository;
        this.securityLogService = securityLogService;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiredSubscriptions() {
        OffsetDateTime now = OffsetDateTime.now();
        for (TenantSubscription sub : subscriptionRepository.findAll()) {
            boolean trialExpired = "TRIAL".equals(sub.getStatus())
                    && sub.getTrialEndsAt() != null && !sub.getTrialEndsAt().isAfter(now);
            boolean activeExpired = "ACTIVE".equals(sub.getStatus())
                    && sub.getCurrentPeriodEnd() != null && !sub.getCurrentPeriodEnd().isAfter(now);
            if (!trialExpired && !activeExpired) continue;

            sub.setStatus("SUSPENDED");
            subscriptionRepository.save(sub);
            // Never insert fake admin_id into master_action_logs: that column has a real FK.
            securityLogService.log(trialExpired ? "TRIAL_EXPIRED" : "ACTIVE_PERIOD_EXPIRED",
                    null, null, "System expiry for tenant " + sub.getTenantId(), true);
        }
    }
}
