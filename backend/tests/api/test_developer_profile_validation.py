import pytest
from pydantic import ValidationError

from app.schemas.developer_profiles import DeveloperProfileUpdate


def test_developer_profile_update_rejects_negative_experience() -> None:
    with pytest.raises(ValidationError):
        DeveloperProfileUpdate(experience_years=-1)


def test_developer_profile_update_accepts_links_and_education_replacement() -> None:
    update = DeveloperProfileUpdate(
        job_title="Full-stack Developer",
        github="https://github.com/example",
        linkedin="https://www.linkedin.com/in/example",
        portfolio_link="https://example.com",
        educations=[
            {
                "level": "bachelors",
                "degree": "Software Engineering",
                "school": "FAST NUCES",
            }
        ],
    )

    assert update.github == "https://github.com/example"
    assert update.educations is not None
    assert update.educations[0].degree == "Software Engineering"
