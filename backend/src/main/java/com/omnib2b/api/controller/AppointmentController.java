package com.omnib2b.api.controller;

import com.omnib2b.api.domain.Appointment;
import com.omnib2b.api.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @GetMapping
    public List<Appointment> list() {
        return appointmentService.findAll();
    }

    @GetMapping("/{id}")
    public Appointment getById(@PathVariable UUID id) {
        return appointmentService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment create(@RequestBody Appointment appointment) {
        return appointmentService.create(appointment);
    }

    @PutMapping("/{id}")
    public Appointment updateStatus(@PathVariable UUID id, @RequestBody AppointmentStatusUpdate update) {
        return appointmentService.updateStatus(id, update.getStatus());
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> findByPatientId(@PathVariable UUID patientId) {
        return appointmentService.findByPatientId(patientId);
    }

    public static class AppointmentStatusUpdate {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
