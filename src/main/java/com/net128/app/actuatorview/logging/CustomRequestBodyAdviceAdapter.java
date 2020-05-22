package com.net128.app.actuatorview.logging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Type;

@ControllerAdvice
public class CustomRequestBodyAdviceAdapter extends RequestBodyAdviceAdapter {
    final LoggingService loggingService;
    final HttpServletRequest httpServletRequest;

    public CustomRequestBodyAdviceAdapter(LoggingService loggingService, HttpServletRequest httpServletRequest) {
        this.loggingService = loggingService;
        this.httpServletRequest = httpServletRequest;
    }
    
    @Override
    public boolean supports(MethodParameter methodParameter, Type type,
                            Class<? extends HttpMessageConverter<?>> aClass) {
        return true;
    }
    
    @Override
    public Object afterBodyRead(Object body, HttpInputMessage inputMessage,
                                MethodParameter parameter, Type targetType,
            Class<? extends HttpMessageConverter<?>> converterType) {
        loggingService.logRequest(httpServletRequest, body);
        return super.afterBodyRead(body, inputMessage, parameter, targetType, converterType);
    }
}