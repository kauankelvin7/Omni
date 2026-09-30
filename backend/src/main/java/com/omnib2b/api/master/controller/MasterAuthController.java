package com.omnib2b.api.master.controller;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.master.service.MasterAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/master")
public class MasterAuthController {

    private final MasterAuthService masterAuthService;

    public MasterAuthController(MasterAuthService masterAuthService) {
        this.masterAuthService = masterAuthService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpReq) {
        String ip = getClientIp(httpReq);
        try {
            return ResponseEntity.ok(masterAuthService.login(request, ip));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}
