{
  description = "Consent-Aware HTTP Standards - HTTP 430 + AIBDP Protocol Specifications";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Python environment with xml2rfc for rendering Internet-Drafts
        pythonEnv = pkgs.python3.withPackages (ps: with ps; [
          # xml2rfc for rendering Internet-Draft XML to text/HTML/PDF
          # Note: xml2rfc may not be in nixpkgs, use pip fallback in devShell
          pip
          setuptools
          wheel
        ]);

        # Development tools
        devTools = with pkgs; [
          # Core tools
          just              # Command runner (justfile)
          jq                # JSON validation and formatting
          git               # Version control

          # Internet-Draft tooling
          pythonEnv         # Python for xml2rfc

          # Optional but useful
          nodePackages.markdown-link-check  # Link validation
          watchexec         # Auto-run commands on file changes

          # Text processing
          ripgrep           # Fast grep alternative
          fd                # Fast find alternative

          # Linting/validation
          yamllint          # YAML validation (for CI configs)
          shellcheck        # Shell script linting
        ];

      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = devTools;

          shellHook = ''
            echo "🛠️  Consent-Aware HTTP Standards - Development Environment"
            echo ""
            echo "📄 Internet-Drafts:"
            echo "   • HTTP 430 Consent Required"
            echo "   • AIBDP (AI Boundary Declaration Protocol)"
            echo ""
            echo "🔧 Available tools:"
            echo "   • just         - Command runner (try: just --list)"
            echo "   • jq           - JSON validation"
            echo "   • xml2rfc      - Draft rendering (install: pip install xml2rfc)"
            echo "   • watchexec    - Auto-validation (try: just watch)"
            echo ""
            echo "🚀 Quick start:"
            echo "   just validate       Validate all manifests and drafts"
            echo "   just check-rsr      Check RSR compliance"
            echo "   just build-drafts   Render Internet-Drafts"
            echo "   just status         Show project status"
            echo ""
            echo "📦 Install Python dependencies:"
            echo "   pip install xml2rfc weasyprint"
            echo ""

            # Check if xml2rfc is installed
            if ! command -v xml2rfc &> /dev/null; then
              echo "⚠️  xml2rfc not found. Install with: pip install xml2rfc"
            fi

            # Show RSR compliance status
            if command -v just &> /dev/null; then
              echo "📊 RSR Compliance Status:"
              just check-rsr 2>&1 | tail -6 || true
            fi

            echo ""
          '';
        };

        # Package the documentation and specifications
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "consent-aware-http-standards";
          version = "0.1.0";

          src = ./.;

          buildInputs = [ pkgs.jq ];

          buildPhase = ''
            # Validate all JSON manifests
            find . -name "*.json" ! -path "./node_modules/*" ! -path "./.git/*" -exec jq empty {} \;
            echo "✅ All JSON manifests validated"
          '';

          installPhase = ''
            mkdir -p $out/share/doc/consent-aware-http

            # Copy specifications
            cp -r drafts $out/share/doc/consent-aware-http/
            cp draft-*.xml $out/share/doc/consent-aware-http/ || true

            # Copy documentation
            cp -r docs $out/share/doc/consent-aware-http/
            cp -r assets $out/share/doc/consent-aware-http/
            cp -r .well-known $out/share/doc/consent-aware-http/

            # Copy governance docs
            cp README.md LICENSE.md CHANGELOG.md $out/share/doc/consent-aware-http/
            cp MAINTAINERS.md CODE_OF_CONDUCT.md $out/share/doc/consent-aware-http/

            # Copy .github if exists
            if [ -d .github ]; then
              cp -r .github $out/share/doc/consent-aware-http/
            fi

            echo "✅ Documentation package built: $out/share/doc/consent-aware-http"
          '';

          meta = with pkgs.lib; {
            description = "HTTP 430 Consent Required + AIBDP Protocol Specifications";
            longDescription = ''
              Internet-Draft specifications for consent-aware HTTP infrastructure:

              - HTTP Status Code 430 (Consent Required): Enables servers to reject
                requests when AI-specific consent requirements are not met

              - AIBDP (AI Boundary Declaration Protocol): Machine-readable manifest
                format for declaring AI usage boundaries at /.well-known/aibdp.json

              This package includes specifications, documentation, reference examples,
              and outreach materials for implementing consent-aware web protocols.
            '';
            homepage = "https://github.com/Hyperpolymath/consent-aware-http";
            license = with licenses; [ mit cc-by-sa-40 ];
            maintainers = [{
              name = "Jonathan D.A. Jewell";
              email = "jonathan@metadatastician.art";
            }];
            platforms = platforms.all;
          };
        };

        # Apps for common tasks
        apps = {
          # Validate manifests
          validate = {
            type = "app";
            program = "${pkgs.writeShellScript "validate" ''
              ${pkgs.just}/bin/just validate
            ''}";
          };

          # Check RSR compliance
          check-rsr = {
            type = "app";
            program = "${pkgs.writeShellScript "check-rsr" ''
              ${pkgs.just}/bin/just check-rsr
            ''}";
          };

          # Show status
          status = {
            type = "app";
            program = "${pkgs.writeShellScript "status" ''
              ${pkgs.just}/bin/just status
            ''}";
          };
        };

        # Formatter (for nix files)
        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
