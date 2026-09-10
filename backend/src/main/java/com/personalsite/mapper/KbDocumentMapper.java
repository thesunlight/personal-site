package com.personalsite.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personalsite.entity.KbDocument;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

public interface KbDocumentMapper extends BaseMapper<KbDocument> {

    @Select("SELECT * FROM kb_document WHERE project_id = #{projectId} AND slug = #{slug}")
    KbDocument selectByProjectAndSlug(@Param("projectId") Long projectId, @Param("slug") String slug);

    @Select("SELECT * FROM kb_document WHERE project_id = #{projectId} ORDER BY order_index ASC, id ASC")
    List<KbDocument> selectByProjectId(@Param("projectId") Long projectId);

    @Select("SELECT * FROM kb_document WHERE project_id = #{projectId} AND parent_id IS NULL ORDER BY order_index ASC, id ASC")
    List<KbDocument> selectRootDocuments(@Param("projectId") Long projectId);

    @Select("SELECT * FROM kb_document WHERE parent_id = #{parentId} ORDER BY order_index ASC, id ASC")
    List<KbDocument> selectByParentId(@Param("parentId") Long parentId);
}
