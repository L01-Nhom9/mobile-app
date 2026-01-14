package com.classtrack.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(title = "Jira Clone API", version = "v1"),
    servers = {
        @Server(url = "/", description = "Default Server URL"),
        @Server(url = "/api/java", description = "Gateway Default Server URL")
    }
)
@SecurityScheme(
    name = "bearerAuth",            // Tên định danh (dùng để gọi trong Controller)
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"               // Quan trọng: Báo cho Swagger biết cần prefix "Bearer"
)
public class OpenApiConfig {
    // Không cần code gì bên trong
}
