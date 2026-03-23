package com.omnib2b.api.core.tenant.service;

import com.omnib2b.api.core.entity.User;
import com.omnib2b.api.core.entity.Tenant;
import com.omnib2b.api.core.repository.UserRepository;
import com.omnib2b.api.core.repository.TenantRepository;
import com.omnib2b.api.domain.ClinicSettings;
import com.omnib2b.api.repository.ClinicSettingsRepository;
import com.omnib2b.api.core.tenant.dto.TenantRegisterRequest;
import com.omnib2b.api.master.entity.TenantSubscription;
import com.omnib2b.api.master.repository.TenantSubscriptionRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Service
public class TenantService {
    
    private final UserRepository userRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;
    private final TenantRepository tenantRepository;
    private final TenantSubscriptionRepository subscriptionRepository;

    public TenantService(UserRepository userRepository, 
                         ClinicSettingsRepository clinicSettingsRepository,
                         TenantRepository tenantRepository,
                         TenantSubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.tenantRepository = tenantRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional
    public void registerTenant(TenantRegisterRequest request) {
        if (userRepository.findByEmailWithoutTenantFilter(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        // 1. Create Tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getClinicName());
        tenant = tenantRepository.save(tenant);
        UUID tenantId = tenant.getId();

        // 2. Create Admin User
        User admin = new User();
        admin.setTenantId(tenantId);
        admin.setName(request.getClinicName() + " Admin");
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // 3. Create Default Clinic Settings
        ClinicSettings settings = new ClinicSettings();
        settings.setTenantId(tenantId);
        settings.setName(request.getClinicName());
        settings.setEmail(request.getEmail());
        settings.setPhone(request.getPhone() != null ? request.getPhone() : "");
        settings.setOpenTime("08:00");
        settings.setCloseTime("18:00");
        settings.setWorkDays(List.of("1", "2", "3", "4", "5"));
        clinicSettingsRepository.save(settings);

        // 4. Create Trial Subscription
        TenantSubscription subscription = new TenantSubscription();
        subscription.setTenantId(tenantId);
        subscription.setPlanName("TRIAL");
        subscription.setStatus("TRIAL");
        subscription.setPrice(new java.math.BigDecimal("0.00"));
        subscription.setTrialEndsAt(OffsetDateTime.now().plusDays(30));
        subscription.setCurrentPeriodEnd(OffsetDateTime.now().plusDays(30));
        subscriptionRepository.save(subscription);
    }
}
