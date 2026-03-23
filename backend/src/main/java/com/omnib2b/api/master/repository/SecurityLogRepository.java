package com.omnib2b.api.master.repository;

import com.omnib2b.api.master.entity.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface SecurityLogRepository extends JpaRepository<SecurityLog, UUID> {

    @Query(value = "SELECT * FROM security_logs ORDER BY created_at DESC",
           countQuery = "SELECT count(*) FROM security_logs",
           nativeQuery = true)
    Page<SecurityLog> findAllNative(Pageable pageable);
}
