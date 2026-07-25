package com.reader.Novel.Reader.controller;

import com.reader.Novel.Reader.model.User;
import com.reader.Novel.Reader.repository.UserRepository;
import com.reader.Novel.Reader.util.PasswordUtils;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class StatsPageController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public String statsRedirect() {
        return "redirect:/stats/";
    }

    @GetMapping("/stats/")
    public String statsPage(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null && ("ADMIN".equals(user.getUser_type()) || "OWNER".equals(user.getUser_type()))) {
            return "stats/index";
        }
        return "stats/login";
    }

    @PostMapping("/stats/login")
    public String statsLogin(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            HttpSession session,
            Model model) {
        
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            model.addAttribute("error", "Username/Email and password are required.");
            return "stats/login";
        }

        String input = username.trim();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(input);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(input);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (PasswordUtils.checkPassword(password, user.getPassword())) {
                String role = user.getUser_type();
                if ("ADMIN".equals(role) || "OWNER".equals(role)) {
                    session.setAttribute("user", user);
                    return "redirect:/stats/";
                } else {
                    model.addAttribute("error", "Access denied. Only administrators and owners can access the statistics portal.");
                    return "stats/login";
                }
            }
        }

        model.addAttribute("error", "Invalid username/email or password.");
        return "stats/login";
    }

    @GetMapping("/stats/logout")
    public String statsLogout(HttpSession session) {
        session.invalidate();
        return "redirect:/stats/";
    }
}
