from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.developer_review import DeveloperReview
from app.models.user import DeveloperProfile


def list_reviews_for_developer(db: Session, developer_user_id: UUID) -> list[DeveloperReview]:
    statement = (
        select(DeveloperReview)
        .options(selectinload(DeveloperReview.reviewer))
        .where(DeveloperReview.developer_user_id == developer_user_id)
        .order_by(DeveloperReview.updated_at.desc())
    )
    return list(db.scalars(statement).all())


def get_review_by_reviewer(
    db: Session,
    *,
    developer_user_id: UUID,
    reviewer_user_id: UUID,
) -> DeveloperReview | None:
    statement = select(DeveloperReview).where(
        DeveloperReview.developer_user_id == developer_user_id,
        DeveloperReview.reviewer_user_id == reviewer_user_id,
    )
    return db.scalar(statement)


def upsert_review(
    db: Session,
    *,
    developer_user_id: UUID,
    reviewer_user_id: UUID,
    rating: int,
    comment: str,
) -> DeveloperReview:
    review = get_review_by_reviewer(
        db,
        developer_user_id=developer_user_id,
        reviewer_user_id=reviewer_user_id,
    )
    if review is None:
        review = DeveloperReview(
            developer_user_id=developer_user_id,
            reviewer_user_id=reviewer_user_id,
            rating=rating,
            comment=comment,
        )
        db.add(review)
        db.flush()  # write new row before AVG query so it is included in the recalculation
    else:
        review.rating = rating
        review.comment = comment

    recalculate_rating(db, developer_user_id)
    return review


def recalculate_rating(db: Session, developer_user_id: UUID) -> None:
    average = db.scalar(
        select(func.avg(DeveloperReview.rating)).where(
            DeveloperReview.developer_user_id == developer_user_id
        )
    )
    profile = db.get(DeveloperProfile, developer_user_id)
    if profile is not None:
        profile.rating_avg = average or 0
