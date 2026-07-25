package com.reader.Novel.Reader.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StatsPageController {

    @GetMapping("/stats")
    public String statsRedirect() {
        return "redirect:/stats/";
    }

    @GetMapping("/stats/")
    public String statsPage() {
        return "forward:/stats/index.html";
    }
}
