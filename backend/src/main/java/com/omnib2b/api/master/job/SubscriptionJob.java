package com.omnib2b.api.master.job;

import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import com.omnib2b.api.master.service.MasterActionLogService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional; // Use jakarta for spring boot 3
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class SubscriptionJob {

    private final TenantSubscriptionRepository subscriptionRepository;
    private final MasterActionLogService actionLogService;

    // UUID zero representing SYSTEM action
    private final UUID SYSTEM_ADMIN_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    public SubscriptionJob(TenantSubscriptionRepository subscriptionRepository, MasterActionLogService actionLogService) {
        this.subscriptionRepository = subscriptionRepository;
        this.actionLogService = actionLogService;
    }

    // Runs every day at midnight server time
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiredSubscriptions() {
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Expire past Trials
        List<TenantSubscription> expiredTrials = subscriptionRepository.findAll().stream()
                .filter(sub -> "TRIAL".equals(sub.getStatus()) && sub.getTrialEndsAt() != null && sub.getTrialEndsAt().isBefore(now))
                .toList();
                
        for (TenantSubscription sub : expiredTrials) {
            sub.setStatus("SUSPENDED");
            subscriptionRepository.save(sub);
            actionLogService.log(SYSTEM_ADMIN_ID, "TRIAL_EXPIRED", sub.getTenantId(), "127.0.0.1", Map.of("reason", "Automated Expiration Check"));
        }

        // 2. Expire past Active periods
        List<TenantSubscription> expiredActive = subscriptionRepository.findAll().stream()
                .filter(sub -> "ACTIVE".equals(sub.getStatus()) && sub.getCurrentPeriodEnd() != null && sub.getCurrentPeriodEnd().isBefore(now))
                .toList();

        for (TenantSubscription sub : expiredActive) {
            sub.setStatus("SUSPENDED");
            subscriptionRepository.save(sub);
            actionLogService.log(SYSTEM_ADMIN_ID, "ACTIVE_PERIOD_EXPIRED", sub.getTenantId(), "127.0.0.1", Map.of("reason", "Automated Period Renewal/Payment Check Failed"));
        }
    }
}
