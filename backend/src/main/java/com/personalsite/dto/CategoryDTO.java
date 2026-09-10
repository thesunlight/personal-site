package com.personalsite.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class CategoryDTO {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String description;
    private Integer sortOrder;
}
