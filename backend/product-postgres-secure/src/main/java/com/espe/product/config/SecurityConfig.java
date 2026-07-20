package com.espe.product.config;

import org.springframework.security.config.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/swagger-ui.html", "/swagger-ui/**",
                        "/v3/api-docs/**", "/api/auth/register",
                        "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**")
                        .hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/productos/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/**").authenticated()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());

    return http.build();
}

}

