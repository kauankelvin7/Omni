package com.omnib2b.api.auth.service;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.core.entity.User;
import com.omnib2b.api.core.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmailWithoutTenantFilter(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Credenciais invalidas");
        }

        User user = userOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Credenciais invalidas");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse refresh(String token) {
        String userIdStr = jwtService.extractUserIdFromExpiredToken(token);
        if (userIdStr == null) {
            throw new RuntimeException("Refresh token inválido");
        }
        User user = userRepository.findById(java.util.UUID.fromString(userIdStr))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado para refresh token"));

        String newToken = jwtService.generateToken(user);
        return new AuthResponse(newToken);
    }
}
