package com.personalsite.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalsite.service.DeepSeekTranslateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class DeepSeekTranslateServiceImpl implements DeepSeekTranslateService {

    @Value("${app.deepseek.api-key:}")
    private String apiKey;

    @Value("${app.deepseek.base-url:https://api.deepseek.com}")
    private String baseUrl;

    @Value("${app.deepseek.model:deepseek-chat}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String translate(String markdownContent, String targetLang) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("DeepSeek API key not configured, skipping translation");
            return null;
        }

        String prompt = String.format(
            "You are a professional technical translator. Translate the following Markdown document to %s. " +
            "Preserve all Markdown formatting, code blocks, links, and structure. " +
            "Only output the translated content, no explanations.\n\n%s",
            targetLang, markdownContent
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            String body = objectMapper.writeValueAsString(java.util.Map.of(
                "model", model,
                "messages", java.util.List.of(
                    java.util.Map.of("role", "system", "content", "You are a professional technical translator."),
                    java.util.Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3,
                "max_tokens", 4096
            ));

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                baseUrl + "/v1/chat/completions", HttpMethod.POST, entity, String.class
            );

            JsonNode result = objectMapper.readTree(resp.getBody());
            return result.at("/choices/0/message/content").asText();
        } catch (Exception e) {
            log.error("DeepSeek translation failed: {}", e.getMessage());
            return null;
        }
    }
}
