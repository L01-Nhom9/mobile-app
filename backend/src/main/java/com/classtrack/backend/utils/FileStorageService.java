package com.classtrack.backend.utils;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads/evidence");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            // Validate định dạng: chỉ ảnh/PDF
            if (!filename.matches(".*\\.(jpg|jpeg|png|pdf)$")) {
                throw new RuntimeException("Invalid file type. Only JPG, JPEG, PNG, PDF allowed.");
            }
            // Validate dung lượng: max 5MB
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File too large. Max 5MB.");
            }
            Path destinationFile = this.rootLocation.resolve(filename).normalize().toAbsolutePath();
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return destinationFile.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}