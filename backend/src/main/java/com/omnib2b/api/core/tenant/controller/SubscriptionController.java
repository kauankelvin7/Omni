package com.omnib2b.api.core.tenant.controller;

import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final TenantSubscriptionRepository subscriptionRepository;

    @GetMapping("/me")
    public ResponseEntity<TenantSubscription> getMySubscription() {
        UUID tenantId = TenantContext.getCurrentTenant();
        return subscriptionRepository.findLatestByTenantId(tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
