package com.reader.Novel.Reader.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SubdomainRoutingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            String host = httpRequest.getHeader("Host");
            String uri = httpRequest.getRequestURI();

            if (host != null && host.toLowerCase().startsWith("stats.")) {
                if (uri.equals("/") || uri.equals("/index.html")) {
                    request.getRequestDispatcher("/stats/").forward(request, response);
                    return;
                } else if (!uri.startsWith("/stats/") && !uri.startsWith("/api/")) {
                    request.getRequestDispatcher("/stats" + uri).forward(request, response);
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void destroy() {}
}
