package com.omnib2b.api.core.tenant.controller;

import com.omnib2b.api.core.tenant.dto.TenantRegisterRequest;
import com.omnib2b.api.core.tenant.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody TenantRegisterRequest request) {
        tenantService.registerTenant(request);
        return ResponseEntity.ok().build();
    }
}
