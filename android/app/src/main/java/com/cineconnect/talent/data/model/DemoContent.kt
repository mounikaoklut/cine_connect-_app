package com.cineconnect.talent.data.model

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/**
 * Mirrors the demo fallback that `frontend/src/app/page.tsx` renders when the
 * backend is not reachable. Lets the app show the full themed UI offline.
 */
object DemoContent {

    val user = UserProfile(
        id = "d3b07384-d113-4a44-9c81-c30089f23d88",
        email = "kabir.mehra@cineconnect.com",
        phone = "+91 98200 12345",
        auth_provider = "email",
        email_verified = true,
        phone_verified = true,
        identity_verified = true,
        profile = ProfileDetail(
            name = "Kabir Mehra",
            bio = "Method actor and theater artist with 7+ years of experience across independent cinema, OTT thrillers, and commercial campaigns. Trained at the National School of Drama.",
            photo_url = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
            primary_craft = "Actor",
            secondary_crafts = listOf("Voice Over Artist", "Action / Stunts"),
            city = "Mumbai",
            state = "Maharashtra",
            travel_radius_km = 500,
            completeness_score = 85,
            languages = listOf(
                jsonObject("lang" to "Hindi", "fluency" to "Native"),
                jsonObject("lang" to "English", "fluency" to "Fluent"),
                jsonObject("lang" to "Punjabi", "fluency" to "Conversational"),
            ),
            availability = jsonObject(
                "status" to "Available for Shoots",
                "note" to "Available for feature films and web-series starting November 2026"
            ),
        ),
        skills = listOf(
            UserSkill(1, "Method Acting", "acting", "Expert"),
            UserSkill(2, "Dialogue Delivery", "acting", "Expert"),
            UserSkill(3, "Voice Modulation", "acting", "Advanced"),
            UserSkill(4, "Action / Stage Stunts", "acting", "Intermediate"),
            UserSkill(5, "Improvisation", "acting", "Advanced"),
        ),
        experiences = listOf(
            ExperienceItem(
                id = "exp-1",
                title = "Lead Antagonist (Vikram)",
                company = "Dharma Productions / Netflix",
                role_type = "Feature Film",
                start_date = "2024-03-01",
                end_date = "2024-11-15",
                description = "Played the layered antagonist in psychological crime thriller 'Shadow of Verity'. Received praise for intensity in 12-minute unedited monologue scene."
            ),
            ExperienceItem(
                id = "exp-2",
                title = "Inspector Samar",
                company = "Excel Entertainment / Prime Video",
                role_type = "Web Series (Season 2)",
                start_date = "2023-01-10",
                end_date = "2023-08-20",
                description = "Series regular across 8 episodes. Trained for 3 months in combat choreography and weapon handling."
            ),
            ExperienceItem(
                id = "exp-3",
                title = "Lead Protagonist",
                company = "Prithvi Theatre Mumbai",
                role_type = "Theatre Play",
                start_date = "2021-06-01",
                end_date = "2022-12-15",
                description = "Over 45 live stage performances across Mumbai, Delhi, and Bengaluru theatrical tours."
            ),
        ),
        portfolio = listOf(
            PortfolioItem(
                id = "port-1",
                type = "showreel",
                s3_url = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
                title = "Dramatic Showreel (2025 - 2026)",
                description = "Compilation of intense monologue and dramatic scenes from OTT thriller series.",
                is_public = true,
                sort_order = 0
            ),
            PortfolioItem(
                id = "port-2",
                type = "photo",
                s3_url = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
                title = "Theatrical Headshot (Commercial)",
                description = "Studio portrait by Vikram Bawa photography.",
                is_public = true,
                sort_order = 1
            ),
            PortfolioItem(
                id = "port-3",
                type = "photo",
                s3_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
                title = "Period Drama Character Look",
                description = "Prosthetics and 1940s vintage styling test for historical series.",
                is_public = true,
                sort_order = 2
            ),
            PortfolioItem(
                id = "port-4",
                type = "resume",
                s3_url = "#",
                title = "Kabir_Mehra_Official_Resume_2026.pdf",
                description = "Verified theatrical and film credits with agent contact details.",
                is_public = true,
                sort_order = 3
            ),
        ),
    )

    val completeness = CompletenessResponse(
        score = 85,
        max_score = 100,
        suggestions = listOf(
            "Upload a 2-minute voice sample reel to increase score to 92%",
            "Add your willing-to-travel international passport status",
        )
    )

    private fun jsonObject(vararg pairs: Pair<String, String>): JsonObject =
        Json.parseToJsonElement(
            pairs.joinToString(prefix = "{", postfix = "}") { (k, v) -> "\"$k\":\"$v\"" }
        ) as JsonObject

    @Suppress("unused")
    private fun primitive(value: String): JsonPrimitive = JsonPrimitive(value)
}
