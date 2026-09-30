package com.omnib2b.api.core.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantRegisterRequest {
    @NotBlank
    @Size(max = 120)
    private String clinicName;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 10, max = 72)
    private String password;

    @Size(max = 40)
    private String phone;
}
