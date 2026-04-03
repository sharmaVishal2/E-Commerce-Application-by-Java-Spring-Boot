package com.vishal.springecom.controller;

import com.vishal.springecom.dto.RegisterRequest;
import com.vishal.springecom.model.AppUser;
import com.vishal.springecom.service.AppUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserService appUserService;

    public AuthController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.username() == null || request.username().isBlank()
                || request.password() == null || request.password().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username is required and password must be at least 6 characters."
            ));
        }

        if (appUserService.userExists(request.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Username already exists."
            ));
        }

        AppUser savedUser = appUserService.registerUser(request.username().trim(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "username", savedUser.getUsername(),
                "role", savedUser.getRole().name()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.ok(Map.of(
                    "authenticated", false
            ));
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", authentication.getName(),
                "roles", authentication.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .toList()
        ));
    }
}
