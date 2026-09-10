package com.personalsite.service.impl;

import com.personalsite.common.BusinessException;
import com.personalsite.service.UploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class UploadServiceImpl implements UploadService {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.upload.url-prefix}")
    private String urlPrefix;

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024;

    @Override
    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) throw new BusinessException("File is empty");
        if (file.getSize() > MAX_SIZE) throw new BusinessException("File size exceeds 5MB");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("Only jpg, png, webp images are allowed");
        }

        String ext = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fileName = UUID.randomUUID().toString() + ext;
        String relativePath = datePath + "/" + fileName;

        try {
            Path dir = Paths.get(uploadPath, datePath);
            Files.createDirectories(dir);
            Path target = dir.resolve(fileName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new BusinessException("Failed to save file: " + e.getMessage());
        }

        return urlPrefix + "/" + relativePath;
    }
}
