"""Self-checks for the developer profile-quality gate used by matching.

No pytest required: run directly with the venv python from backend/:
    ./.venv/Scripts/python.exe tests/test_profile_quality.py
(Also discoverable by pytest as test_* functions if it's ever installed.)
"""
from __future__ import annotations

from app.services.profile_quality import (
    has_meaningful_skills,
    is_developer_profile_matchable,
    is_meaningful_paragraph,
    is_meaningful_short_text,
)

GOOD_BIO = "I build scalable backend systems and love shipping production APIs."


class _Profile:
    def __init__(self, job_title="", bio="", skills=None, user_id="test-user"):
        self.job_title = job_title
        self.bio = bio
        self.skills = skills or []
        self.user_id = user_id


def test_empty_profile_is_not_matchable():
    assert not is_developer_profile_matchable(_Profile())


def test_junk_placeholder_profile_is_not_matchable():
    profile = _Profile(job_title="jggg", bio="jggg jggg jggg jggg", skills=["jggg"])
    assert not is_developer_profile_matchable(profile)


def test_bio_below_minimum_length_is_not_matchable():
    profile = _Profile(job_title="Full Stack Developer", bio="i work test", skills=["React"])
    assert not is_developer_profile_matchable(profile)


def test_repeated_single_word_bio_is_not_matchable():
    profile = _Profile(job_title="Engineer", bio="test test test test", skills=["Python"])
    assert not is_developer_profile_matchable(profile)


def test_complete_profile_is_matchable():
    profile = _Profile(job_title="Backend Engineer", bio=GOOD_BIO, skills=["Python", "FastAPI"])
    assert is_developer_profile_matchable(profile)


def test_short_but_legitimate_job_title_is_accepted():
    assert is_meaningful_short_text("QA")
    assert is_meaningful_short_text("CTO")


def test_numeric_or_punctuation_only_text_is_rejected():
    assert not is_meaningful_short_text("----")
    assert not is_meaningful_short_text("1234")


def test_paragraph_requires_minimum_words_even_if_long_enough():
    assert not is_meaningful_paragraph("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")


def test_skills_list_needs_at_least_one_meaningful_entry():
    assert not has_meaningful_skills(["a"])
    assert not has_meaningful_skills([])
    assert has_meaningful_skills(["React"])


def _run() -> None:
    cases = sorted(
        (name, fn) for name, fn in globals().items() if name.startswith("test_") and callable(fn)
    )
    for name, case in cases:
        case()
        print(f"  ok  {name}")
    print("\nAll profile-quality checks passed.")


if __name__ == "__main__":
    _run()
