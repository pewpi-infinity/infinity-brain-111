#!/usr/bin/env python3
"""
MAGNETICS LEARNING REGISTRY — 33 CARTS
Educational, safety-first, non-operational
"""

MAGNETICS_CARTS = [
    # A — Fundamentals
    ("cartA01_intro_to_electromagnetism.py", "Fields & forces (conceptual)"),
    ("cartA02_materials_basics.py", "Magnetic vs non-magnetic materials"),
    ("cartA03_current_and_coils.py", "Current & coils (theory)"),
    ("cartA04_force_calculation_overview.py", "Awareness of modeling"),
    ("cartA05_heat_and_duty_cycle.py", "Heat & safety"),

    # B — Device Types & Context
    ("cartB07_maglock_types.py", "Types of magnetic locks (overview)"),
    ("cartB08_power_requirements.py", "Typical power ranges (standards)"),
    ("cartB09_door_frames_and_mounts.py", "Alignment concepts"),
    ("cartB10_access_control_context.py", "Access systems context"),
    ("cartB11_emergency_release_principles.py", "Emergency egress"),
    ("cartB12_codes_and_compliance.py", "Codes overview"),

    # C — Safety & Ethics
    ("cartC13_life_safety_rules.py", "Life-safety principles"),
    ("cartC14_power_loss_behavior.py", "Outage behavior"),
    ("cartC15_fire_alarm_integration.py", "Fire alarm logic"),
    ("cartC16_accessibility_considerations.py", "ADA concepts"),
    ("cartC17_risk_assessment_intro.py", "Risk identification"),
    ("cartC18_ethics_and_law.py", "Ethical boundaries"),

    # D — Modeling & Analysis
    ("cartD19_block_diagrams.py", "System diagrams"),
    ("cartD20_state_machines.py", "State logic"),
    ("cartD21_thermal_models.py", "Thermal trends"),
    ("cartD22_failure_modes.py", "Failure modes"),
    ("cartD23_testing_philosophy.py", "Validation mindset"),
    ("cartD24_documentation_templates.py", "Engineering docs"),

    # E — Learning Tools
    ("cartE25_glossary.py", "Terminology"),
    ("cartE26_quiz_generator.py", "Self-check quizzes"),
    ("cartE27_case_studies.py", "Public case studies"),
    ("cartE28_standards_reader.py", "Standards summaries"),
    ("cartE29_diagram_generator.py", "Non-operational diagrams"),
    ("cartE30_safety_checklists.py", "Safety checklists"),

    # F — Control & Review
    ("cartF31_learning_registry.py", "Index & navigation"),
    ("cartF32_progress_tracker.py", "Progress log"),
    ("cartF33_pause_and_review.py", "Intentional pause points"),
]

def main():
    print("\nMAGNETICS LEARNING CARTS (33):\n")
    for i, (name, desc) in enumerate(MAGNETICS_CARTS, 1):
        print(f"{i:02d}. {name} — {desc}")
    print(f"\nTotal: {len(MAGNETICS_CARTS)} carts\n")

if __name__ == "__main__":
    main()
