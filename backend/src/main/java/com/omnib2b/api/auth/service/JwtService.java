package com.omnib2b.api.auth.service;

import com.omnib2b.api.core.entity.User;
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
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:3600000}") // access token: 1h by default
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // refresh token: max 7 days
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private Map<String, Object> userClaims(User user, String type) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tenant_id", user.getTenantId().toString());
        claims.put("user_id", user.getId().toString());
        claims.put("token_type", type);
        return claims;
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .claims(userClaims(user, "access"))
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .claims(userClaims(user, "refresh"))
                .id(UUID.randomUUID().toString())
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateImpersonationToken(UUID tenantId, UUID userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tenant_id", tenantId.toString());
        claims.put("user_id", userId.toString());
        claims.put("token_type", "access");
        claims.put("impersonated", true);
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000L))
                .signWith(getSigningKey())
                .compact();
    }

    private Claims verify(String token, String expectedType) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token ausente");
        }
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!expectedType.equals(claims.get("token_type", String.class))) {
            throw new IllegalArgumentException("Tipo de token inválido");
        }
        if (claims.get("tenant_id", String.class) == null || claims.get("user_id", String.class) == null) {
            throw new IllegalArgumentException("Claims obrigatórias ausentes");
        }
        return claims;
    }

    public Claims parseToken(String token) {
        return verify(token, "access");
    }

    public Claims parseRefreshToken(String token) {
        return verify(token, "refresh");
    }
}
