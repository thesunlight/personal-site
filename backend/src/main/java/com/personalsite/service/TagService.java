package com.personalsite.service;

import com.personalsite.dto.TagDTO;
import com.personalsite.vo.TagVO;
import java.util.List;

public interface TagService {
    List<TagVO> getAllTags();
    TagVO createTag(TagDTO dto);
    TagVO updateTag(Long id, TagDTO dto);
    void deleteTag(Long id);
    int getTotalCount();
}
