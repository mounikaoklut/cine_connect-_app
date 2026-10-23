package com.cineconnect.talent.ui.portal

import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.toMutableStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.data.model.LanguagePayload
import com.cineconnect.talent.data.model.availabilityNote
import com.cineconnect.talent.data.model.availabilityStatus
import com.cineconnect.talent.data.model.languageEntries
import com.cineconnect.talent.ui.components.CineChip
import com.cineconnect.talent.ui.components.CineTextField
import com.cineconnect.talent.ui.components.GoldButton
import com.cineconnect.talent.ui.components.SecondaryButton
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

private const val MAX_PHOTO_BYTES = 8 * 1024 * 1024

/**
 * Full profile editor — mirrors the fields the web portal and the setup wizard
 * collect, plus a real headshot upload through the presigned-S3 flow.
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun EditProfileSheet(
    state: PortalUiState,
    saving: Boolean,
    uploadingPhoto: Boolean,
    onDismiss: () -> Unit,
    onSave: (ProfileDraft) -> Unit,
    onPickPhoto: (bytes: ByteArray, filename: String, contentType: String) -> Unit,
) {
    val profile = state.user.profile
    val context = LocalContext.current

    var name by remember { mutableStateOf(profile?.name.orEmpty()) }
    var bio by remember { mutableStateOf(profile?.bio.orEmpty()) }
    var primaryCraft by remember { mutableStateOf(profile?.primary_craft.orEmpty()) }
    var secondaryCrafts by remember {
        mutableStateOf(profile?.secondary_crafts.orEmpty().toMutableStateList())
    }
    var city by remember { mutableStateOf(profile?.city.orEmpty()) }
    var region by remember { mutableStateOf(profile?.state.orEmpty()) }
    var travelRadius by remember { mutableStateOf(profile?.travel_radius_km ?: 50f) }
    var gender by remember { mutableStateOf(profile?.gender.orEmpty()) }
    var dateOfBirth by remember { mutableStateOf(profile?.date_of_birth.orEmpty()) }
    var languages by remember {
        mutableStateOf(profile?.languageEntries?.mapNotNull { it.lang }.orEmpty().toMutableStateList())
    }
    var availabilityStatus by remember { mutableStateOf(profile?.availabilityStatus.orEmpty()) }
    var availabilityNote by remember { mutableStateOf(profile?.availabilityNote.orEmpty()) }

    var photoError by remember { mutableStateOf<String?>(null) }

    val photoPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        try {
            val resolver = context.contentResolver
            val bytes = resolver.openInputStream(uri)?.use { it.readBytes() }
            if (bytes == null || bytes.isEmpty()) {
                photoError = "Could not read that image"
                return@rememberLauncherForActivityResult
            }
            if (bytes.size > MAX_PHOTO_BYTES) {
                photoError = "Image is too large (max 8 MB)"
                return@rememberLauncherForActivityResult
            }
            val filename = resolver.query(uri, null, null, null, null)?.use { cursor ->
                val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index >= 0 && cursor.moveToFirst()) cursor.getString(index) else null
            } ?: "profile-${System.currentTimeMillis()}.jpg"
            val contentType = resolver.getType(uri) ?: "image/jpeg"
            photoError = null
            onPickPhoto(bytes, filename, contentType)
        } catch (e: Exception) {
            photoError = e.message ?: "Could not read that image"
        }
    }

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Cine.BgSecondary,
        contentColor = Cine.TextPrimary,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            Text(
                text = "Edit profile",
                style = MaterialTheme.typography.headlineSmall,
                color = Cine.TextPrimary,
            )
            Text(
                text = "This is what production houses see when they open your profile.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )

            Spacer(Modifier.height(18.dp))

            // ── Photo ──────────────────────────────────────────────
            Row(verticalAlignment = Alignment.CenterVertically) {
                ProfileAvatar(url = profile?.photo_url, size = 72.dp)
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    SecondaryButton(
                        text = if (uploadingPhoto) "Uploading…" else "Change photo",
                        icon = Icons.Filled.CameraAlt,
                        enabled = !uploadingPhoto,
                        onClick = {
                            photoPicker.launch(
                                PickVisualMediaRequest(
                                    ActivityResultContracts.PickVisualMedia.ImageOnly
                                )
                            )
                        },
                    )
                    if (photoError != null) {
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text = photoError.orEmpty(),
                            style = MaterialTheme.typography.bodySmall,
                            color = Cine.ErrorText,
                        )
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            CineTextField(
                value = name,
                onValueChange = { name = it },
                label = "Full name",
                placeholder = "e.g. Kabir Mehra",
            )

            Spacer(Modifier.height(12.dp))

            // ── Primary craft ──────────────────────────────────────
            Text(
                text = "Primary craft",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
            Spacer(Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ProfileOptions.crafts.take(10).forEach { craft ->
                    CineChip(
                        text = craft,
                        selected = primaryCraft == craft,
                        onClick = { primaryCraft = if (primaryCraft == craft) "" else craft },
                        icon = Icons.Filled.Check,
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Secondary crafts ───────────────────────────────────
            Text(
                text = "Also skilled in",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
            Spacer(Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ProfileOptions.crafts.forEach { craft ->
                    CineChip(
                        text = craft,
                        selected = craft in secondaryCrafts,
                        onClick = {
                            if (craft in secondaryCrafts) {
                                secondaryCrafts.remove(craft)
                            } else {
                                secondaryCrafts.add(craft)
                            }
                        },
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            CineTextField(
                value = city,
                onValueChange = { city = it },
                label = "City",
                placeholder = "Mumbai",
            )

            Spacer(Modifier.height(12.dp))

            CineTextField(
                value = region,
                onValueChange = { region = it },
                label = "State",
                placeholder = "Maharashtra",
            )

            Spacer(Modifier.height(16.dp))

            // ── Travel radius ──────────────────────────────────────
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Travel radius",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = "${travelRadius.toInt()} km",
                    style = MaterialTheme.typography.labelMedium,
                    color = Cine.AccentGold,
                )
            }
            Slider(
                value = travelRadius,
                onValueChange = { travelRadius = it },
                valueRange = 0f..1000f,
                steps = 19,
            )

            Spacer(Modifier.height(8.dp))

            // ── Gender ─────────────────────────────────────────────
            Text(
                text = "Gender",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
            Spacer(Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ProfileOptions.genders.forEach { option ->
                    CineChip(
                        text = option,
                        selected = gender == option,
                        onClick = { gender = if (gender == option) "" else option },
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            CineTextField(
                value = dateOfBirth,
                onValueChange = { dateOfBirth = it },
                label = "Date of birth",
                placeholder = "YYYY-MM-DD",
            )

            Spacer(Modifier.height(16.dp))

            // ── Languages ──────────────────────────────────────────
            Text(
                text = "Languages",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
            Spacer(Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ProfileOptions.languages.forEach { option ->
                    CineChip(
                        text = option,
                        selected = option in languages,
                        onClick = {
                            if (option in languages) {
                                languages.remove(option)
                            } else {
                                languages.add(option)
                            }
                        },
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Availability ───────────────────────────────────────
            Text(
                text = "Availability",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
            Spacer(Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ProfileOptions.availabilityStatuses.forEach { option ->
                    CineChip(
                        text = option,
                        selected = availabilityStatus == option,
                        onClick = {
                            availabilityStatus =
                                if (availabilityStatus == option) "" else option
                        },
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            CineTextField(
                value = availabilityNote,
                onValueChange = { availabilityNote = it },
                label = "Availability note",
                placeholder = "e.g. Available for feature films from November 2026",
                singleLine = false,
                minLines = 2,
            )

            Spacer(Modifier.height(16.dp))

            CineTextField(
                value = bio,
                onValueChange = { bio = it },
                label = "Bio",
                placeholder = "Two or three lines about your work",
                singleLine = false,
                minLines = 5,
            )

            Spacer(Modifier.height(22.dp))

            GoldButton(
                text = if (saving) "Saving…" else "Save changes",
                enabled = !saving,
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    onSave(
                        ProfileDraft(
                            name = name.trim(),
                            bio = bio.trim(),
                            primaryCraft = primaryCraft.trim(),
                            secondaryCrafts = secondaryCrafts.toList(),
                            city = city.trim(),
                            state = region.trim(),
                            travelRadiusKm = travelRadius.toInt(),
                            gender = gender.trim(),
                            dateOfBirth = dateOfBirth.trim(),
                            languages = languages.map { LanguagePayload(lang = it, fluency = "Fluent") },
                            availabilityStatus = availabilityStatus.trim(),
                            availabilityNote = availabilityNote.trim(),
                        )
                    )
                },
            )
        }
    }
}
