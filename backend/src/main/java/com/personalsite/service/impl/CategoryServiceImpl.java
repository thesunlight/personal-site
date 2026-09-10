package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.common.BusinessException;
import com.personalsite.dto.CategoryDTO;
import com.personalsite.entity.Category;
import com.personalsite.mapper.ArticleMapper;
import com.personalsite.mapper.CategoryMapper;
import com.personalsite.service.CategoryService;
import com.personalsite.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final ArticleMapper articleMapper;

    @Override
    public List<CategoryVO> getAllCategories() {
        List<Category> categories = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().orderByDesc(Category::getSortOrder));
        return categories.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public CategoryVO getCategoryBySlug(String slug) {
        Category category = categoryMapper.selectOne(
                new LambdaQueryWrapper<Category>().eq(Category::getSlug, slug));
        if (category == null) throw new BusinessException(404, "Category not found");
        return toVO(category);
    }

    @Override
    public CategoryVO createCategory(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        categoryMapper.insert(category);
        return toVO(category);
    }

    @Override
    public CategoryVO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryMapper.selectById(id);
        if (category == null) throw new BusinessException("Category not found");
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getSlug() != null) category.setSlug(dto.getSlug());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) category.setSortOrder(dto.getSortOrder());
        categoryMapper.updateById(category);
        return toVO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        int count = articleMapper.countByCategory(id);
        if (count > 0) throw new BusinessException("Cannot delete category with articles");
        categoryMapper.deleteById(id);
    }

    @Override
    public int getTotalCount() {
        return Math.toIntExact(categoryMapper.selectCount(null));
    }

    private CategoryVO toVO(Category c) {
        CategoryVO vo = new CategoryVO();
        vo.setId(c.getId());
        vo.setName(c.getName());
        vo.setSlug(c.getSlug());
        vo.setDescription(c.getDescription());
        vo.setSortOrder(c.getSortOrder());
        vo.setArticleCount(articleMapper.countByCategory(c.getId()));
        return vo;
    }
}
