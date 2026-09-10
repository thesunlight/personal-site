package com.personalsite.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("kb_project")
public class KbProject {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String slug;
    private String githubRepo;
    private String docsPath;
    private String branch;
    private String description;
    private String logoUrl;
    private String sourceUrl;
    private Integer docCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
