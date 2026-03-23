package com.omnib2b.api.master.repository;

import com.omnib2b.api.master.entity.MasterActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface MasterActionLogRepository extends JpaRepository<MasterActionLog, UUID> {

    @Query(value = "SELECT * FROM master_action_logs ORDER BY created_at DESC",
           countQuery = "SELECT count(*) FROM master_action_logs",
           nativeQuery = true)
    Page<MasterActionLog> findAllNative(Pageable pageable);
}
