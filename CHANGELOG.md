# Changelog

All notable changes to the Consent-Aware HTTP Standards project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for draft revisions.

## [Unreleased]

### Added
- MAINTAINERS.md documenting project governance and maintainer responsibilities
- CHANGELOG.md for tracking project evolution
- CLAUDE.md for AI assistant context and project understanding
- RSR (Rhodium Standard Repository) compliance framework integration

### Changed
- Repository structure enhanced for standards development workflow

### Planned
- Complete AIBDP (AI Boundary Declaration Protocol) Internet-Draft specification
- Reference implementations (Node.js, Python, Rust)
- AIBDP manifest validator and JSON Schema
- Comprehensive server configuration guides (nginx, Apache, Caddy, Cloudflare Workers)
- .well-known/ directory examples demonstrating RFC 9116 security.txt integration

## [0.1.0] - 2025-07-20

### Added
- Initial repository structure
- `draft-jewell-http-430-consent-required-00.xml` - First complete draft of HTTP Status Code 430
- Core documentation framework:
  - `docs/explainer.md` - Architectural overview and cultural philosophy
  - `docs/technical.md` - Developer implementation guide
  - `docs/ethics.md` - Ethical and theoretical foundations
  - `docs/governance.md` - Organizational implications
  - `docs/start-here.md` - Quick adoption guide
  - `docs/conformance.md` - Implementation requirements
  - `docs/references.md` - Citations and influences
  - `docs/directory-structure.md` - Repository layout
  - `docs/example-aibdp.json` - Sample AIBDP manifest
- Community infrastructure:
  - `.github/CONTRIBUTING.md` - Contribution guidelines
  - `.github/SECURITY.md` - Security policy
  - `.github/CODE_OF_CONDUCT.md` - Community standards
  - `.github/PULL_REQUEST_TEMPLATE.md` - PR template
  - `.github/DISCUSSION_TEMPLATE.md` - Discussion template
- Outreach materials:
  - `assets/outreach/install-guidance.md` - Implementation guidance
  - `assets/outreach/disclosure-template-letter-*.md` - Stakeholder communication templates
  - `assets/outreach/org-list.md` - Target organizations for adoption
  - `assets/outreach/badge-announcement.md` - Community announcement template
- Asset resources:
  - `assets/badges/badge-description.md` - SVG badge usage guide
  - `assets/error-pages/disclaimer-block.md` - WCAG-compliant error page guidance
- Build tooling:
  - `scripts/build-drafts.ps1` - PowerShell script for xml2rfc rendering
  - `scripts/README-FIRST.md` - Build system documentation
- Licensing:
  - Dual MIT + CC BY-SA 4.0 licensing model
  - `LICENSE.md` with clear code/documentation separation

### Philosophy
- Established core principle: "Without refusal, permission is meaningless"
- Integrated cultural theory (bell hooks, Virginia Woolf, journalism ethics)
- Positioned protocol as pro-boundary, not anti-AI
- Emphasized declarative refusal as care and dignity

### Standards Position
- Prepared for IETF submission
- Aligned with RFC 7991 (xml2rfc v3) specification format
- Distinguished HTTP 430 from existing status codes (403, 428, 451)
- Designed for compatibility with federated and centralized architectures

## Version Numbering

Internet-Drafts follow IETF conventions:
- `draft-jewell-http-430-consent-required-NN` where NN is revision number (00, 01, 02...)
- `draft-jewell-aibdp-NN` for AIBDP protocol specification

Repository releases use semantic versioning:
- **MAJOR**: Fundamental protocol changes requiring broad adoption updates
- **MINOR**: New features, documentation expansions, additional examples
- **PATCH**: Bug fixes, typo corrections, clarifications

## Release Process

1. Update CHANGELOG.md with all changes since last release
2. Update version numbers in relevant Internet-Draft XML files
3. Generate rendered versions (HTML, PDF) via build scripts
4. Tag release: `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. Push tag: `git push origin vX.Y.Z`
6. Create GitHub Release with summary and links to rendered drafts
7. Announce in community channels (IndieWeb, Fediverse, mailing lists)

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for how to propose changes and additions to this project.

---

_"Boundary is where meaning begins." - bell hooks_
