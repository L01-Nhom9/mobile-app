
package com.classtrack.backend.service;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Component;

@Component
public class JoinCodeGenerator {

    public String generate() {
        return RandomStringUtils.randomAlphanumeric(8).toUpperCase();
    }
}