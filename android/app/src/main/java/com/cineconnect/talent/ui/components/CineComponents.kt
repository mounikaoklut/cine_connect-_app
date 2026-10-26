package com.cineconnect.talent.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii
import com.cineconnect.talent.ui.theme.rgba

/** The page background: `--bg-primary` plus the two radial glows from `globals.css`. */
@Composable
fun CineBackground(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Cine.BgPrimary)
    ) {
        Canvas(Modifier.matchParentSize()) {
            val gold = Offset(size.width * 0.5f, -size.height * 0.15f)
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(rgba(0xF59E0BL, 0.12f), Color.Transparent),
                    center = gold,
                    radius = size.width * 1.1f
                ),
                radius = size.width * 1.1f,
                center = gold
            )
            val indigo = Offset(size.width * 0.9f, size.height * 0.85f)
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(rgba(0x6366F1L, 0.08f), Color.Transparent),
                    center = indigo,
                    radius = size.width * 0.9f
                ),
                radius = size.width * 0.9f,
                center = indigo
            )
        }
        content()
    }
}

/** `.glass-panel` */
@Composable
fun GlassPanel(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(20.dp),
    background: Color = Cine.BgGlass,
    borderColor: Color = Cine.BorderSubtle,
    shape: RoundedCornerShape = RoundedCornerShape(Radii.lg),
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier = modifier,
        color = background,
        shape = shape,
        border = BorderStroke(1.dp, borderColor),
    ) {
        Column(modifier = Modifier.padding(contentPadding), content = content)
    }
}

/** `.glass-card` */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    background: Color = Cine.BgSecondary,
    borderColor: Color = Cine.BorderSubtle,
    shape: RoundedCornerShape = RoundedCornerShape(Radii.md),
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier = modifier,
        color = background,
        shape = shape,
        border = BorderStroke(1.dp, borderColor),
    ) {
        Column(modifier = Modifier.padding(contentPadding), content = content)
    }
}

/** `.btn-primary` */
@Composable
fun GoldButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    horizontalPadding: Dp = 22.dp,
    verticalPadding: Dp = 11.dp,
) {
    val shape = RoundedCornerShape(Radii.md)
    val brush = if (enabled) {
        Brush.linearGradient(listOf(Cine.AccentGold, Cine.AccentGoldHover))
    } else {
        Brush.linearGradient(listOf(Cine.BgTertiary, Cine.BgTertiary))
    }
    Box(
        modifier = modifier
            .clip(shape)
            .background(brush)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = horizontalPadding, vertical = verticalPadding),
        contentAlignment = Alignment.Center,
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (enabled) Color.Black else Cine.TextFaint,
                    modifier = Modifier.size(16.dp),
                )
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge,
                color = if (enabled) Color.Black else Cine.TextFaint,
            )
        }
    }
}

/** `.btn-secondary` */
@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    horizontalPadding: Dp = 20.dp,
    verticalPadding: Dp = 10.dp,
) {
    val shape = RoundedCornerShape(Radii.md)
    Box(
        modifier = modifier
            .clip(shape)
            .background(Cine.SurfaceMuted)
            .border(1.dp, Cine.BorderSubtle, shape)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = horizontalPadding, vertical = verticalPadding),
        contentAlignment = Alignment.Center,
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Cine.TextPrimary,
                    modifier = Modifier.size(16.dp),
                )
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge,
                color = Cine.TextPrimary,
            )
        }
    }
}

/** `.btn-ghost` */
@Composable
fun GhostButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    color: Color = Cine.TextSecondary,
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(Radii.sm))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(13.dp),
            )
        }
        Text(text = text, style = MaterialTheme.typography.bodySmall, color = color)
    }
}

/** `.badge` / `.badge-gold` / `.badge-cyan` / `.badge-emerald` */
@Composable
fun CineBadge(
    text: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    tint: Color = Cine.BadgeGoldText,
    background: Color = Cine.AccentGoldSoft,
    border: Color = Cine.BorderGlow,
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(Radii.full))
            .background(background)
            .border(1.dp, border, RoundedCornerShape(Radii.full))
            .padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(13.dp),
            )
        }
        Text(text = text, style = MaterialTheme.typography.labelMedium, color = tint)
    }
}

