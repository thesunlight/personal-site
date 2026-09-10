package com.personalsite.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class ArticleCreateDTO {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Slug is required")
    private String slug;
    private String summary;
    @NotBlank(message = "Content is required")
    private String content;
    private String coverImage;
    private String sourceUrl;
    private String sourceName;
    private String sourceAuthor;
    @NotNull(message = "Category is required")
    private Long categoryId;
    private Integer status;
    private Integer isTop;
    private List<Long> tagIds;
}
