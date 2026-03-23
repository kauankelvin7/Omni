package com.omnib2b.api.controller;

import com.omnib2b.api.domain.ClinicSettings;
import com.omnib2b.api.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<ClinicSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<ClinicSettings> updateSettings(@RequestBody ClinicSettings settings) {
        return ResponseEntity.ok(settingsService.updateSettings(settings));
    }
}
