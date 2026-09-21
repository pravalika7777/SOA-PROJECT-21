package com.bibliotech.authservice.controller;

import com.bibliotech.authservice.dto.AuthResponse;
import com.bibliotech.authservice.dto.LoginRequest;
import com.bibliotech.authservice.dto.RegisterRequest;
import com.bibliotech.authservice.model.Role;
import com.bibliotech.authservice.model.User;
import com.bibliotech.authservice.repository.UserRepository;
import com.bibliotech.authservice.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    AuthController(UserRepository userRepository, 
                   PasswordEncoder passwordEncoder, 
                   JwtUtil jwtUtil, 
                   @Autowired(required = false) org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        Role role = request.getRole() == null ? Role.STUDENT : request.getRole();
        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                role
        );
        user = userRepository.save(user);

        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.update(
                    "INSERT INTO users (user_id, email, name) VALUES (?, ?, ?) ON CONFLICT (user_id) DO NOTHING",
                    user.getUserId(),
                    user.getUsername(),
                    user.getUsername()
                );
                jdbcTemplate.execute("SELECT setval('users_user_id_seq', (SELECT GREATEST(MAX(user_id), 1) FROM users))");
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUserId(), user.getUsername(), user.getRole().name()));
    }
}
