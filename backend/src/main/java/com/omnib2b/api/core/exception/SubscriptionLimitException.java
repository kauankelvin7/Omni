package com.omnib2b.api.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class SubscriptionLimitException extends RuntimeException {
    public SubscriptionLimitException(String message) {
        super(message);
    }
}
