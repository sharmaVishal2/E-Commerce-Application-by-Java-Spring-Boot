package com.vishal.springecom.controller;

import com.vishal.springecom.dto.LoginRequest;
import com.vishal.springecom.dto.RegisterRequest;
import com.vishal.springecom.model.AppUser;
import com.vishal.springecom.security.TokenService;
import com.vishal.springecom.service.AppUserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthController(AppUserService appUserService, AuthenticationManager authenticationManager, TokenService tokenService) {
        this.appUserService = appUserService;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.username() == null || request.username().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username and password are required."
            ));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username().trim(), request.password())
            );
            String token = tokenService.createToken(authentication.getName(), authentication.getAuthorities());

            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "token", token,
                    "username", authentication.getName(),
                    "roles", authentication.getAuthorities().stream()
                            .map(authority -> authority.getAuthority())
                            .toList()
            ));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid username or password."
            ));
        }
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
