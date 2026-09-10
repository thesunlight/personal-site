package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.dto.LoginDTO;
import com.personalsite.dto.PasswordDTO;
import com.personalsite.service.AuthService;
import com.personalsite.vo.AdminVO;
import com.personalsite.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public Result<AdminVO> me(Authentication auth) {
        Long adminId = (Long) auth.getPrincipal();
        return Result.ok(authService.getCurrentAdmin(adminId));
    }

    @PutMapping("/password")
    public Result<Void> changePassword(Authentication auth, @Valid @RequestBody PasswordDTO dto) {
        Long adminId = (Long) auth.getPrincipal();
        authService.changePassword(adminId, dto);
        return Result.ok();
    }
}
