package com.nguyen_trong_nhat.you_and_i.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbidenException extends RuntimeException {
    public ForbidenException(String message) {
        super(message);
    }
}
