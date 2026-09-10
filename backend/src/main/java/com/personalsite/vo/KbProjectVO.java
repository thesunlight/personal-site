package com.personalsite.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class KbProjectVO {
    private Long id;
    private String name;
    private String slug;
    private String githubRepo;
    private String description;
    private String logoUrl;
    private String sourceUrl;
    private Integer docCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
