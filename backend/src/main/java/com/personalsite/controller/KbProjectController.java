package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.service.KbProjectService;
import com.personalsite.vo.KbProjectVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kb/projects")
@RequiredArgsConstructor
public class KbProjectController {

    private final KbProjectService projectService;

    @GetMapping
    public Result<List<KbProjectVO>> list() {
        return Result.ok(projectService.getAllProjects());
    }

    @GetMapping("/{slug}")
    public Result<KbProjectVO> getBySlug(@PathVariable String slug) {
        return Result.ok(projectService.getProjectBySlug(slug));
    }

    @PostMapping
    public Result<KbProjectVO> create(@RequestBody Map<String, String> body) {
        return Result.ok(projectService.createProject(
            body.get("name"), body.get("githubRepo"), body.get("docsPath"),
            body.get("branch"), body.get("description")));
    }

    @PostMapping("/{id}/sync")
    public Result<Map<String, Object>> sync(@PathVariable Long id) {
        int count = projectService.syncProjectFromGitHub(id);
        return Result.ok(Map.of("synced", count));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return Result.ok();
    }
}
