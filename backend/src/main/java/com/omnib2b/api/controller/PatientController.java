package com.omnib2b.api.controller;

import com.omnib2b.api.domain.Patient;
import com.omnib2b.api.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    record TelegramLinkRequest(Long chatId) {}

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

    @PatchMapping("/{id}/telegram")
    public Patient linkTelegram(@PathVariable UUID id, @RequestBody TelegramLinkRequest body) {
        return patientService.updateTelegramChatId(id, body.chatId());
    }
}
