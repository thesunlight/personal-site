package com.personalsite.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("kb_document")
public class KbDocument {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String title;
    private String slug;
    private String path;
    private String content;
    private String contentZh;
    private String summary;
    private Long parentId;
    private Integer orderIndex;
    private String sourceUrl;
    private Integer wordCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
