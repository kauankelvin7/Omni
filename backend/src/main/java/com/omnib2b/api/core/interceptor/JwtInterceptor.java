package com.omnib2b.api.core.interceptor;

import com.omnib2b.api.auth.service.JwtService;
import com.omnib2b.api.core.tenant.TenantContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    public JwtInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Never carry the previous request's tenant into a new request on the same thread.
        TenantContext.clear();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = jwtService.parseToken(token);
            String tenantIdStr = claims.get("tenant_id", String.class);
            String userId = claims.getSubject();

            // Protected clinic routes must have a signed tenant claim.
            // Never derive or override tenancy using caller-controlled request headers.
            if (tenantIdStr == null || tenantIdStr.isBlank() || userId == null || userId.isBlank()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            UUID tenantId = UUID.fromString(tenantIdStr);
            TenantContext.setCurrentTenant(tenantId);
            MDC.put("tenantId", tenantIdStr.substring(0, 8));
            MDC.put("userId", userId.length() > 8 ? userId.substring(0, 8) : userId);

            return true;
        } catch (Exception e) {
            TenantContext.clear();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
