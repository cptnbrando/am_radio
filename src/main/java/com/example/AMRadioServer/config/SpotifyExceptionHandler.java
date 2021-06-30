package com.example.AMRadioServer.config;

import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

//@ControllerAdvice
public class SpotifyExceptionHandler {

//    private static final String appURL = "http://localhost:4200";
//
//    @ExceptionHandler(SpotifyWebApiException.class)
//    public String redirect(SpotifyWebApiException e, RedirectAttributes redirectAttributes) {
//        redirectAttributes.addFlashAttribute("message", e.getCause().getMessage());
//        return "redirect:" + appURL;
//    }
}
