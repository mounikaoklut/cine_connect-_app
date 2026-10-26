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
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.ui.components.CineChip
import com.cineconnect.talent.ui.components.CineTextField
import com.cineconnect.talent.ui.components.GoldButton
import com.cineconnect.talent.ui.components.SecondaryButton
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

private const val MAX_UPLOAD_BYTES = 12 * 1024 * 1024

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadMediaSheet(
    saving: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (MediaDraft) -> Unit,
) {
    val context = LocalContext.current

    var type by remember { mutableStateOf("photo") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var remoteUrl by remember { mutableStateOf("") }
    var pickedName by remember { mutableStateOf<String?>(null) }
    var pickedBytes by remember { mutableStateOf<ByteArray?>(null) }
    var pickedType by remember { mutableStateOf<String?>(null) }
    var pickError by remember { mutableStateOf<String?>(null) }

    fun handlePicked(uri: Uri, mediaType: String) {
        try {
            val resolver = context.contentResolver
            val bytes = resolver.openInputStream(uri)?.use { it.readBytes() }
            if (bytes == null) {
                pickError = "Could not read that file"
                return
            }
            if (bytes.size > MAX_UPLOAD_BYTES) {
                pickError = "File is too large (max 12 MB)"
                return
            }
            val name = resolver.query(uri, null, null, null, null)?.use { cursor ->
                val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index >= 0 && cursor.moveToFirst()) cursor.getString(index) else null
            } ?: "upload-${System.currentTimeMillis()}.jpg"

            pickedBytes = bytes
            pickedName = name
            pickedType = resolver.getType(uri) ?: if (mediaType == "video") "video/mp4" else "image/jpeg"
            type = mediaType
            pickError = null
        } catch (e: Exception) {
            pickError = e.message ?: "Could not read that file"
        }
    }

    val photoPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri -> uri?.let { handlePicked(it, "photo") } }

    val videoPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri -> uri?.let { handlePicked(it, "video") } }

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
                text = "Publish media",
                style = MaterialTheme.typography.headlineSmall,
                color = Cine.TextPrimary,
            )
            Text(
                text = "Show producers what you can do.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )

            Spacer(Modifier.height(18.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                CineChip(
                    text = "Photo",
                    selected = type == "photo",
                    onClick = { type = "photo" },
                    icon = Icons.Filled.PhotoCamera,
                )
                CineChip(
                    text = "Video",
                    selected = type == "video",
                    onClick = { type = "video" },
                    icon = Icons.Filled.Movie,
                )
                CineChip(
                    text = "Audio",
                    selected = type == "audio",
                    onClick = { type = "audio" },
                )
            }

            Spacer(Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SecondaryButton(
                    text = "Photo",
                    icon = Icons.Filled.PhotoCamera,
                    onClick = {
                        photoPicker.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },
                    modifier = Modifier.weight(1f),
                    horizontalPadding = 12.dp,
                )
                SecondaryButton(
                    text = "Video",
                    icon = Icons.Filled.Movie,
                    onClick = {
                        videoPicker.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                        )
                    },
                    modifier = Modifier.weight(1f),
                    horizontalPadding = 12.dp,
                )
            }

            if (pickedName != null) {
                Spacer(Modifier.height(14.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Cine.EmeraldSoft, RoundedCornerShape(Radii.md))
                        .border(1.dp, Cine.EmeraldBorder, RoundedCornerShape(Radii.md))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        imageVector = Icons.Filled.Upload,
                        contentDescription = null,
                        tint = Cine.BadgeEmeraldText,
                        modifier = Modifier.size(16.dp),
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = pickedName.orEmpty(),
                        style = MaterialTheme.typography.bodySmall,
                        color = Cine.BadgeEmeraldText,
                        maxLines = 1,
                    )
                }
            }

            if (pickError != null) {
                Spacer(Modifier.height(12.dp))
                Text(
                    text = pickError.orEmpty(),
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.ErrorText,
                )
            }

            Spacer(Modifier.height(16.dp))

            CineTextField(
                value = title,
                onValueChange = { title = it },
                label = "Title",
                placeholder = "e.g. Brutalist Short Film",
            )

            Spacer(Modifier.height(12.dp))

            CineTextField(
                value = remoteUrl,
                onValueChange = { remoteUrl = it },
                label = "Or paste a media link",
                placeholder = "https://…",
            )

            Spacer(Modifier.height(12.dp))

            CineTextField(
                value = description,
                onValueChange = { description = it },
                label = "Description",
                placeholder = "What was your role?",
                singleLine = false,
                minLines = 3,
            )

            Spacer(Modifier.height(20.dp))

            GoldButton(
                text = if (saving) "Publishing…" else "Publish",
                enabled = !saving,
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    onSubmit(
                        MediaDraft(
                            type = type,
                            title = title.trim(),
                            description = description.trim(),
                            remoteUrl = remoteUrl.trim(),
                            bytes = pickedBytes,
                            filename = pickedName,
                            contentType = pickedType,
                        )
                    )
                },
            )
        }
    }
}
