package com.personalsite.vo;

import lombok.Data;

@Data
public class LoginVO {
    private String token;
    private AdminVO admin;
}
