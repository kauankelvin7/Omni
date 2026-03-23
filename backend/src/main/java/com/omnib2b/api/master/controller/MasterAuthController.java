package com.omnib2b.api.master.controller;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.master.service.MasterAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PostMapping("/admins/seed")
    public ResponseEntity<Map<String, String>> seed(@RequestBody Map<String, String> body) {
        try {
            masterAuthService.seedAdmin(
                body.get("seed_secret"),
                body.getOrDefault("name", "Master Admin"),
                body.get("email"),
                body.get("password")
            );
            return ResponseEntity.ok(Map.of("message", "Admin master criado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
