package com.omnib2b.api.auth.dto;

import lombok.Getter;

@Getter
public class AuthResponse {
    private final String token;
    private final String refreshToken;

    // Master-admin and impersonation responses deliberately have no refresh token.
    public AuthResponse(String token) {
        this(token, null);
    }

    public AuthResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }
}
