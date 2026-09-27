package com.kidstube.exception;

public class InvalidYoutubeUrlException extends RuntimeException {
    public InvalidYoutubeUrlException(String message) {
        super(message);
    }
}
