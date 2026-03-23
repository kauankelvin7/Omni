package com.omnib2b.api.core.repository;

import com.omnib2b.api.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Native query bypasses the Tenant @Filter, preventing tenant restrictions during login 
    // when the tenant_id is not yet known.
    @Query(value = "SELECT * FROM users WHERE email = :email", nativeQuery = true)
    Optional<User> findByEmailWithoutTenantFilter(@Param("email") String email);

    @Query(value = "SELECT * FROM users WHERE tenant_id = :tenantId LIMIT 1", nativeQuery = true)
    Optional<User> findFirstByTenantId(@Param("tenantId") UUID tenantId);
}
