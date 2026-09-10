package com.personalsite.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("kb_translation")
public class KbTranslation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long documentId;
    private String model;
    private String status;
    private String errorMsg;
    private Integer tokenCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
