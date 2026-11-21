package com.cloudcart.unified.security;

import com.cloudcart.common.constant.SecurityConstants;
import com.cloudcart.user.security.CustomUserDetailsService;
import com.cloudcart.user.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
public class UnifiedAuthHeaderFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = getJwtFromRequest(request);

        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromToken(token);
            Long userId = tokenProvider.getUserIdFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Wrap request to transparently forward X-User-Id, X-User-Email, X-User-Roles
            // to all downstream controllers that read @RequestHeader
            HttpServletRequest wrappedRequest = new HeaderMapRequestWrapper(request, userId, username, userDetails.getAuthorities().toString());
            filterChain.doFilter(wrappedRequest, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private static class HeaderMapRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> customHeaders = new HashMap<>();

        public HeaderMapRequestWrapper(HttpServletRequest request, Long userId, String email, String roles) {
            super(request);
            if (userId != null) {
                customHeaders.put(SecurityConstants.HEADER_USER_ID.toLowerCase(), String.valueOf(userId));
            }
            if (email != null) {
                customHeaders.put(SecurityConstants.HEADER_USER_EMAIL.toLowerCase(), email);
            }
            if (roles != null) {
                customHeaders.put(SecurityConstants.HEADER_USER_ROLES.toLowerCase(), roles);
            }
        }

        @Override
        public String getHeader(String name) {
            if (name != null) {
                String custom = customHeaders.get(name.toLowerCase());
                if (custom != null) {
                    return custom;
                }
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (name != null) {
                String custom = customHeaders.get(name.toLowerCase());
                if (custom != null) {
                    return Collections.enumeration(Collections.singletonList(custom));
                }
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            Set<String> names = new HashSet<>(customHeaders.keySet());
            Enumeration<String> parentNames = super.getHeaderNames();
            if (parentNames != null) {
                while (parentNames.hasMoreElements()) {
                    names.add(parentNames.nextElement());
                }
            }
            return Collections.enumeration(names);
        }
    }
}
