package com.classtrack.backend.utils;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FileDatabaseService {

    public FileData store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return null;
            }

            String originalFilename = file.getOriginalFilename();
            String contentType = file.getContentType();

            if (originalFilename == null || !originalFilename.matches(".*\\.(jpg|jpeg|png|pdf)$")) {
                throw new IllegalArgumentException("Chỉ chấp nhận file JPG, JPEG, PNG, PDF");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                throw new IllegalArgumentException("File quá lớn. Tối đa 5MB.");
            }

            byte[] bytes = file.getBytes();

            return new FileData(bytes, originalFilename, contentType);

        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc nội dung file", e);
        }
    }

    public record FileData(
            byte[] content,
            String fileName,
            String contentType
    ) {
    }
}