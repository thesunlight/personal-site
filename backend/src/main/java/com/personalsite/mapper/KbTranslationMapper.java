package com.personalsite.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personalsite.entity.KbTranslation;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface KbTranslationMapper extends BaseMapper<KbTranslation> {

    @Select("SELECT * FROM kb_translation WHERE document_id = #{documentId} ORDER BY created_at DESC LIMIT 1")
    KbTranslation selectLatestByDocumentId(@Param("documentId") Long documentId);
}
