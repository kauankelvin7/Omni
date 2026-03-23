package com.omnib2b.api.core.config;

import com.omnib2b.api.core.interceptor.JwtInterceptor;
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
    private final MasterAuthInterceptor masterAuthInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    @Value("${allowed.origins:http://localhost:5173}")
    private String allowedOrigins;

    public WebMvcConfig(JwtInterceptor jwtInterceptor,
                        MasterAuthInterceptor masterAuthInterceptor,
                        RateLimitInterceptor rateLimitInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
        this.masterAuthInterceptor = masterAuthInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
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
        // Rate limiting — must be first
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/auth/login", "/master/auth/login");

        // Clinic user JWT auth
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/login", "/auth/refresh",
                        "/tenants/register",
                        "/master/**",
                        "/actuator/**",
                        "/error"  // Allow default error responses
                );

        // Master panel JWT auth
        registry.addInterceptor(masterAuthInterceptor)
                .addPathPatterns("/master/**")
                .excludePathPatterns("/master/auth/login", "/master/admins/seed");
    }
}
