package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.common.BusinessException;
import com.personalsite.entity.KbDocument;
import com.personalsite.entity.KbProject;
import com.personalsite.entity.KbTranslation;
import com.personalsite.mapper.KbDocumentMapper;
import com.personalsite.mapper.KbProjectMapper;
import com.personalsite.mapper.KbTranslationMapper;
import com.personalsite.service.DeepSeekTranslateService;
import com.personalsite.service.KbDocumentService;
import com.personalsite.util.GitHubContentFetcher;
import com.personalsite.vo.KbDocumentVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KbDocumentServiceImpl implements KbDocumentService {

    private final KbDocumentMapper documentMapper;
    private final KbProjectMapper projectMapper;
    private final KbTranslationMapper translationMapper;
    private final DeepSeekTranslateService translateService;
    private final GitHubContentFetcher gitHubFetcher;

    @Override
    public List<KbDocumentVO> getDocumentTree(Long projectId) {
        List<KbDocument> docs = documentMapper.selectByProjectId(projectId);
        return buildTree(docs, null);
    }

    @Override
    public KbDocumentVO getDocumentDetail(Long projectId, String slug) {
        KbDocument doc = documentMapper.selectByProjectAndSlug(projectId, slug);
        if (doc == null) throw new BusinessException(404, "Document not found");

        // Fetch content from GitHub if not stored
        if (doc.getContent() == null && doc.getPath() != null) {
            KbProject project = projectMapper.selectById(projectId);
            if (project != null && project.getGithubRepo() != null) {
                String repo = normalizeGithubRepo(project.getGithubRepo());
                String content = gitHubFetcher.getFileContent(repo, doc.getPath(), project.getBranch());
                if (content != null) {
                    doc.setContent(content);
                    doc.setWordCount(content.length());
                    documentMapper.updateById(doc);
                }
            }
        }

        return toVO(doc);
    }

    @Override
    public void updateDocumentContent(Long documentId, String content, String contentZh) {
        KbDocument doc = documentMapper.selectById(documentId);
        if (doc == null) throw new BusinessException("Document not found");
        if (content != null) { doc.setContent(content); doc.setWordCount(content.length()); }
        if (contentZh != null) doc.setContentZh(contentZh);
        documentMapper.updateById(doc);
    }

    @Override
    @Transactional
    public void translateDocument(Long documentId) {
        KbDocument doc = documentMapper.selectById(documentId);
        if (doc == null || doc.getContent() == null) throw new BusinessException("Document or content not found");

        KbTranslation trans = new KbTranslation();
        trans.setDocumentId(documentId);
        trans.setModel("deepseek-chat");
        trans.setStatus("translating");
        translationMapper.insert(trans);

        try {
            String translated = translateService.translate(doc.getContent(), "Chinese");
            if (translated != null) {
                doc.setContentZh(translated);
                documentMapper.updateById(doc);
                trans.setStatus("done");
                trans.setCompletedAt(LocalDateTime.now());
            } else {
                trans.setStatus("failed");
                trans.setErrorMsg("Translation returned null");
            }
        } catch (Exception e) {
            trans.setStatus("failed");
            trans.setErrorMsg(e.getMessage());
            log.error("Translation failed for doc {}: {}", documentId, e.getMessage());
        }
        translationMapper.updateById(trans);
    }

    @Override
    public void translateAllDocuments(Long projectId) {
        List<KbDocument> docs = documentMapper.selectByProjectId(projectId);
        for (KbDocument doc : docs) {
            if (doc.getContent() != null && doc.getContentZh() == null) {
                translateDocument(doc.getId());
            }
        }
    }

    private List<KbDocumentVO> buildTree(List<KbDocument> docs, Long parentId) {
        return docs.stream()
            .filter(d -> Objects.equals(d.getParentId(), parentId))
            .map(d -> {
                KbDocumentVO vo = toVO(d);
                vo.setChildren(buildTree(docs, d.getId()));
                return vo;
            })
            .collect(Collectors.toList());
    }

    private KbDocumentVO toVO(KbDocument d) {
        KbDocumentVO vo = new KbDocumentVO();
        vo.setId(d.getId()); vo.setProjectId(d.getProjectId()); vo.setTitle(d.getTitle());
        vo.setSlug(d.getSlug()); vo.setPath(d.getPath());
        vo.setContent(d.getContent()); vo.setContentZh(d.getContentZh());
        vo.setSummary(d.getSummary());
        vo.setParentId(d.getParentId()); vo.setOrderIndex(d.getOrderIndex());
        vo.setSourceUrl(d.getSourceUrl()); vo.setWordCount(d.getWordCount());
        vo.setCreatedAt(d.getCreatedAt()); vo.setUpdatedAt(d.getUpdatedAt());
        return vo;
    }

    /**
     * Normalize GitHub repo string to "owner/repo" format.
     */
    private String normalizeGithubRepo(String repo) {
        if (repo == null) return null;
        repo = repo.replaceAll("\\.git$", "");
        if (repo.contains("github.com")) {
            String[] parts = repo.split("github\\.com/");
            if (parts.length > 1) return parts[1];
        }
        return repo;
    }
}
