package com.omnib2b.api.master.config;

import com.omnib2b.api.master.entity.Admin;
import com.omnib2b.api.master.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MasterAdminSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;

    @Value("${master.email:kauan@omnib2b.com}")
    private String adminEmail;

    @Value("${master.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isEmpty()) {
            log.warn("⚠️ MASTER_PASSWORD não definida no application.yml. Pulando criação automática de Admin.");
            return;
        }

        if (adminRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("🚀 Criando administrador Master padrão: {}", adminEmail);
            Admin admin = new Admin();
            admin.setName("Master Admin");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(BCrypt.hashpw(adminPassword, BCrypt.gensalt()));
            adminRepository.save(admin);
            log.info("✅ Administrador Master criado com sucesso.");
        } else {
            log.info("ℹ️ Administrador Master ({}) já existe no banco.", adminEmail);
        }
    }
}
