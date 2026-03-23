package com.omnib2b.api.master.interceptor;

import com.omnib2b.api.master.service.MasterJwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MasterAuthInterceptor implements HandlerInterceptor {

    private final MasterJwtService masterJwtService;

    public MasterAuthInterceptor(MasterJwtService masterJwtService) {
        this.masterJwtService = masterJwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Token não fornecido\"}");
            return false;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = masterJwtService.parseToken(token);
            String role = claims.get("role", String.class);

            if (!"SUPER_ADMIN".equals(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Acesso negado — requer SUPER_ADMIN\"}");
                return false;
            }

            // Store admin_id in request for controllers to use
            request.setAttribute("admin_id", claims.get("admin_id", String.class));
            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Token inválido ou expirado\"}");
            return false;
        }
    }
}
