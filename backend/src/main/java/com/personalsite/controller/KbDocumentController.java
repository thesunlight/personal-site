package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.service.KbDocumentService;
import com.personalsite.vo.KbDocumentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kb/projects/{projectId}/documents")
@RequiredArgsConstructor
public class KbDocumentController {

    private final KbDocumentService documentService;

    @GetMapping("/tree")
    public Result<List<KbDocumentVO>> tree(@PathVariable Long projectId) {
        return Result.ok(documentService.getDocumentTree(projectId));
    }

    @GetMapping("/{slug}")
    public Result<KbDocumentVO> detail(@PathVariable Long projectId, @PathVariable String slug) {
        return Result.ok(documentService.getDocumentDetail(projectId, slug));
    }

    @PutMapping("/{id}/content")
    public Result<Void> updateContent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        documentService.updateDocumentContent(id, body.get("content"), body.get("contentZh"));
        return Result.ok();
    }

    @PostMapping("/{id}/translate")
    public Result<Void> translate(@PathVariable Long id) {
        documentService.translateDocument(id);
        return Result.ok();
    }

    @PostMapping("/translate-all")
    public Result<Void> translateAll(@PathVariable Long projectId) {
        documentService.translateAllDocuments(projectId);
        return Result.ok();
    }
}
