package com.vishal.springecom.config;

import com.vishal.springecom.model.AuthProvider;
import com.vishal.springecom.security.TokenService;
import com.vishal.springecom.service.AppUserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AppUserService appUserService;
    private final TokenService tokenService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(AppUserService appUserService, TokenService tokenService) {
        this.appUserService = appUserService;
        this.tokenService = tokenService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauthUser = oauthToken.getPrincipal();
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();

        AuthProvider authProvider = "github".equalsIgnoreCase(registrationId)
                ? AuthProvider.GITHUB
                : AuthProvider.GOOGLE;

        String providerUserId = oauthUser.getName();
        String username = resolveUsername(authProvider, oauthUser);

        var user = appUserService.registerOrUpdateOAuthUser(authProvider, providerUserId, username);
        String token = tokenService.createToken(user.getUsername(), authentication.getAuthorities());

        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth/callback?token=" + token);
    }

    private String resolveUsername(AuthProvider authProvider, OAuth2User oauthUser) {
        if (authProvider == AuthProvider.GITHUB) {
            Object login = oauthUser.getAttributes().get("login");
            if (login != null) {
                return login.toString();
            }
        }

        Object email = oauthUser.getAttributes().get("email");
        if (email != null) {
            return email.toString();
        }

        Object name = oauthUser.getAttributes().get("name");
        if (name != null) {
            return name.toString().replace(" ", "").toLowerCase();
        }

        return authProvider.name().toLowerCase() + "_" + oauthUser.getName();
    }
}
