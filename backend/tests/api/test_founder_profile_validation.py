import pytest
from pydantic import ValidationError

from app.schemas.founder_profiles import EducationCreate, FounderProfileUpdate


def test_education_requires_level_and_school() -> None:
    with pytest.raises(ValidationError):
        EducationCreate(level="", school="FAST NUCES")

    with pytest.raises(ValidationError):
        EducationCreate(level="bachelors", school="")


def test_founder_profile_update_accepts_education_replacement() -> None:
    update = FounderProfileUpdate(
        headline="Building Evolv",
        educations=[
            {
                "level": "bachelors",
                "degree": "Computer Science",
                "school": "FAST NUCES",
            }
        ],
    )

    assert update.educations is not None
    assert update.educations[0].school == "FAST NUCES"
