package com.personalsite.vo;

import lombok.Data;

@Data
public class CategoryVO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Integer sortOrder;
    private Integer articleCount;
}
