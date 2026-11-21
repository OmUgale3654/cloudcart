package com.cloudcart.order.client;

import com.cloudcart.common.dto.payment.PaymentRequest;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.dto.payment.RefundRequest;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", contextId = "orderPaymentClient", url = "${payment.service.url:http://localhost:8085}")
public interface PaymentClient {

    @PostMapping("/api/v1/payments/charge")
    ApiResponse<PaymentResponse> charge(@RequestBody PaymentRequest request);

    @PostMapping("/api/v1/payments/refund")
    ApiResponse<PaymentResponse> refund(@RequestBody RefundRequest request);
}
