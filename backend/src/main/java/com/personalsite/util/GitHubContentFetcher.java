package com.personalsite.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Slf4j
@Component
public class GitHubContentFetcher {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class DocFile {
        public String name;
        public String path;
        public String content;
        public String sha;
        public List<DocFile> children = new ArrayList<>();
    }

    public List<DocFile> getDocTree(String repo, String path, String branch) {
        String url = String.format("https://api.github.com/repos/%s/contents/%s?ref=%s", repo, path, branch);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");
            headers.set("User-Agent", "personal-site-kb");
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode tree = objectMapper.readTree(resp.getBody());
            List<DocFile> files = new ArrayList<>();
            for (JsonNode node : tree) {
                String type = node.get("type").asText();
                String name = node.get("name").asText();
                String filePath = node.get("path").asText();
                if ("file".equals(type) && name.endsWith(".md")) {
                    DocFile f = new DocFile();
                    f.name = name; f.path = filePath; f.sha = node.get("sha").asText();
                    files.add(f);
                } else if ("dir".equals(type)) {
                    DocFile d = new DocFile();
                    d.name = name; d.path = filePath;
                    d.children = getDocTree(repo, filePath, branch);
                    if (!d.children.isEmpty()) files.add(d);
                }
            }
            return files;
        } catch (Exception e) {
            log.error("Failed to fetch GitHub tree: {}/{}/{}: {}", repo, path, branch, e.getMessage());
            return Collections.emptyList();
        }
    }

    public String getFileContent(String repo, String path, String branch) {
        String url = String.format("https://api.github.com/repos/%s/contents/%s?ref=%s", repo, path, branch);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");
            headers.set("User-Agent", "personal-site-kb");
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode node = objectMapper.readTree(resp.getBody());
            String encoded = node.get("content").asText();
            return new String(Base64.getDecoder().decode(encoded.replace("\n", "")), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to fetch GitHub file: {}/{}: {}", repo, path, e.getMessage());
            return null;
        }
    }
}
