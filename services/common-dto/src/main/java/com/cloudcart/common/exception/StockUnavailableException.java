package com.cloudcart.common.exception;

import org.springframework.http.HttpStatus;

public class StockUnavailableException extends ApiException {
    public StockUnavailableException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
