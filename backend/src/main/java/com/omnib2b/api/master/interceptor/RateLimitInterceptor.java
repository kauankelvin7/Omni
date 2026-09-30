package com.omnib2b.api.master.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Small per-instance safety net; production must ALSO use a distributed/edge rate
 * limiter. Never trust arbitrary X-Forwarded-For values supplied by clients.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private record Window(int count, long startedAt) {}
    private final ConcurrentHashMap<String, Window> counters = new ConcurrentHashMap<>();
    private static final long WINDOW_MS = 60 * 60 * 1000L;
    private static final Map<String, Integer> LIMITS = Map.of(
            "/auth/login", 10,
            "/master/auth/login", 5,
            "/tenants/register", 5,
            "/auth/refresh", 60
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String path = request.getRequestURI();
        Integer limit = LIMITS.get(path);
        if (limit == null) return true;

        // Reverse proxies must be configured at the infrastructure layer so
        // getRemoteAddr() reflects a trusted address; never use unverified XFF.
        String key = request.getRemoteAddr() + ":" + path;
        long now = System.currentTimeMillis();
        Window window = counters.compute(key, (ignored, prior) ->
                prior == null || now - prior.startedAt() >= WINDOW_MS
                        ? new Window(1, now)
                        : new Window(prior.count() + 1, prior.startedAt()));
        if (window.count() > limit) {
            long retryAfter = Math.max(1, (WINDOW_MS - (now - window.startedAt()) + 999) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too Many Requests\",\"retryAfter\":" + retryAfter + "}");
            return false;
        }
        return true;
    }

    @Scheduled(fixedDelay = WINDOW_MS)
    public void purgeExpired() {
        long cutoff = System.currentTimeMillis() - WINDOW_MS;
        counters.entrySet().removeIf(entry -> entry.getValue().startedAt() <= cutoff);
    }
}
