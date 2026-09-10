package com.personalsite.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalsite.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            // Public: all GET requests, login, sitemap
            .antMatchers(HttpMethod.GET, "/api/**").permitAll()
            .antMatchers("/api/auth/login").permitAll()
            .antMatchers("/sitemap.xml").permitAll()
            .antMatchers("/uploads/**").permitAll()
            // Admin: everything else under /api/
            .antMatchers("/api/**").authenticated()
            .anyRequest().permitAll()
            .and()
            .exceptionHandling()
            .authenticationEntryPoint((req, resp, ex) -> {
                resp.setContentType("application/json;charset=UTF-8");
                resp.setStatus(401);
                resp.getWriter().write(objectMapper.writeValueAsString(Result.error(401, "Unauthorized")));
            })
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
