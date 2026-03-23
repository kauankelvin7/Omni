package com.omnib2b.api.master.service;

import com.omnib2b.api.master.entity.SecurityLog;
import com.omnib2b.api.master.repository.SecurityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class SecurityLogService {

    private final SecurityLogRepository repo;

    public SecurityLogService(SecurityLogRepository repo) {
        this.repo = repo;
    }

    public void log(String eventType, String email, String ip, String details, boolean success) {
        SecurityLog entry = new SecurityLog();
        entry.setEventType(eventType);
        entry.setEmail(email);
        entry.setIpAddress(ip);
        entry.setDetails(details);
        entry.setSuccess(success);
        repo.save(entry);
    }

    public Page<SecurityLog> findAll(int page, int size) {
        return repo.findAllNative(PageRequest.of(page, size));
    }
}
