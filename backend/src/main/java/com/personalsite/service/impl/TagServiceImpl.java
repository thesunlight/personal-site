package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.common.BusinessException;
import com.personalsite.dto.TagDTO;
import com.personalsite.entity.ArticleTag;
import com.personalsite.entity.Tag;
import com.personalsite.mapper.ArticleMapper;
import com.personalsite.mapper.ArticleTagMapper;
import com.personalsite.mapper.TagMapper;
import com.personalsite.service.TagService;
import com.personalsite.vo.TagVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;
    private final ArticleTagMapper articleTagMapper;
    private final ArticleMapper articleMapper;

    @Override
    public List<TagVO> getAllTags() {
        List<Tag> tags = tagMapper.selectList(
                new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getName));
        return tags.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public TagVO createTag(TagDTO dto) {
        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setSlug(dto.getSlug());
        tagMapper.insert(tag);
        return toVO(tag);
    }

    @Override
    public TagVO updateTag(Long id, TagDTO dto) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) throw new BusinessException("Tag not found");
        if (dto.getName() != null) tag.setName(dto.getName());
        if (dto.getSlug() != null) tag.setSlug(dto.getSlug());
        tagMapper.updateById(tag);
        return toVO(tag);
    }

    @Override
    public void deleteTag(Long id) {
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getTagId, id));
        tagMapper.deleteById(id);
    }

    @Override
    public int getTotalCount() {
        return Math.toIntExact(tagMapper.selectCount(null));
    }

    private TagVO toVO(Tag t) {
        TagVO vo = new TagVO();
        vo.setId(t.getId());
        vo.setName(t.getName());
        vo.setSlug(t.getSlug());
        vo.setArticleCount(articleMapper.countByTag(t.getId()));
        return vo;
    }
}
