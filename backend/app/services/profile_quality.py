from __future__ import annotations

import re

# "Professional summary"-style fields (bio) need enough real content to be
# useful for matching/embeddings, not just a non-empty string.
BIO_MIN_LENGTH = 20
BIO_MIN_WORDS = 3

# "Core focus"-style short fields (job title, individual skills) are legitimately
# short ("QA", "CTO"), so they only need a sane minimum length plus the
# placeholder check below.
SHORT_TEXT_MIN_LENGTH = 2


def _looks_like_placeholder(text: str) -> bool:
    """Catch keyboard-mash/junk text like "jggg", "aaaaaaaa", "asdasdasd".

    Heuristic, not perfect NLP: placeholder junk tends to be dominated by a
    tiny handful of distinct letters relative to its length.
    """
    letters = re.sub(r"[^a-zA-Z]", "", text)
    if not letters:
        # Purely numeric/punctuation text (e.g. "----", "1234") isn't a real answer.
        return True
    if len(letters) >= 4 and len(set(letters.lower())) <= 2:
        return True
    return False


def _looks_like_repeated_word(text: str) -> bool:
    words = [word.lower() for word in re.split(r"\s+", text.strip()) if word]
    return len(words) >= 2 and len(set(words)) == 1


def is_meaningful_short_text(value: str | None, *, min_length: int = SHORT_TEXT_MIN_LENGTH) -> bool:
    """Validates short fields such as job_title or a single skill entry."""
    if not value:
        return False
    text = value.strip()
    if len(text) < min_length:
        return False
    return not _looks_like_placeholder(text)


def is_meaningful_paragraph(
    value: str | None, *, min_length: int = BIO_MIN_LENGTH, min_words: int = BIO_MIN_WORDS
) -> bool:
    """Validates longer free-text fields such as the professional summary/bio."""
    if not value:
        return False
    text = value.strip()
    if len(text) < min_length:
        return False
    if _looks_like_placeholder(text):
        return False
    if _looks_like_repeated_word(text):
        return False
    words = [word for word in re.split(r"\s+", text) if word]
    return len(words) >= min_words


def is_meaningful_skill(value: str | None) -> bool:
    return is_meaningful_short_text(value)


def has_meaningful_skills(skills: list[str] | None, *, minimum: int = 1) -> bool:
    if not skills:
        return False
    return sum(1 for skill in skills if is_meaningful_skill(skill)) >= minimum


def is_developer_profile_matchable(profile) -> bool:
    """Minimum data-completeness bar for a developer profile to be eligible for matching.

    Guards against profiles with empty or placeholder/junk core fields (e.g. a
    profile whose job title, bio, and skills are all "jggg") slipping into
    matching results or getting a fabricated semantic score from junk embeddings.
    """
    if not is_meaningful_short_text(profile.job_title):
        return False
    if not is_meaningful_paragraph(profile.bio):
        return False
    if not has_meaningful_skills(profile.skills):
        return False
    return True
