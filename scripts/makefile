# Makefile for xml2rfc draft builds

DRAFTS = drafts/draft-jewell-http-430-consent-required-00.xml drafts/draft-jewell-aibdp-00.xml
OUTDIR = rendered

all:
    @mkdir -p $(OUTDIR)
    @for file in $(DRAFTS); do \
        echo "🛠 Building $$file..."; \
        xml2rfc $$file --html --txt --pdf --out $(OUTDIR); \
    done

clean:
    rm -rf $(OUTDIR)/*.html $(OUTDIR)/*.txt $(OUTDIR)/*.pdf
