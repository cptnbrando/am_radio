package com.example.AMRadioServer.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

/**
 * Controller that routes all unknown paths back to the homepage, and proxies /app back to /
 */
@Controller
public class RouteController {

    @RequestMapping(value = "/{path:[^\\\\.]+}")
    public String redirect(HttpServletRequest request, @PathVariable String path) {
        if(System.getenv("SPRING_PROFILES_ACTIVE").equals("prod")) {
            return "forward:/";
        }
        else {
            return "";
        }
    }
}
