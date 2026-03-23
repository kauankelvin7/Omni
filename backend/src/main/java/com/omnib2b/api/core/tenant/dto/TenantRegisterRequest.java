package com.omnib2b.api.core.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TenantRegisterRequest {
    @NotBlank
    private String clinicName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;
}
