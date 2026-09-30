package com.omnib2b.api;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.auth.service.AuthService;
import com.omnib2b.api.auth.service.JwtService;
import com.omnib2b.api.core.entity.User;
import com.omnib2b.api.core.repository.UserRepository;
import com.omnib2b.api.master.entity.Admin;
import com.omnib2b.api.master.service.MasterJwtService;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthTokenSecurityTest {

    private static final String TEST_KEY =
            "test-only-64-byte-jwt-signing-key-that-is-not-used-in-production-12345";

    private JwtService jwt() {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(service, "secret", TEST_KEY);
        ReflectionTestUtils.setField(service, "jwtExpiration", 3600000L);
        ReflectionTestUtils.setField(service, "refreshExpiration", 604800000L);
        return service;
    }

    private User user() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setTenantId(UUID.randomUUID());
        u.setEmail("user@example.invalid");
        u.setName("Test");
        u.setRole("ADMIN");
        u.setPasswordHash(org.mindrot.jbcrypt.BCrypt.hashpw("example-only-password", org.mindrot.jbcrypt.BCrypt.gensalt(4)));
        return u;
    }

    @Test
    void accessTokensCannotBeUsedAsRefreshCredentials() {
        JwtService jwt = jwt();
        User user = user();
        String access = jwt.generateToken(user);
        String refresh = jwt.generateRefreshToken(user);
        assertEquals(user.getTenantId().toString(), jwt.parseToken(access).get("tenant_id", String.class));
        assertThrows(IllegalArgumentException.class, () -> jwt.parseRefreshToken(access));
        assertThrows(IllegalArgumentException.class, () -> jwt.parseToken(refresh));
    }

    @Test
    void refreshTokensAreSubjectToExpiration() {
        JwtService jwt = jwt();
        ReflectionTestUtils.setField(jwt, "refreshExpiration", -1000L);
        String refresh = jwt.generateRefreshToken(user());
        assertThrows(ExpiredJwtException.class, () -> jwt.parseRefreshToken(refresh));
    }

    @Test
    void loginReturnsBothCredentialsButRefreshOnlyAcceptsRefreshToken() {
        JwtService jwt = jwt();
        UserRepository repository = mock(UserRepository.class);
        User user = user();
        when(repository.findByEmailWithoutTenantFilter(user.getEmail())).thenReturn(Optional.of(user));
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        AuthService service = new AuthService(repository, jwt);

        AuthRequest request = new AuthRequest();
        request.setEmail(user.getEmail());
        request.setPassword("example-only-password");
        AuthResponse login = service.login(request);
        assertNotNull(login.getToken());
        assertNotNull(login.getRefreshToken());
        assertThrows(IllegalArgumentException.class, () -> service.refresh(login.getToken()));
        AuthResponse renewed = service.refresh(login.getRefreshToken());
        assertNotNull(renewed.getToken());
        assertNotNull(renewed.getRefreshToken());
    }

    @Test
    void masterTokenIsNotAClinicAccessTokenEvenWhenKeysMatch() {
        JwtService clinic = jwt();
        MasterJwtService master = new MasterJwtService();
        ReflectionTestUtils.setField(master, "secret", TEST_KEY);

        Admin admin = new Admin();
        admin.setId(UUID.randomUUID());
        admin.setEmail("admin@example.invalid");
        String token = master.generateMasterToken(admin);
        assertEquals("master", master.parseToken(token).get("token_type", String.class));
        assertThrows(IllegalArgumentException.class, () -> clinic.parseToken(token));

        String impersonation = clinic.generateImpersonationToken(UUID.randomUUID(), UUID.randomUUID(), "clinic@example.invalid");
        assertTrue(clinic.parseToken(impersonation).get("impersonated", Boolean.class));
        assertThrows(IllegalArgumentException.class, () -> master.parseToken(impersonation));
    }
}
