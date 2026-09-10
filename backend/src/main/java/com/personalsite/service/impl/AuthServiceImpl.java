package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.common.BusinessException;
import com.personalsite.dto.LoginDTO;
import com.personalsite.dto.PasswordDTO;
import com.personalsite.entity.Admin;
import com.personalsite.mapper.AdminMapper;
import com.personalsite.service.AuthService;
import com.personalsite.util.JwtUtil;
import com.personalsite.vo.AdminVO;
import com.personalsite.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminMapper adminMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginVO login(LoginDTO dto) {
        Admin admin = adminMapper.selectOne(
                new LambdaQueryWrapper<Admin>().eq(Admin::getUsername, dto.getUsername()));
        if (admin == null || !passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            throw new BusinessException(401, "Invalid username or password");
        }
        if (admin.getStatus() != 1) {
            throw new BusinessException(403, "Account is disabled");
        }
        String token = jwtUtil.generateToken(admin.getId(), admin.getUsername());
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setAdmin(toAdminVO(admin));
        return vo;
    }

    @Override
    public AdminVO getCurrentAdmin(Long adminId) {
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) throw new BusinessException("Admin not found");
        return toAdminVO(admin);
    }

    @Override
    public void changePassword(Long adminId, PasswordDTO dto) {
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) throw new BusinessException("Admin not found");
        if (!passwordEncoder.matches(dto.getOldPassword(), admin.getPassword())) {
            throw new BusinessException("Old password is incorrect");
        }
        admin.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        adminMapper.updateById(admin);
    }

    private AdminVO toAdminVO(Admin admin) {
        AdminVO vo = new AdminVO();
        vo.setId(admin.getId());
        vo.setUsername(admin.getUsername());
        vo.setNickname(admin.getNickname());
        vo.setAvatar(admin.getAvatar());
        vo.setEmail(admin.getEmail());
        return vo;
    }
}
