package com.personalsite.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class KbDocumentVO {
    private Long id;
    private Long projectId;
    private String title;
    private String slug;
    private String path;
    private String summary;
    private Long parentId;
    private Integer orderIndex;
    private String sourceUrl;
    private Integer wordCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // For tree structure
    private List<KbDocumentVO> children;
}
