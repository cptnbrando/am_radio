package com.example.AMRadioServer.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

@Controller
public class RouteController {

    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect(HttpServletRequest request) {
        return "forward:/";
    }
}
