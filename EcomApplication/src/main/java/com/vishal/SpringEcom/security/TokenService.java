package com.vishal.springecom.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Collection;
import java.util.List;

@Service
public class TokenService {
    private final String secret;
    private final long expirationMs;

    public TokenService(
            @Value("${app.auth.token-secret}") String secret,
            @Value("${app.auth.token-expiration-ms:604800000}") long expirationMs
    ) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    public String createToken(String username, Collection<? extends GrantedAuthority> authorities) {
        long expiresAt = Instant.now().toEpochMilli() + expirationMs;
        String roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .reduce((left, right) -> left + "," + right)
                .orElse("");
        String payload = username + "|" + roles + "|" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(hmacSha256(encodedPayload));
        return encodedPayload + "." + signature;
    }

    public boolean isValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                return false;
            }

            String expectedSignature = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(hmacSha256(parts[0]));
            if (!expectedSignature.equals(parts[1])) {
                return false;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split("\\|", 3);
            if (payloadParts.length != 3) {
                return false;
            }

            long expiresAt = Long.parseLong(payloadParts[2]);
            return expiresAt > Instant.now().toEpochMilli();
        } catch (Exception exception) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractPayloadPart(token, 0);
    }

    public List<String> extractRoles(String token) {
        String roles = extractPayloadPart(token, 1);
        if (roles == null || roles.isBlank()) {
            return List.of();
        }
        return List.of(roles.split(","));
    }

    private String extractPayloadPart(String token, int index) {
        try {
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split("\\|", 3);
            return payloadParts[index];
        } catch (Exception exception) {
            return null;
        }
    }

    private byte[] hmacSha256(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign token", exception);
        }
    }
}
