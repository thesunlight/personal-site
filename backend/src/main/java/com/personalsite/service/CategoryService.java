package com.personalsite.service;

import com.personalsite.dto.CategoryDTO;
import com.personalsite.vo.CategoryVO;
import java.util.List;

public interface CategoryService {
    List<CategoryVO> getAllCategories();
    CategoryVO getCategoryBySlug(String slug);
    CategoryVO createCategory(CategoryDTO dto);
    CategoryVO updateCategory(Long id, CategoryDTO dto);
    void deleteCategory(Long id);
    int getTotalCount();
}
