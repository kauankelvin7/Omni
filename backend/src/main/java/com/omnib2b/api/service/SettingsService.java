package com.omnib2b.api.service;

import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.domain.ClinicSettings;
import com.omnib2b.api.repository.ClinicSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SettingsService {

    private final ClinicSettingsRepository repository;

    public SettingsService(ClinicSettingsRepository repository) {
        this.repository = repository;
    }

    public ClinicSettings getSettings() {
        UUID tenantId = TenantContext.getCurrentTenant();
        return repository.findByTenantId(tenantId)
                .orElseGet(() -> {
                    ClinicSettings defaultSettings = new ClinicSettings();
                    defaultSettings.setName("Minha Clínica (Edite aqui)");
                    defaultSettings.setEmail("contato@clinica.com");
                    defaultSettings.setPhone("(11) 99999-9999");
                    defaultSettings.setOpenTime("08:00");
                    defaultSettings.setCloseTime("18:00");
                    defaultSettings.setWorkDays(java.util.List.of("1", "2", "3", "4", "5"));
                    return repository.save(defaultSettings);
                });
    }

    public ClinicSettings updateSettings(ClinicSettings newSettings) {
        UUID tenantId = TenantContext.getCurrentTenant();
        ClinicSettings existing = repository.findByTenantId(tenantId).orElse(new ClinicSettings());
        
        existing.setName(newSettings.getName());
        existing.setEmail(newSettings.getEmail());
        existing.setPhone(newSettings.getPhone());
        existing.setOpenTime(newSettings.getOpenTime());
        existing.setCloseTime(newSettings.getCloseTime());
        existing.setWorkDays(newSettings.getWorkDays());

        return repository.save(existing);
    }
}
