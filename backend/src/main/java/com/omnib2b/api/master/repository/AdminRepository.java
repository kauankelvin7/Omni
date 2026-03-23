package com.omnib2b.api.master.repository;

import com.omnib2b.api.master.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {

    @Query(value = "SELECT * FROM admins WHERE email = :email", nativeQuery = true)
    Optional<Admin> findByEmail(String email);
}
