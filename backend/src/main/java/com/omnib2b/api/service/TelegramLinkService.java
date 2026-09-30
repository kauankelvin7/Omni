package com.omnib2b.api.service;

import com.omnib2b.api.core.tenant.TenantContext;
import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.domain.PatientTelegramLinkToken;
import com.omnib2b.api.repository.PatientRepository;
import com.omnib2b.api.repository.PatientTelegramLinkTokenRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TelegramLinkService {

    public record IssuedLink(String token, OffsetDateTime expiresAt) {}
    private final PatientRepository patients;
    private final PatientTelegramLinkTokenRepository tokens;
    private final SecureRandom random = new SecureRandom();

    public TelegramLinkService(PatientRepository patients, PatientTelegramLinkTokenRepository tokens) {
        this.patients = patients;
        this.tokens = tokens;
    }

    private static String sha256(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    @Transactional
    public IssuedLink issue(UUID patientId) {
        UUID tenant = TenantContext.requireCurrentTenant();
        // Lock patient to serialize simultaneous issuance; newest link invalidates older ones.
        patients.lockForTelegramLink(patientId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado"));

        OffsetDateTime now = OffsetDateTime.now();
        tokens.findUnusedByPatient(tenant, patientId).forEach(old -> old.setConsumedAt(now));
        byte[] secret = new byte[32];
        random.nextBytes(secret);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
        PatientTelegramLinkToken link = new PatientTelegramLinkToken();
        link.setTenantId(tenant);
        link.setPatientId(patientId);
        link.setTokenHash(sha256(raw));
        link.setExpiresAt(now.plusMinutes(30));
        tokens.save(link);
        return new IssuedLink(raw, link.getExpiresAt());
    }

    @Transactional
    public void redeem(String raw, Long chatId) {
        UUID tenant = TenantContext.requireCurrentTenant();
        if (raw == null || !raw.matches("[A-Za-z0-9_-]{43}") || chatId == null || chatId <= 0) {
            throw new IllegalArgumentException("Link inválido ou expirado");
        }
        PatientTelegramLinkToken link = tokens.lockByHashAndTenant(sha256(raw), tenant)
                .orElseThrow(() -> new IllegalArgumentException("Link inválido ou expirado"));
        OffsetDateTime now = OffsetDateTime.now();
        if (link.getConsumedAt() != null || !link.getExpiresAt().isAfter(now)) {
            throw new IllegalArgumentException("Link inválido ou expirado");
        }
        Patient patient = patients.findByIdAndTenantId(link.getPatientId(), tenant)
                .orElseThrow(() -> new IllegalArgumentException("Link inválido ou expirado"));
        // One-time consumption and patient update share the same database transaction.
        patient.setTelegramChatId(chatId);
        link.setConsumedAt(now);
    }
}
