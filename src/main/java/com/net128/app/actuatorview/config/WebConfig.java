package com.net128.app.actuatorview.config;

import com.net128.app.actuatorview.logging.LogInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig  implements WebMvcConfigurer {

    final LogInterceptor logInterceptor;

    public WebConfig(final LogInterceptor logInterceptor) {
        this.logInterceptor = logInterceptor;
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(logInterceptor);
    }
}