package com.kidstube.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Standard RFC 7807 Problem Details response representation.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        Instant timestamp,
        Map<String, String> validationErrors
) {
    public static ErrorResponse of(String title, int status, String detail, String instance) {
        return new ErrorResponse(
                "about:blank",
                title,
                status,
                detail,
                instance,
                Instant.now(),
                null
        );
    }

    public static ErrorResponse ofValidation(String title, int status, String detail, String instance, Map<String, String> validationErrors) {
        return new ErrorResponse(
                "about:blank",
                title,
                status,
                detail,
                instance,
                Instant.now(),
                validationErrors
        );
    }
}
