# Security Policy 🛡️

## Supported Versions

The following versions of **Yuki Tales** are currently supported with active security updates:

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 1.x     | :white_check_mark: | Latest release branch |
| < 1.0   | :x:                | Legacy / End-of-life |

---

## Reporting a Vulnerability

We take the security of **Yuki Tales** and our users very seriously. If you discover a potential security vulnerability, please report it responsibly rather than opening a public issue.

### How to Report

- **Email**: Send your findings to [sayan.002.majumder@gmail.com](mailto:sayan.002.majumder@gmail.com)
- **GitHub Advisory**: Alternatively, create a [Private Vulnerability Advisory](https://github.com/PartnerKiller/yuki-tales/security/advisories/new) directly on GitHub.

### What to Include

Please provide:
- A clear description of the vulnerability.
- Steps or a proof-of-concept (PoC) script to reproduce the issue.
- Impact assessment (e.g., unauthorized access, XSS, rate-limit bypass).

### Response SLA

- **Initial Response**: Within 24–48 hours.
- **Status Updates**: Periodic updates as the issue is investigated and patched.
- **Disclosure**: Public disclosure after a fix has been verified and deployed.

---

## Built-in Security Controls

Yuki Tales incorporates several multi-layered security protections:

- 🔒 **Password Security**: Strong password hashing using Spring Security `BCryptPasswordEncoder`.
- 🧹 **XSS Mitigation**: Strict HTML sanitization on all user-submitted content and chapter publishing via `jsoup`.
- 📁 **File Upload Defense**: Strict magic-bytes file signature validation on PNG, JPEG, GIF, and WEBP uploads to prevent web-shell execution.
- 🛡️ **Session Protection**: Spring Security filter chains with session fixation protection and CSRF safeguards.
- 🔑 **Role-Based Access Control**: Strict access boundaries separating Readers, Authors, Translators, Admins, and Owners.
