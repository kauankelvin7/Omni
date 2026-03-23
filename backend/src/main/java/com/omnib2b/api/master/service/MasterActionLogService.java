package com.omnib2b.api.master.service;

import com.omnib2b.api.master.entity.MasterActionLog;
import com.omnib2b.api.master.repository.MasterActionLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class MasterActionLogService {

    private final MasterActionLogRepository repo;

    public MasterActionLogService(MasterActionLogRepository repo) {
        this.repo = repo;
    }

    public void log(UUID adminId, String action, UUID targetTenantId, String ip, Map<String, Object> details) {
        MasterActionLog entry = new MasterActionLog();
        entry.setAdminId(adminId);
        entry.setAction(action);
        entry.setTargetTenantId(targetTenantId);
        entry.setIpAddress(ip);
        entry.setDetails(details);
        repo.save(entry);
    }

    public Page<MasterActionLog> findAll(int page, int size) {
        return repo.findAllNative(PageRequest.of(page, size));
    }
}
