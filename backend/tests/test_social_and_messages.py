"""Tests for Social networking, Connections, Posts, Interactions, Messages, and Readiness."""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_social_and_messaging_flow(client: AsyncClient):
    # Setup User A and User B
    uid_a = uuid.uuid4().hex[:8]
    reg_a = await client.post(
        "/api/v1/auth/register",
        json={"email": f"alice_{uid_a}@cineconnect.com", "password": "Password123!", "name": "Alice Cinematographer"},
    )
    user_a_id = reg_a.json()["user"]["id"]
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    uid_b = uuid.uuid4().hex[:8]
    reg_b = await client.post(
        "/api/v1/auth/register",
        json={"email": f"bob_{uid_b}@cineconnect.com", "password": "Password123!", "name": "Bob Colorist"},
    )
    user_b_id = reg_b.json()["user"]["id"]
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. User A sends connection request to User B
    conn_res = await client.post(f"/api/v1/connections/{user_b_id}", headers=headers_a)
    assert conn_res.status_code == 201
    conn_data = conn_res.json()
    conn_id = conn_data["id"]
    assert conn_data["status"] == "pending"

    # 2. User B lists connections and accepts request
    b_conns = await client.get("/api/v1/connections", headers=headers_b)
    assert b_conns.status_code == 200
    assert any(c["id"] == conn_id for c in b_conns.json())

    accept_conn = await client.patch(
        f"/api/v1/connections/{conn_id}",
        headers=headers_b,
        json={"status": "accepted"},
    )
    assert accept_conn.status_code == 200
    assert accept_conn.json()["status"] == "accepted"

    # 3. User A creates a feed post
    post_res = await client.post(
        "/api/v1/posts",
        headers=headers_a,
        json={
            "caption": "Testing anamorphic lenses on the new ARRI Alexa 35!",
            "media_url": "https://cdn.cineconnect.com/posts/alexa35.jpg",
        },
    )
    assert post_res.status_code == 201
    post_data = post_res.json()
    post_id = post_data["id"]
    assert "anamorphic" in post_data["caption"]

    # 4. User B likes the post
    like_res = await client.post(
        f"/api/v1/posts/{post_id}/interactions",
        headers=headers_b,
        json={"type": "like"},
    )
    assert like_res.status_code == 201
    assert like_res.json()["type"] == "like"

    # 5. User B comments on the post
    comment_res = await client.post(
        f"/api/v1/posts/{post_id}/interactions",
        headers=headers_b,
        json={"type": "comment", "comment": "The flare roll-off looks incredible!"},
    )
    assert comment_res.status_code == 201
    assert comment_res.json()["type"] == "comment"

    # 6. View post details with updated interaction counts
    get_post = await client.get(f"/api/v1/posts/{post_id}")
    assert get_post.status_code == 200
    assert get_post.json()["likes_count"] >= 1
    assert get_post.json()["comments_count"] >= 1

    # 7. User A sends a message to User B
    msg_res = await client.post(
        "/api/v1/messages",
        headers=headers_a,
        json={"recipient_id": user_b_id, "body": "Hey Bob, are you available for color grading next week?"},
    )
    assert msg_res.status_code == 201
    assert msg_res.json()["body"] == "Hey Bob, are you available for color grading next week?"

    # 8. User B checks conversations
    convs_res = await client.get("/api/v1/messages/conversations", headers=headers_b)
    assert convs_res.status_code == 200
    assert any(c["other_user_id"] == user_a_id for c in convs_res.json())

    # 9. User B gets message history
    history_res = await client.get(f"/api/v1/messages/{user_a_id}", headers=headers_b)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1

    # 10. Platform Readiness check
    ready_res = await client.get("/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["database"] == "connected"
    assert ready_res.json()["redis"] == "connected"
