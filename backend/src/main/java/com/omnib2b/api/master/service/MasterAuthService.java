package com.omnib2b.api.master.service;

import com.omnib2b.api.auth.dto.AuthRequest;
import com.omnib2b.api.auth.dto.AuthResponse;
import com.omnib2b.api.auth.service.JwtService;
import com.omnib2b.api.core.entity.User;
import com.omnib2b.api.core.repository.UserRepository;
import com.omnib2b.api.master.entity.Admin;
import com.omnib2b.api.master.repository.AdminRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class MasterAuthService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final MasterJwtService masterJwtService;
    private final JwtService jwtService;
    private final MasterActionLogService actionLogService;
    private final SecurityLogService securityLogService;

    public MasterAuthService(
            AdminRepository adminRepository,
            UserRepository userRepository,
            MasterJwtService masterJwtService,
            JwtService jwtService,
            MasterActionLogService actionLogService,
            SecurityLogService securityLogService
    ) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.masterJwtService = masterJwtService;
        this.jwtService = jwtService;
        this.actionLogService = actionLogService;
        this.securityLogService = securityLogService;
    }

    public AuthResponse login(AuthRequest request, String ip) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(request.getEmail());
        if (adminOpt.isEmpty()) {
            securityLogService.log("MASTER_LOGIN_FAIL", request.getEmail(), ip, "Admin not found", false);
            throw new RuntimeException("Credenciais inválidas");
        }

        Admin admin = adminOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), admin.getPasswordHash())) {
            securityLogService.log("MASTER_LOGIN_FAIL", request.getEmail(), ip, "Wrong password", false);
            throw new RuntimeException("Credenciais inválidas");
        }

        admin.setLastLogin(OffsetDateTime.now());
        adminRepository.save(admin);

        securityLogService.log("MASTER_LOGIN_SUCCESS", request.getEmail(), ip, "Login OK", true);
        actionLogService.log(admin.getId(), "LOGIN", null, ip, Map.of("event", "Master login"));

        String token = masterJwtService.generateMasterToken(admin);
        return new AuthResponse(token);
    }

    public AuthResponse impersonate(UUID adminId, UUID tenantId, String ip) {
        // Find the first user in that tenant
        Optional<User> userOpt = userRepository.findFirstByTenantId(tenantId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Nenhum usuário encontrado para o tenant");
        }
        User user = userOpt.get();

        actionLogService.log(adminId, "IMPERSONATE", tenantId, ip,
                Map.of("target_user", user.getEmail()));

        String token = jwtService.generateImpersonationToken(tenantId, user.getId(), user.getEmail());
        return new AuthResponse(token);
    }

}
