package com.klu.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Overdue management strictly for librarians
                .requestMatchers(HttpMethod.GET, "/loans/overdue").hasRole("LIBRARIAN")
                .requestMatchers(HttpMethod.POST, "/loans/overdue/notify").hasRole("LIBRARIAN")

                // Viewing all loans and deleting loans is restricted to librarians
                .requestMatchers(HttpMethod.GET, "/loans").hasRole("LIBRARIAN")
                .requestMatchers(HttpMethod.DELETE, "/loans/*").hasRole("LIBRARIAN")

                // Borrowing, returning, and checking individual loans available for students and librarians
                .requestMatchers(HttpMethod.POST, "/loans").hasAnyRole("STUDENT", "LIBRARIAN")
                .requestMatchers(HttpMethod.PUT, "/loans/*/return").hasAnyRole("STUDENT", "LIBRARIAN")
                .requestMatchers(HttpMethod.GET, "/loans/user/*", "/loans/book/*", "/loans/*").hasAnyRole("STUDENT", "LIBRARIAN")

                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
