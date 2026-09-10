package com.personalsite.service;

import com.personalsite.vo.KbProjectVO;
import java.util.List;

public interface KbProjectService {
    List<KbProjectVO> getAllProjects();
    KbProjectVO getProjectBySlug(String slug);
    KbProjectVO createProject(String name, String githubRepo, String docsPath, String branch, String description);
    void deleteProject(Long id);
    int syncProjectFromGitHub(Long projectId);
}
