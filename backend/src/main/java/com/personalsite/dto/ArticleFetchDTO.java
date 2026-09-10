package com.personalsite.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class ArticleFetchDTO {
    @NotBlank(message = "URL is required")
    private String url;
    private Long categoryId;
    private Integer status;
}
