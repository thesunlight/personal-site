package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.dto.TagDTO;
import com.personalsite.service.TagService;
import com.personalsite.vo.TagVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public Result<List<TagVO>> list() {
        return Result.ok(tagService.getAllTags());
    }

    @PostMapping
    public Result<TagVO> create(@Valid @RequestBody TagDTO dto) {
        return Result.ok(tagService.createTag(dto));
    }

    @PutMapping("/{id}")
    public Result<TagVO> update(@PathVariable Long id, @Valid @RequestBody TagDTO dto) {
        return Result.ok(tagService.updateTag(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        tagService.deleteTag(id);
        return Result.ok();
    }
}
