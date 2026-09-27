package com.kidstube.exception;

public class YoutubeFetchException extends RuntimeException {
    public YoutubeFetchException(String message) {
        super(message);
    }

    public YoutubeFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