/** `.input-field` */
@Composable
fun CineTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    singleLine: Boolean = true,
    minLines: Int = 1,
    keyboardType: KeyboardType = KeyboardType.Text,
    isError: Boolean = false,
    visualTransformation: VisualTransformation = VisualTransformation.None,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        label = { Text(label, style = MaterialTheme.typography.bodyMedium) },
        placeholder = placeholder?.let {
            { Text(it, style = MaterialTheme.typography.bodyMedium, color = Cine.TextGhost) }
        },
        singleLine = singleLine,
        minLines = minLines,
        isError = isError,
        visualTransformation = visualTransformation,
        shape = RoundedCornerShape(Radii.md),
        textStyle = MaterialTheme.typography.bodyLarge,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Cine.TextPrimary,
            unfocusedTextColor = Cine.TextPrimary,
            focusedContainerColor = rgba(0x0F131CL, 0.85f),
            unfocusedContainerColor = rgba(0x0F131CL, 0.85f),
            focusedBorderColor = Cine.AccentGold,
            unfocusedBorderColor = Cine.BorderSubtle,
            focusedLabelColor = Cine.AccentGold,
            unfocusedLabelColor = Cine.TextSecondary,
            cursorColor = Cine.AccentGold,
            errorBorderColor = Cine.ErrorSolid,
            errorLabelColor = Cine.ErrorText,
            errorCursorColor = Cine.ErrorSolid,
        ),
    )
}

/** The 8px gold→emerald progress track. */
@Composable
fun CineProgressTrack(
    progress: Float,
    modifier: Modifier = Modifier,
    height: Dp = 8.dp,
    gradient: List<Color> = listOf(Cine.AccentGold, Cine.AccentEmerald),
) {
    Box(
        modifier = modifier
            .height(height)
            .clip(RoundedCornerShape(Radii.full))
            .background(Cine.Track)
    ) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .clip(RoundedCornerShape(Radii.full))
                .background(Brush.horizontalGradient(gradient))
        )
    }
}

/** Section title with the gold leading icon used across the portal. */
@Composable
fun SectionHeading(
    icon: ImageVector,
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    trailing: @Composable (() -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Cine.AccentGold,
            modifier = Modifier.size(20.dp),
        )
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = Cine.TextPrimary,
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextSecondary,
                )
            }
        }
        trailing?.invoke()
    }
}

/** Selectable chip used for gender / skills. */
@Composable
fun CineChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
) {
    val shape = RoundedCornerShape(Radii.full)
    Row(
        modifier = modifier
            .clip(shape)
            .background(if (selected) Cine.AccentGoldSoft else Cine.SurfaceMuted)
            .border(
                width = 1.dp,
                color = if (selected) Cine.AccentGold else Cine.BorderSubtle,
                shape = shape
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (selected && icon != null) {
            Icon(icon, null, tint = Cine.BadgeGoldText, modifier = Modifier.size(12.dp))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = if (selected) Cine.BadgeGoldText else Cine.TextSecondary,
        )
    }
}

/** The gold brand tile with the clapperboard mark. */
@Composable
fun BrandMark(
    modifier: Modifier = Modifier,
    size: Dp = 42.dp,
    gradient: List<Color> = listOf(Cine.AccentGold, Cine.AccentGoldHover),
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.28f))
            .background(Brush.linearGradient(gradient)),
        contentAlignment = Alignment.Center,
    ) {
        ClapperboardIcon(
            modifier = Modifier.size(size * 0.56f),
            tint = Color.Black,
        )
    }
}

/**
 * Hand-drawn clapperboard so the mark matches the web's lucide icon:
 * a dark slate with gold slats, sitting on the gold brand tile.
 */
@Composable
fun ClapperboardIcon(
    modifier: Modifier = Modifier,
    tint: Color = Color.Black,
    stripeColor: Color = Cine.AccentGold,
) {
    Canvas(modifier = modifier.clipToBounds()) {
        val w = size.width
        val h = size.height
        val barHeight = h * 0.24f
        val corner = CornerRadius(w * 0.08f, w * 0.08f)

        // body
        drawRoundRect(
            color = tint,
            topLeft = Offset(0f, h * 0.28f),
            size = Size(w, h * 0.72f),
            cornerRadius = corner
        )
        // slate lines
        drawRect(
            color = stripeColor,
            topLeft = Offset(0f, h * 0.46f),
            size = Size(w, h * 0.07f)
        )
        drawRect(
            color = stripeColor,
            topLeft = Offset(0f, h * 0.60f),
            size = Size(w, h * 0.07f)
        )

        // top bar
        drawRoundRect(
            color = tint,
            topLeft = Offset(0f, 0f),
            size = Size(w, barHeight),
            cornerRadius = corner
        )
        // diagonal stripes
        clipRect(top = 0f, bottom = barHeight) {
            var x = -w * 0.12f
            while (x < w * 1.2f) {
                rotate(degrees = 28f, pivot = Offset(x + w * 0.07f, barHeight / 2f)) {
                    drawRect(
                        color = stripeColor,
                        topLeft = Offset(x, 0f),
                        size = Size(w * 0.11f, barHeight)
                    )
                }
                x += w * 0.26f
            }
        }
    }
}
