package com.net128.app.actuatorview.actuator;

import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
@Endpoint(id="env-summary")
public class EnvironmentSummaryActuator {
    final private Environment environment;

    private Map<String, String> cachedProperties;

    public EnvironmentSummaryActuator(Environment environment) {
        this.environment = environment;
    }

    @ReadOperation
    public EnvironmentSummaryInfo getEnvironmentSummaryInfo() {
        return new EnvironmentSummaryInfo(cachedProperties);
    }

    @EventListener({ApplicationReadyEvent.class, ContextRefreshedEvent.class})
    public void init(ApplicationEvent event) {
        if(!(event instanceof ApplicationReadyEvent) && cachedProperties==null) {
            return;
        }
        cachedProperties=getAllProperties();
    }

    private Map<String, String> getAllProperties() {
        //noinspection rawtypes
        return StreamSupport.stream(((AbstractEnvironment) environment)
            .getPropertySources().spliterator(), false)
            .filter(ps -> ps instanceof EnumerablePropertySource)
            .map(ps -> ((EnumerablePropertySource) ps).getPropertyNames())
            .flatMap(Arrays::<String>stream).collect(Collectors.toMap(
                propName -> propName, propName -> environment.getProperty(propName)+"",
                    (a, b) -> b, TreeMap::new));
    }

    private String getPropertySafely(Environment environment, String name) {
        String value;
        try {
            value = environment.getProperty(name);
        } catch(Exception e) {
            value = String.format("Unable to resolve property %s. Reason: %s", name, e.getMessage());
            e.printStackTrace();
        }
        return value;
    }

    public static class EnvironmentSummaryInfo {
        public Map<String, String> resolvedProperties;
        public EnvironmentSummaryInfo(Map<String, String> properties) {
            this.resolvedProperties = properties;
        }
    }
}
