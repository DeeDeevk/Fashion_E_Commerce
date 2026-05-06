package fit.iuh.userservice.configuration;

import fit.iuh.userservice.entities.Account;
import fit.iuh.userservice.enums.Role;
import fit.iuh.userservice.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Slf4j
public class ApplicationInitConfig {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Bean
    ApplicationRunner applicationRunner(AccountRepository accountRepository){
        return  args -> {
            if (!accountRepository.existsByUsername("admin")){
                Account account = Account.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ADMIN)
                        .build();
                accountRepository.save(account);
                log.warn("admin user has been created with username: admin and password: admin");
            }
        };
    }
}