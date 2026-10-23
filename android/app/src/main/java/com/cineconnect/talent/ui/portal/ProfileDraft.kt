package com.cineconnect.talent.ui.portal

import com.cineconnect.talent.data.model.LanguagePayload

/** Everything the profile editor can change in one pass. */
data class ProfileDraft(
    val name: String = "",
    val bio: String = "",
    val primaryCraft: String = "",
    val secondaryCrafts: List<String> = emptyList(),
    val city: String = "",
    val state: String = "",
    val travelRadiusKm: Int = 0,
    val gender: String = "",
    val dateOfBirth: String = "",
    val languages: List<LanguagePayload> = emptyList(),
    val availabilityStatus: String = "",
    val availabilityNote: String = "",
)

/** Pick lists used by the profile editor. */
object ProfileOptions {

    val crafts = listOf(
        "Actor",
        "Actress",
        "Director",
        "Screenwriter",
        "Cinematographer / DoP",
        "Producer",
        "Editor",
        "Music Composer",
        "Sound Designer",
        "Art Director",
        "Production Designer",
        "Costume Designer",
        "Make-up Artist",
        "Stunt Coordinator",
        "VFX Artist",
        "Camera Operator",
        "Gaffer",
        "Grip",
        "Casting Director",
        "Voice Over Artist",
        "Anchor / Host",
        "Choreographer",
        "Dancer",
        "Singer",
        "Stand-in / Doubl",
    )

    val genders = listOf("Female", "Male", "Non-binary", "Prefer not to say")

    val availabilityStatuses = listOf(
        "Available for Shoots",
        "Limited Availability",
        "Not Available",
    )

    val languages = listOf(
        "Hindi",
        "English",
        "Punjabi",
        "Bengali",
        "Marathi",
        "Gujarati",
        "Telugu",
        "Tamil",
        "Kannada",
        "Malayalam",
        "Urdu",
        "Spanish",
        "French",
        "German",
    )
}
