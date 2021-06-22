package com.example.AMRadioServer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

//@Configuration
//@EnableAsync
public class AsyncConfiguration {

    // Max number of asynchronous operations, right now there can only be 999 radios simultaneously (001 - 999)
    private final int POOL_SIZE = 5;
    private final int QUEUE_CAPACITY = 5;

    /**
     * Thread Executor for all radio threads, so they can loop and change tracks asynchronously
     * @return Executor object
     */
//    @Bean(name = "radioExecutor")
    public Executor radioExecutor() {
        final ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(this.POOL_SIZE);
        executor.setMaxPoolSize(this.POOL_SIZE);
        executor.setQueueCapacity(this.QUEUE_CAPACITY);
        executor.setThreadNamePrefix("RadioThread-");
        executor.initialize();
        return executor;
    }
}
