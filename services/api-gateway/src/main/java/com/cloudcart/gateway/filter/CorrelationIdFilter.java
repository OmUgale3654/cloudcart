package com.cloudcart.gateway.filter;

import com.cloudcart.common.constant.SecurityConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = request.getHeaders().getFirst(SecurityConstants.HEADER_CORRELATION_ID);

        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
            log.debug("Generated new Correlation-ID: {} for path: {}", correlationId, request.getURI().getPath());
        }

        final String finalCorrelationId = correlationId;

        // Mutate request with correlation ID downstream
        ServerHttpRequest mutatedRequest = request.mutate()
                .header(SecurityConstants.HEADER_CORRELATION_ID, finalCorrelationId)
                .build();

        // Mutate response to include correlation ID back to caller
        exchange.getResponse().getHeaders().add(SecurityConstants.HEADER_CORRELATION_ID, finalCorrelationId);

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        // Highest precedence so correlation ID is assigned before any other filters
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
