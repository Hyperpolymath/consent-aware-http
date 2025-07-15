Consent-Aware HTTP: Declarative Boundaries for AI Usage
“You have not the freedom of the house.” — Virginia Woolf, The Waves

This repository hosts formal proposals, implementation materials, and ethical guidance for a consent-aware architecture in the age of generative systems. At its heart are two interlinked Internet-Drafts designed to enforce procedural refusals when AI usage boundaries are unmet or ignored:

🚦 draft-jewell-http-430-consent-required
Defines HTTP Status Code 430 Consent Required, enabling servers to reject access when AI-specific consent declarations are invalid, missing, or violated. It empowers refusal not as punishment, but as principled perimeter enforcement.

🧭 draft-jewell-aibdp
Introduces the AI Boundary Declaration Protocol (AIBDP) — a machine-readable manifest (/.well-known/aibdp.json) for signaling what forms of AI engagement are permitted. It formalizes intent, fosters transparency, and restores agency to originators.

Together, these protocols establish declarative boundaries that resist unauthorized training, indexing, or generative reuse — compatible with federated infrastructure and public web publishing alike.

🗂 Repository Structure
bash
consent-aware-http/
├── drafts/          # Formal RFC XML and TXT drafts
│   └── draft-jewell-http-430-consent-required-00.txt
│   └── draft-jewell-aibdp-00.txt
│   └── draft-jewell-http-430-consent-required-00.xml
│   └── draft-jewell-aibdp-00.xml
├── rendered/        # HTML and PDF versions for easy reading
│   └── draft-jewell-http-430-consent-required-00.pdf
│   └── draft-jewell-aibdp-00.pdf
│   └── draft-jewell-http-430-consent-required-00.html
│   └── draft-jewell-aibdp-00.html
├── docs/            # Guides and philosophical framings
│   ├── technical.md
│   ├── explainer.md
│   ├── ethics.md
│   ├── governance.md
│   └── start-here.md
├── .github/         # CONTRIBUTING and community guidelines
│   └── CONTRIBUTING.md
│   └── community-guidelines.md
├── LICENSE.md       # Dual licensing model: MIT + CC BY-SA
├── README.md        # This file
├── .gitignore
└── .gitattributes

⚙️ Quick Links

📜 430 Consent Required Draft

📜 AIBDP Protocol Draft

🛠 Developer Explainer

🧠 Philosophical Overview

📚 Start Using It Now

🌱 Why This Matters

AI systems often ingest, embed, and regenerate content without consent — erasing boundary, authorship, and intent. These drafts restore procedural clarity to web interactions, allowing creators to:

Refuse generative reuse without legal escalation

Declare acceptable AI uses in a standardized way

Signal denial with structured protocol, not vague error codes

Collaborate on infrastructure that respects ethical constraints

🧩 How to Get Started

Add /.well-known/aibdp.json to your site with your declared boundaries

Update server logic to respond with HTTP 430 when violations occur

Use start-here.md for templates, examples, and server configs

Join discussions in the IndieWeb, Fediverse, or IETF circles to promote shared adoption

These standards can be implemented independently of platform, license, or scale — ideal for personal blogs, union archives, CDN layers, or federated identity services.

🪧 Ethics and Governance

This project draws on traditions of ethical journalism, federated systems, and authorship dignity. It respects:

Declarative refusal as a form of care

Boundary as the place where meaning begins

Transparent infrastructure over implied permissions

Sanctuary work as both cultural and procedural

Explore more in ethics.md and governance.md.

👥 Contributing

We welcome developers, ethicists, teachers, organizers, and critics. See CONTRIBUTING.md for guidelines. Contributions may include:

Draft improvements

Schema extensions

Educational modules

Narrative essays

Adoption stories and outreach coordination

🧾 Licensing

Code and draft content: MIT License — free for reuse and adaptation with attribution

Documentation, narrative, and guides: Creative Commons Attribution-ShareAlike 4.0 — fosters open improvement and ethical propagation

✨ Built By

Jonathan D.A. Jewell NEC PRC Representative · NUJ Ethics Council Convenor · AI & Data Working Group Contact: jonathan@metadatastician.art

“The act of naming is the act of creating boundaries. And boundary is where meaning begins.” — Bell Hooks