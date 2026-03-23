package com.omnib2b.api.master.service;

import com.omnib2b.api.master.entity.Admin;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class MasterJwtService {

    @Value("${jwt.secret:omnib2b-super-secret-key-that-needs-to-be-secure-for-hs256-signing}")
    private String secret;

    private static final long MASTER_EXPIRATION = 4 * 60 * 60 * 1000L; // 4 hours

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateMasterToken(Admin admin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "SUPER_ADMIN");
        claims.put("admin_id", admin.getId().toString());

        return Jwts.builder()
                .claims(claims)
                .subject(admin.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + MASTER_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Generates a temporary impersonation token (1h) pretending to be a clinic admin.
     */
    public String generateImpersonationToken(java.util.UUID tenantId, java.util.UUID userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tenant_id", tenantId.toString());
        claims.put("user_id", userId.toString());
        claims.put("impersonated", true);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000L)) // 1 hour
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
