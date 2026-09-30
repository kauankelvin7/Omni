package com.omnib2b.api.core.config;

import com.omnib2b.api.core.interceptor.JwtInterceptor;
import com.omnib2b.api.core.interceptor.SubscriptionAccessInterceptor;
import com.omnib2b.api.core.interceptor.MdcInterceptor;
import com.omnib2b.api.master.interceptor.MasterAuthInterceptor;
import com.omnib2b.api.master.interceptor.RateLimitInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;
    private final SubscriptionAccessInterceptor subscriptionAccessInterceptor;
    private final MasterAuthInterceptor masterAuthInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;
    private final MdcInterceptor mdcInterceptor;

    @Value("${allowed.origins:http://localhost:5173}")
    private String allowedOrigins;

    public WebMvcConfig(JwtInterceptor jwtInterceptor,
                        SubscriptionAccessInterceptor subscriptionAccessInterceptor,
                        MasterAuthInterceptor masterAuthInterceptor,
                        RateLimitInterceptor rateLimitInterceptor,
                        MdcInterceptor mdcInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
        this.subscriptionAccessInterceptor = subscriptionAccessInterceptor;
        this.masterAuthInterceptor = masterAuthInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.mdcInterceptor = mdcInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Logging context — must be first to catch all requests
        registry.addInterceptor(mdcInterceptor)
                .addPathPatterns("/**");

        // Rate limiting — must be second
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/auth/login", "/master/auth/login", "/tenants/register", "/auth/refresh");

        // Clinic user JWT auth
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/login", "/auth/refresh",
                        "/tenants/register",
                        "/master/**",
                        "/actuator/health",
                        "/health",
                        "/error"  // Allow default error responses
                );

        // After JWT validates tenant identity, enforce paid/trial lifecycle.
        // Keep /subscription/me readable so suspended clinics can see their status.
        registry.addInterceptor(subscriptionAccessInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/**", "/tenants/register", "/master/**",
                        "/actuator/**", "/health", "/error", "/subscription/me"
                );

        // Master panel JWT auth
        registry.addInterceptor(masterAuthInterceptor)
                .addPathPatterns("/master/**")
                .excludePathPatterns("/master/auth/login");
    }
}
