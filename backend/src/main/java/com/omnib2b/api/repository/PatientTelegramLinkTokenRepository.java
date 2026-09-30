package com.omnib2b.api.repository;

import com.omnib2b.api.domain.PatientTelegramLinkToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientTelegramLinkTokenRepository extends JpaRepository<PatientTelegramLinkToken, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT link FROM PatientTelegramLinkToken link WHERE link.tokenHash = :hash AND link.tenantId = :tenantId")
    Optional<PatientTelegramLinkToken> lockByHashAndTenant(@Param("hash") String hash, @Param("tenantId") UUID tenantId);

    @Query("SELECT link FROM PatientTelegramLinkToken link WHERE link.tenantId = :tenantId AND link.patientId = :patientId AND link.consumedAt IS NULL")
    List<PatientTelegramLinkToken> findUnusedByPatient(@Param("tenantId") UUID tenantId, @Param("patientId") UUID patientId);
}
