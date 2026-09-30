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

    @Value("${master.jwt-secret}")
    private String secret;

    private static final long MASTER_EXPIRATION = 4 * 60 * 60 * 1000L; // 4 hours

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateMasterToken(Admin admin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "SUPER_ADMIN");
        claims.put("token_type", "master");
        claims.put("admin_id", admin.getId().toString());

        return Jwts.builder()
                .claims(claims)
                .subject(admin.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + MASTER_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!"master".equals(claims.get("token_type", String.class)) ||
                !"SUPER_ADMIN".equals(claims.get("role", String.class))) {
            throw new IllegalArgumentException("Não é um token de administrador");
        }
        return claims;
    }
}
