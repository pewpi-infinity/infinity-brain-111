#!/usr/bin/env python3
"""
co-star_coder :: MASTER REGISTRY CART

This file is the single source of truth for all co-star_coder carts.
All future builds MUST reference this registry.
Do not delete. Do not rename.
"""

CO_STAR_CODER_CARTS = [
    # CORE INTENT & CONTROL
    ("cart001_intent_listener.py", "Capture user intent (e.g. 'I need a webpage')"),
    ("cart002_intent_classifier.py", "Classify site type"),
    ("cart003_scope_resolver.py", "Resolve site size & complexity"),
    ("cart004_user_constraints.py", "User preferences & constraints"),
    ("cart005_project_manifest.py", "Generate project.json spine"),
    ("cart006_fail_safe_guard.py", "Prevent overwrite or destructive ops"),

    # SITE ARCHITECTURE
    ("cart007_site_map_builder.py", "Generate site map"),
    ("cart008_route_generator.py", "URL & routing logic"),
    ("cart009_component_registry.py", "UI component registry"),
    ("cart010_layout_engine.py", "Layout & grid logic"),
    ("cart011_asset_planner.py", "Images, fonts, icons"),
    ("cart012_accessibility_enforcer.py", "Accessibility rules"),

    # CONTENT & COPY
    ("cart013_copywriter.py", "Page copy generation"),
    ("cart014_headline_generator.py", "Headlines & hierarchy"),
    ("cart015_cta_builder.py", "Calls-to-action"),
    ("cart016_metadata_writer.py", "SEO & metadata"),
    ("cart017_placeholder_realism.py", "Smart placeholders"),
    ("cart018_multilingual_ready.py", "Translation-ready content"),

    # UI / UX
    ("cart019_theme_engine.py", "Color & theme system"),
    ("cart020_typography_engine.py", "Font logic"),
    ("cart021_spacing_rhythm.py", "Spacing consistency"),
    ("cart022_animation_rules.py", "Motion rules"),
    ("cart023_responsive_rules.py", "Responsive behavior"),
    ("cart024_visual_consistency_guard.py", "Prevent UI drift"),

    # PAGE-SPAWNING BOTS
    ("cart025_page_bot_base.py", "Base page bot"),
    ("cart026_homepage_bot.py", "Homepage generator"),
    ("cart027_secondary_page_bot.py", "Secondary pages"),
    ("cart028_blog_page_bot.py", "Blog scaffolding"),
    ("cart029_form_page_bot.py", "Forms & capture pages"),
    ("cart030_error_page_bot.py", "Error pages"),

    # OUTPUT & DEPLOY
    ("cart031_file_writer.py", "Write real files"),
    ("cart032_preview_server.py", "Local preview server"),
    ("cart033_deploy_adapter.py", "Deploy hooks"),
]

def list_carts():
    print("\n[co-star_coder] Registered carts:\n")
    for i, (name, desc) in enumerate(CO_STAR_CODER_CARTS, start=1):
        print(f"{i:02d}. {name} — {desc}")
    print(f"\nTotal carts: {len(CO_STAR_CODER_CARTS)}\n")

def verify_carts():
    import os
    missing = []
    for name, _ in CO_STAR_CODER_CARTS:
        if not os.path.exists(name):
            missing.append(name)

    if missing:
        print("[!] Missing carts:")
        for m in missing:
            print("   -", m)
    else:
        print("[✓] All carts present")

if __name__ == "__main__":
    list_carts()
    verify_carts()
