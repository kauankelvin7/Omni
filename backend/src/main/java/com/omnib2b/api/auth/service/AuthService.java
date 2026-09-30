package com.omnib2b.api.auth.service;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.core.entity.User;
import com.omnib2b.api.core.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        // Do not allow tenant context from a previous request to affect login.
        User user = userRepository.findByEmailWithoutTenantFilter(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }
        return new AuthResponse(jwtService.generateToken(user), jwtService.generateRefreshToken(user));
    }

    public AuthResponse refresh(String refreshToken) {
        // Expired access tokens are NEVER accepted to mint another session.
        Claims claims = jwtService.parseRefreshToken(refreshToken);
        UUID userId = UUID.fromString(claims.get("user_id", String.class));
        UUID tenantId = UUID.fromString(claims.get("tenant_id", String.class));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));
        if (!tenantId.equals(user.getTenantId()) ||
                !user.getEmail().equals(claims.getSubject())) {
            throw new IllegalArgumentException("Sessão inválida");
        }
        return new AuthResponse(jwtService.generateToken(user), jwtService.generateRefreshToken(user));
    }
}
