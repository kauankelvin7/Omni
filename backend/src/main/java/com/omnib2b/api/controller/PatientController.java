package com.omnib2b.api.controller;

import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.omnib2b.api.service.TelegramLinkService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    private final TelegramLinkService telegramLinkService;

    record RedeemLinkRequest(@NotBlank String token, @NotNull @Positive Long chatId) {}

    @GetMapping
    public List<Patient> list() {
        return patientService.findAll();
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable UUID id) {
        return patientService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@RequestBody Patient patient) {
        return patientService.create(patient);
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable UUID id, @RequestBody Patient patient) {
        return patientService.update(id, patient);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        patientService.delete(id);
    }

    @PostMapping("/{id}/telegram-link")
    public ResponseEntity<TelegramLinkService.IssuedLink> issueTelegramLink(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(telegramLinkService.issue(id));
    }

    @PostMapping("/telegram/redeem")
    public ResponseEntity<Void> redeemTelegramLink(@Valid @RequestBody RedeemLinkRequest body) {
        telegramLinkService.redeem(body.token(), body.chatId());
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
}
