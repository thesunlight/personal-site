package com.personalsite.service;

import com.personalsite.dto.LoginDTO;
import com.personalsite.dto.PasswordDTO;
import com.personalsite.vo.AdminVO;
import com.personalsite.vo.LoginVO;

public interface AuthService {
    LoginVO login(LoginDTO dto);
    AdminVO getCurrentAdmin(Long adminId);
    void changePassword(Long adminId, PasswordDTO dto);
}
