package com.vishal.springecom.service;

import com.vishal.springecom.model.AppUser;
import com.vishal.springecom.model.AuthProvider;
import com.vishal.springecom.model.Role;
import com.vishal.springecom.repo.AppUserRepo;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AppUserService implements UserDetailsService {
    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepo appUserRepo, PasswordEncoder passwordEncoder) {
        this.appUserRepo = appUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }

    public boolean userExists(String username) {
        return appUserRepo.existsByUsername(username);
    }

    public AppUser registerUser(String username, String password) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.ROLE_USER);
        user.setAuthProvider(AuthProvider.LOCAL);
        return appUserRepo.save(user);
    }

    public AppUser registerOrUpdateOAuthUser(AuthProvider authProvider, String providerUserId, String username) {
        return appUserRepo.findByAuthProviderAndProviderUserId(authProvider, providerUserId)
                .or(() -> appUserRepo.findByUsername(username))
                .map(existingUser -> {
                    existingUser.setAuthProvider(authProvider);
                    existingUser.setProviderUserId(providerUserId);
                    return appUserRepo.save(existingUser);
                })
                .orElseGet(() -> {
                    AppUser user = new AppUser();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    user.setRole(Role.ROLE_USER);
                    user.setAuthProvider(authProvider);
                    user.setProviderUserId(providerUserId);
                    return appUserRepo.save(user);
                });
    }

}
