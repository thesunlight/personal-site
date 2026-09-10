package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.dto.CategoryDTO;
import com.personalsite.service.CategoryService;
import com.personalsite.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public Result<List<CategoryVO>> list() {
        return Result.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{slug}")
    public Result<CategoryVO> getBySlug(@PathVariable String slug) {
        return Result.ok(categoryService.getCategoryBySlug(slug));
    }

    @PostMapping
    public Result<CategoryVO> create(@Valid @RequestBody CategoryDTO dto) {
        return Result.ok(categoryService.createCategory(dto));
    }

    @PutMapping("/{id}")
    public Result<CategoryVO> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        return Result.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.ok();
    }
}
