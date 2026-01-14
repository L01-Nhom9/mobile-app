package com.classtrack.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    // Test secret key (256 bits Base64 encoded)
    private static final String TEST_SECRET = "dGVzdHNlY3JldGtleWZvcmp3dHRva2VuZ2VuZXJhdGlvbjEyMzQ1Njc4OTA=";
    private static final long JWT_EXPIRATION = 3600000; // 1 hour
    private static final long REFRESH_EXPIRATION = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", JWT_EXPIRATION);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", REFRESH_EXPIRATION);

        userDetails = User.builder()
                .username("test@example.com")
                .password("password")
                .roles("USER")
                .build();
    }

    // ==================== TOKEN GENERATION ====================

    @Test
    void generateToken_ShouldCreateValidToken() {
        // When
        String token = jwtService.generateToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT có 3 phần
    }

    @Test
    void generateToken_WithExtraClaims_ShouldIncludeClaims() {
        // Given
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ADMIN");
        extraClaims.put("userId", 123L);

        // When
        String token = jwtService.generateToken(extraClaims, userDetails);

        // Then
        assertThat(token).isNotNull();

        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.get("role")).isEqualTo("ADMIN");
        assertThat(claims.get("userId")).isEqualTo(123);
    }

    @Test
    void generateRefreshToken_ShouldCreateToken() {
        // When
        String token = jwtService.generateRefreshToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    // ==================== TOKEN EXTRACTION ====================

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        String username = jwtService.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    void extractClaim_ShouldExtractIssuedAt() {
        // Given
        String token = jwtService.generateToken(userDetails);
        Date beforeGeneration = new Date(System.currentTimeMillis() - 1000);

        // When
        Date issuedAt = jwtService.extractClaim(token, Claims::getIssuedAt);

        // Then
        assertThat(issuedAt).isAfter(beforeGeneration);
        assertThat(issuedAt).isBefore(new Date(System.currentTimeMillis() + 1000));
    }

    @Test
    void extractClaim_ShouldExtractExpiration() {
        // Given
        String token = jwtService.generateToken(userDetails);
        Date expectedExpiration = new Date(System.currentTimeMillis() + JWT_EXPIRATION);

        // When
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);

        // Then
        assertThat(expiration).isCloseTo(expectedExpiration, 1000); // cho phép sai số 1s
    }

    // ==================== TOKEN VALIDATION ====================

    @Test
    void isTokenValid_ShouldReturnTrue_WhenTokenValidAndUserMatches() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenUsernameMismatch() {
        // Given
        String token = jwtService.generateToken(userDetails);

        UserDetails differentUser = User.builder()
                .username("other@example.com")
                .password("password")
                .roles("USER")
                .build();

        // When
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }



    // ==================== TOKEN EXPIRATION ====================

    @Test
    void generateRefreshToken_ShouldHaveLongerExpiration() {
        // Given
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // When
        Date accessExpiration = jwtService.extractClaim(accessToken, Claims::getExpiration);
        Date refreshExpiration = jwtService.extractClaim(refreshToken, Claims::getExpiration);

        // Then
        assertThat(refreshExpiration).isAfter(accessExpiration);
    }

    @Test
    void extractUsername_ShouldThrowException_WhenTokenExpired() {
        // Given
        JwtService shortExpirationService = new JwtService();
        ReflectionTestUtils.setField(shortExpirationService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(shortExpirationService, "jwtExpiration", -1000L);

        String expiredToken = shortExpirationService.generateToken(userDetails);

        // When & Then
        assertThatThrownBy(() -> jwtService.extractUsername(expiredToken))
                .isInstanceOf(ExpiredJwtException.class);
    }

    // ==================== INVALID TOKEN ====================

    @Test
    void extractUsername_ShouldThrowException_WhenTokenInvalid() {
        // Given
        String invalidToken = "invalid.token.here";

        // When & Then
        assertThatThrownBy(() -> jwtService.extractUsername(invalidToken))
                .isInstanceOf(Exception.class);
    }

    @Test
    void isTokenValid_ShouldThrowException_WhenTokenMalformed() {
        // Given
        String malformedToken = "not-a-valid-jwt-token";

        // When & Then
        assertThatThrownBy(() -> jwtService.isTokenValid(malformedToken, userDetails))
                .isInstanceOf(Exception.class);
    }

    // ==================== TOKEN STRUCTURE ====================

    @Test
    void generateToken_ShouldContainRequiredClaims() {
        // When
        String token = jwtService.generateToken(userDetails);

        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        // Then
        assertThat(claims.getSubject()).isEqualTo("test@example.com");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void generateToken_WithEmptyExtraClaims_ShouldStillWork() {
        // Given
        Map<String, Object> emptyClaims = new HashMap<>();

        // When
        String token = jwtService.generateToken(emptyClaims, userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(jwtService.extractUsername(token)).isEqualTo("test@example.com");
    }

    // Helper method
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(TEST_SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}