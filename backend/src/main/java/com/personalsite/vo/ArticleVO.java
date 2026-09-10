package com.personalsite.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleVO {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String coverImage;
    private String sourceUrl;
    private String sourceName;
    private Integer status;
    private Integer isTop;
    private Integer viewCount;
    private Integer wordCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private String categoryName;
    private String categorySlug;
    private List<TagVO> tags;
}
