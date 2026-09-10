package com.personalsite.dto;

import lombok.Data;
import java.util.List;

@Data
public class ArticleUpdateDTO {
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImage;
    private String sourceUrl;
    private String sourceName;
    private String sourceAuthor;
    private Long categoryId;
    private Integer status;
    private Integer isTop;
    private List<Long> tagIds;
}
