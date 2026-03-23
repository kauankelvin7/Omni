package com.omnib2b.api.master.controller;

import com.omnib2b.api.master.entity.MasterActionLog;
import com.omnib2b.api.master.entity.SecurityLog;
import com.omnib2b.api.master.service.MasterActionLogService;
import com.omnib2b.api.master.service.SecurityLogService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/master")
public class MasterSecurityController {

    private final SecurityLogService securityLogService;
    private final MasterActionLogService actionLogService;

    public MasterSecurityController(SecurityLogService securityLogService, MasterActionLogService actionLogService) {
        this.securityLogService = securityLogService;
        this.actionLogService = actionLogService;
    }

    @GetMapping("/security-logs")
    public ResponseEntity<Page<SecurityLog>> securityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(securityLogService.findAll(page, size));
    }

    @GetMapping("/action-logs")
    public ResponseEntity<Page<MasterActionLog>> actionLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(actionLogService.findAll(page, size));
    }
}
