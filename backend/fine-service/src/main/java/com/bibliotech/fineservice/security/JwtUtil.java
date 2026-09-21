package com.bibliotech.fineservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

// This class only VALIDATES tokens (Fine Service does not issue tokens, only Auth Service does).
// jwt.secret here MUST be identical to the one in auth-service's application.properties.
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey key;

    private SecretKey getKey() {
        if (key == null) {
            key = Keys.hmacShaKeyFor(secret.getBytes());
        }
        return key;
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new java.util.Date())
                .setExpiration(new java.util.Date(System.currentTimeMillis() + 3600000))
                .signWith(getKey())
                .compact();
    }
}
