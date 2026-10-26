"""AWS OpenSearch helper — talent search and opportunity indexing."""

from typing import Any

try:
    from opensearchpy import AsyncOpenSearch
except ImportError:
    AsyncOpenSearch = None

from app.config import get_settings

settings = get_settings()

# OpenSearch client (lazy-initialized)
_client: Any = None


def get_opensearch_client():
    """Get or create an AsyncOpenSearch client."""
    global _client
    if _client is None and AsyncOpenSearch is not None:
        hosts = getattr(settings, "OPENSEARCH_URL", "http://localhost:9200")
        auth = (
            getattr(settings, "OPENSEARCH_USER", "admin"),
            getattr(settings, "OPENSEARCH_PASSWORD", "admin"),
        )
        _client = AsyncOpenSearch(
            hosts=[hosts],
            http_auth=auth,
            use_ssl=False,
            verify_certs=False,
        )
    return _client


TALENT_INDEX = "cineconnect_talent"
OPPORTUNITY_INDEX = "cineconnect_opportunities"


async def index_talent_profile(profile_data: dict) -> None:
    """Index a talent profile into OpenSearch for search discovery."""
    client = get_opensearch_client()
    if not client:
        return
    await client.index(
        index=TALENT_INDEX,
        id=str(profile_data.get("user_id")),
        body={
            "user_id": str(profile_data.get("user_id")),
            "name": profile_data.get("name"),
            "primary_craft": profile_data.get("primary_craft"),
            "secondary_crafts": profile_data.get("secondary_crafts", []),
            "city": profile_data.get("city"),
            "state": profile_data.get("state"),
            "skills": profile_data.get("skills", []),
            "gender": profile_data.get("gender"),
            "languages": profile_data.get("languages", []),
            "availability": profile_data.get("availability", {}),
            "completeness_score": profile_data.get("completeness_score", 0),
            "identity_verified": profile_data.get("identity_verified", False),
        },
    )


async def index_opportunity(opportunity) -> None:
    """Index a casting call into OpenSearch."""
    client = get_opensearch_client()
    if not client:
        return
    await client.index(
        index=OPPORTUNITY_INDEX,
        id=str(opportunity.id),
        body={
            "opportunity_id": str(opportunity.id),
            "title": opportunity.title,
            "craft": opportunity.craft,
            "required_skills": opportunity.required_skills or [],
            "city": opportunity.city,
            "state": opportunity.state,
            "is_remote": opportunity.is_remote,
            "status": opportunity.status.value,
            "pay_min": float(opportunity.pay_min) if opportunity.pay_min else None,
            "pay_max": float(opportunity.pay_max) if opportunity.pay_max else None,
            "age_min": opportunity.age_min,
            "age_max": opportunity.age_max,
            "gender_pref": opportunity.gender_pref,
            "experience_years": opportunity.experience_years,
        },
    )


async def search_talent(
    craft: str | None = None,
    skills: str | None = None,
    city: str | None = None,
    state: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    page: int = 1,
    page_size: int = 20,
) -> list[dict]:
    """
    Query OpenSearch for matching talent profiles.

    Falls back to raising an exception so the router can use PostgreSQL fallback.
    """
    client = get_opensearch_client()
    if not client:
        raise RuntimeError("OpenSearch not configured")

    must_clauses = []
    filter_clauses = []

    if craft:
        must_clauses.append({"match": {"primary_craft": craft}})
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        must_clauses.append({"terms": {"skills": skill_list}})
    if city:
        filter_clauses.append({"term": {"city.keyword": city}})
    if state:
        filter_clauses.append({"term": {"state.keyword": state}})
    if gender:
        filter_clauses.append({"term": {"gender.keyword": gender}})

    query_body: dict = {
        "query": {
            "bool": {
                "must": must_clauses if must_clauses else [{"match_all": {}}],
                "filter": filter_clauses,
            }
        },
        "sort": [{"completeness_score": {"order": "desc"}}],
        "from": (page - 1) * page_size,
        "size": page_size,
    }

    response = await client.search(index=TALENT_INDEX, body=query_body)
    hits = response.get("hits", {}).get("hits", [])
    return [hit["_source"] for hit in hits]


async def search_opportunities(
    craft: str | None = None,
    skills: str | None = None,
    city: str | None = None,
    state: str | None = None,
    is_remote: bool | None = None,
    page: int = 1,
    page_size: int = 20,
) -> list[dict]:
    """Query OpenSearch for open opportunities."""
    client = get_opensearch_client()
    if not client:
        raise RuntimeError("OpenSearch not configured")

    must_clauses: list = [{"term": {"status": "open"}}]
    filter_clauses = []

    if craft:
        must_clauses.append({"match": {"craft": craft}})
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        must_clauses.append({"terms": {"required_skills": skill_list}})
    if city:
        filter_clauses.append({"term": {"city.keyword": city}})
    if state:
        filter_clauses.append({"term": {"state.keyword": state}})
    if is_remote is not None:
        filter_clauses.append({"term": {"is_remote": is_remote}})

    query_body = {
        "query": {"bool": {"must": must_clauses, "filter": filter_clauses}},
        "from": (page - 1) * page_size,
        "size": page_size,
    }

    response = await client.search(index=OPPORTUNITY_INDEX, body=query_body)
    hits = response.get("hits", {}).get("hits", [])
    return [hit["_source"] for hit in hits]
