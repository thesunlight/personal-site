package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.common.BusinessException;
import com.personalsite.entity.KbDocument;
import com.personalsite.entity.KbProject;
import com.personalsite.mapper.KbDocumentMapper;
import com.personalsite.mapper.KbProjectMapper;
import com.personalsite.mapper.KbTranslationMapper;
import com.personalsite.service.KbProjectService;
import com.personalsite.util.GitHubContentFetcher;
import com.personalsite.vo.KbDocumentVO;
import com.personalsite.vo.KbProjectVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KbProjectServiceImpl implements KbProjectService {

    private final KbProjectMapper projectMapper;
    private final KbDocumentMapper documentMapper;
    private final KbTranslationMapper translationMapper;
    private final GitHubContentFetcher gitHubFetcher;

    @Override
    public List<KbProjectVO> getAllProjects() {
        List<KbProject> projects = projectMapper.selectList(
            new LambdaQueryWrapper<KbProject>().orderByDesc(KbProject::getCreatedAt));
        return projects.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public KbProjectVO getProjectBySlug(String slug) {
        KbProject project = projectMapper.selectOne(
            new LambdaQueryWrapper<KbProject>().eq(KbProject::getSlug, slug));
        if (project == null) throw new BusinessException(404, "Project not found");
        return toVO(project);
    }

    @Override
    @Transactional
    public KbProjectVO createProject(String name, String githubRepo, String docsPath, String branch, String description) {
        KbProject project = new KbProject();
        project.setName(name);
        project.setSlug(name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", ""));
        project.setGithubRepo(githubRepo);
        project.setDocsPath(docsPath != null ? docsPath : "docs/");
        project.setBranch(branch != null ? branch : "main");
        project.setDescription(description);
        project.setDocCount(0);
        projectMapper.insert(project);
        return toVO(project);
    }

    @Override
    public void deleteProject(Long id) {
        projectMapper.deleteById(id);
    }

    @Override
    @Transactional
    public int syncProjectFromGitHub(Long projectId) {
        KbProject project = projectMapper.selectById(projectId);
        if (project == null) throw new BusinessException("Project not found");

        String repo = project.getGithubRepo();
        String docsPath = project.getDocsPath();
        String branch = project.getBranch();

        log.info("Syncing project {} from GitHub: {}/{}/{}", project.getName(), repo, docsPath, branch);

        List<GitHubContentFetcher.DocFile> tree = gitHubFetcher.getDocTree(repo, docsPath, branch);
        int count = saveDocTree(projectId, tree, null, 0);

        project.setDocCount(count);
        projectMapper.updateById(project);

        log.info("Synced {} documents for project {}", count, project.getName());
        return count;
    }

    private int saveDocTree(Long projectId, List<GitHubContentFetcher.DocFile> files, Long parentId, int order) {
        int count = 0;
        for (GitHubContentFetcher.DocFile file : files) {
            if (file.children != null && !file.children.isEmpty()) {
                // This is a directory - save as parent doc
                KbDocument doc = new KbDocument();
                doc.setProjectId(projectId);
                doc.setTitle(file.name);
                doc.setSlug(generateSlug(file.name));
                doc.setPath(file.path);
                doc.setParentId(parentId);
                doc.setOrderIndex(order++);
                documentMapper.insert(doc);
                count += saveDocTree(projectId, file.children, doc.getId(), 0);
            } else {
                // This is a file - fetch content from GitHub
                KbDocument doc = new KbDocument();
                doc.setProjectId(projectId);
                String title = file.name.replace(".md", "").replaceAll("[-_]", " ");
                title = Character.toUpperCase(title.charAt(0)) + title.substring(1);
                doc.setTitle(title);
                doc.setSlug(generateSlug(file.name.replace(".md", "")));
                doc.setPath(file.path);
                doc.setParentId(parentId);
                doc.setOrderIndex(order++);

                // Fetch content from GitHub
                if (file.content != null) {
                    doc.setContent(file.content);
                } else {
                    // Content not pre-fetched, will be fetched lazily on detail view
                }

                documentMapper.insert(doc);
                count++;
            }
        }
        return count;
    }

    private String generateSlug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private KbProjectVO toVO(KbProject p) {
        KbProjectVO vo = new KbProjectVO();
        vo.setId(p.getId()); vo.setName(p.getName()); vo.setSlug(p.getSlug());
        vo.setGithubRepo(p.getGithubRepo()); vo.setDescription(p.getDescription());
        vo.setLogoUrl(p.getLogoUrl()); vo.setSourceUrl(p.getSourceUrl());
        vo.setDocCount(p.getDocCount()); vo.setCreatedAt(p.getCreatedAt());
        vo.setUpdatedAt(p.getUpdatedAt());
        return vo;
    }
}
