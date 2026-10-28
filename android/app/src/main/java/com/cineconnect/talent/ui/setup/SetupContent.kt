package com.cineconnect.talent.ui.setup

/** Constants copied from `frontend/src/app/profile-setup/page.tsx`. */
object SetupContent {

    val primaryRoles = listOf(
        "Actor / Actress",
        "Director",
        "Screenwriter",
        "Cinematographer / DoP",
        "Producer",
        "Editor",
        "Music Composer",
        "Sound Designer",
        "Art Director",
        "Casting Director",
        "Stunt Coordinator",
        "VFX Artist",
        "Costume Designer",
        "Make-up Artist",
    )

    val experienceLevels = listOf(
        "Beginner (< 1 year)",
        "Emerging (1-3 years)",
        "Intermediate (3-5 years)",
        "Experienced (5-10 years)",
        "Veteran (10+ years)",
    )

    val skills = listOf(
        "Dialogue delivery",
        "Method acting",
        "Singing",
        "Dance",
        "Martial arts",
        "Horse riding",
        "Improvisation",
        "Voice modulation",
        "Action / Stunts",
        "Comedy timing",
        "Classical dance",
        "Script writing",
        "Direction",
        "Cinematography",
        "Editing",
        "Sound mixing",
        "VFX / Motion graphics",
    )

    val genders = listOf("Female", "Male", "Non-binary", "Prefer not to say")

    /** `COMPLETION_STEPS` in the web wizard. */
    val completionSteps = listOf(
        "account" to "Account created",
        "basic" to "Basic information",
        "professional" to "Professional details",
        "skills" to "Skills and portfolio",
    )

    val stepTitles = listOf(
        "Basic information",
        "Professional details",
        "Skills and about you",
        "Portfolio & showreel",
    )

    val stepSubtitles = listOf(
        "How production houses will see and contact you",
        "Your craft and experience",
        "Pick what you do best, then say it in your own words",
        "Links to your work — YouTube, Vimeo, or cloud storage",
    )
}
