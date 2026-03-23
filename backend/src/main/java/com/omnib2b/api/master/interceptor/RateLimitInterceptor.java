package com.omnib2b.api.master.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory IP-based rate limiter.
 * Limits are configurable per path pattern.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // key = ip:path-prefix, value = [count, windowStart]
    private final ConcurrentHashMap<String, long[]> counters = new ConcurrentHashMap<>();

    private static final int AUTH_LIMIT = 10;    // /auth/login
    private static final int MASTER_LIMIT = 5;   // /master/auth/login
    private static final long WINDOW_MS = 60 * 60 * 1000L; // 1 hour

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        if (!path.contains("/auth/login")) {
            return true; // only rate-limit login endpoints
        }

        int limit = path.startsWith("/master") ? MASTER_LIMIT : AUTH_LIMIT;
        String ip = getClientIp(request);
        String key = ip + ":" + (path.startsWith("/master") ? "master" : "auth");

        long now = System.currentTimeMillis();
        long[] entry = counters.compute(key, (k, v) -> {
            if (v == null || (now - v[1]) > WINDOW_MS) {
                return new long[]{1, now};
            }
            v[0]++;
            return v;
        });

        if (entry[0] > limit) {
            long retryAfter = (WINDOW_MS - (now - entry[1])) / 1000;
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(Math.max(retryAfter, 1)));
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too Many Requests\",\"retryAfter\":" + retryAfter + "}");
            return false;
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
