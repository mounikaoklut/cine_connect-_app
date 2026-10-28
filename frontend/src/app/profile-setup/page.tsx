"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  User,
  Briefcase,
  Star,
  Film,
  Clapperboard,
  Calendar,
  ChevronDown,
  Check,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import styles from "./profile-setup.module.css";

// ─── Options matching user requirements ────────────────────────────────────
const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];

const PRIMARY_ROLES = [
  "Select",
  "Actor / Actress",
  "Director",
  "Screenwriter",
  "Cinematographer / DoP",
  "Producer",
  "Editor",
  "Music Composer",
  "Sound Designer",
  "Stunt Coordinator",
];

const EXPERIENCE_LEVELS = [
  "Select",
  "Beginner (< 1 year)",
  "Emerging (1–3 years)",
  "Intermediate (3–5 years)",
  "Experienced (5–10 years)",
  "Veteran (10+ years)",
];

const SKILLS_LIST = [
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
];

export default function SinglePageMobileProfile() {
  // Form Fields State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [stageName, setStageName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("Female");
  const [languages, setLanguages] = useState("");
  const [primaryRole, setPrimaryRole] = useState("Select");
  const [experience, setExperience] = useState("Select");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Dialogue delivery",
    "Singing",
  ]);
  const [aboutYou, setAboutYou] = useState("");
  const [showreelUrl, setShowreelUrl] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Profile Completion %
  const calculateCompletion = () => {
    let score = 20; // Account created
    if (fullName && email) score += 20;
    if (primaryRole !== "Select" && experience !== "Select") score += 20;
    if (selectedSkills.length > 0) score += 20;
    if (avatarUrl) score += 10;
    if (showreelUrl) score += 10;
    return Math.min(score, 100);
  };

  const completionPercent = calculateCompletion();

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => {
      alert("Profile successfully saved to CineConnect!");
      setIsSaved(false);
    }, 400);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mobileAppContainer}>
        {/* ── 1. Android Mobile Status Bar ── */}
        <div className={styles.statusBar}>
          <span>9:41</span>
          <div className={styles.statusIcons}>
            <span>5G 100%</span>
          </div>
        </div>

        {/* ── 2. Top App Header (Unified Single Page) ── */}
        <header className={styles.appHeader}>
          <div className={styles.logoGroup}>
            <div className={styles.logoBox}>
              <Clapperboard size={18} color="#080a0f" strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>
              Cine<span className={styles.logoTextAmber}>Connect</span>
            </span>
          </div>

          <span className={styles.stepIndicator}>
            Profile Setup
          </span>

          <button
            className={styles.saveExitButton}
            onClick={handleSaveProfile}
          >
            Save &amp; exit
          </button>
        </header>

        {/* ── 3. Amber Real-Time Completion Progress Line ── */}
        <div className={styles.progressLineTrack}>
          <div
            className={styles.progressLineFilled}
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* ── 4. Main Scrollable Form Area — ALL SECTIONS IN A SINGLE PAGE ── */}
        <main className={styles.formScrollArea}>
          {/* ── Section 1: Profile Photo & Completion Widget ── */}
          <section className={styles.sectionCard}>
            <div className={styles.photoContainer}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <div
                className={styles.avatarCircle}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  <User size={38} color="#f59e0b" />
                )}
              </div>

              <div className={styles.photoMeta}>
                <div style={{ fontSize: "0.98rem", fontWeight: "700", color: "#f8fafc" }}>
                  Profile photo
                </div>
                <p className={styles.photoHint}>
                  A clear, front-facing headshot works best. JPG or PNG, up to 5MB
                </p>
                <button
                  className={styles.uploadPhotoBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  Upload photo
                </button>
              </div>
            </div>

            {/* Profile Completion Progress & Checklist */}
            <div className={styles.completionWidget}>
              <div className={styles.completionHeader}>
                <span className={styles.completionLabel}>Profile completion</span>
                <span className={styles.completionPercent}>{completionPercent}%</span>
              </div>
              <div className={styles.completionTrack}>
                <div
                  className={styles.completionFill}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <div className={styles.stepsChecklist}>
                <div className={styles.stepCheckItem}>
                  <div className={`${styles.stepDot} ${styles.stepDotDone}`} />
                  <span>Account created</span>
                </div>
                <div className={styles.stepCheckItem}>
                  <div
                    className={`${styles.stepDot} ${
                      fullName ? styles.stepDotDone : styles.stepDotActive
                    }`}
                  />
                  <span>Basic information</span>
                </div>
                <div className={styles.stepCheckItem}>
                  <div
                    className={`${styles.stepDot} ${
                      primaryRole !== "Select" ? styles.stepDotDone : styles.stepDotActive
                    }`}
                  />
                  <span>Professional details</span>
                </div>
                <div className={styles.stepCheckItem}>
                  <div
                    className={`${styles.stepDot} ${
                      selectedSkills.length > 0 ? styles.stepDotDone : styles.stepDotPending
                    }`}
                  />
                  <span>Skills and portfolio</span>
                </div>
              </div>
            </div>

            {/* Pro Tip Callout */}
            <div className={styles.tipCallout}>
              <span style={{ fontSize: "14px" }}>💡</span>
              <p className={styles.tipText}>
                <strong>Tip:</strong> Add a showreel since casting teams can judge your range at a glance.
              </p>
            </div>
          </section>

          {/* ── Section 2: Basic Information ── */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconBox}>
                <User size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Basic information</h2>
                <p className={styles.sectionSubtitle}>
                  How production houses will see and contact you
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Full name</label>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Stage Name */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>
                Stage name <span className={styles.optionalTag}>(optional)</span>
              </label>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Name you work under"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Email</label>
              <input
                className={styles.textInput}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Phone number</label>
              <input
                className={styles.textInput}
                type="tel"
                placeholder="+91 00000-00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Date of Birth */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Date of birth</label>
              <input
                className={styles.textInput}
                type="date"
                placeholder="dd-mm-yyyy"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            {/* City */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>City</label>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Where are you based?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Gender Chips (Amber Theme) */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Gender</label>
              <div className={styles.chipsRow}>
                {GENDER_OPTIONS.map((g) => {
                  const isActive = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      className={`${styles.chipButton} ${
                        isActive ? styles.chipButtonActive : ""
                      }`}
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages you perform in */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Languages you perform in</label>
              <input
                className={styles.textInput}
                type="text"
                placeholder="e.g. Telugu, Hindi, English"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
            </div>
          </section>

          {/* ── Section 3: Professional Details ── */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconBox}>
                <Briefcase size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Professional details</h2>
                <p className={styles.sectionSubtitle}>Your craft and experience</p>
              </div>
            </div>

            {/* Primary Role */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Primary role</label>
              <div className={styles.selectBox}>
                <select
                  className={styles.selectElement}
                  value={primaryRole}
                  onChange={(e) => setPrimaryRole(e.target.value)}
                >
                  {PRIMARY_ROLES.map((role) => (
                    <option key={role} value={role} style={{ background: "#121828", color: "#f8fafc" }}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className={styles.dropdownArrow} />
              </div>
            </div>

            {/* Experience */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Experience</label>
              <div className={styles.selectBox}>
                <select
                  className={styles.selectElement}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp} style={{ background: "#121828", color: "#f8fafc" }}>
                      {exp}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className={styles.dropdownArrow} />
              </div>
            </div>
          </section>

          {/* ── Section 4: Skills and About You ── */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconBox}>
                <Star size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Skills and about you</h2>
                <p className={styles.sectionSubtitle}>
                  Pick what you do best, then say it in your own words
                </p>
              </div>
            </div>

            {/* Skills Chip Tags (Amber Theme) */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Skills</label>
              <div className={styles.chipsRow}>
                {SKILLS_LIST.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`${styles.chipButton} ${
                        isSelected ? styles.chipButtonActive : ""
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About You Textarea */}
            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>About you</label>
              <textarea
                className={styles.textareaInput}
                placeholder="Tell casting directors about yourself, your training, dialect proficiencies, and what roles excite you..."
                value={aboutYou}
                onChange={(e) => setAboutYou(e.target.value)}
              />
            </div>
          </section>

          {/* ── Section 5: Portfolio & Showreel ── */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconBox}>
                <Film size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Portfolio &amp; showreel</h2>
                <p className={styles.sectionSubtitle}>
                  Links to your work — YouTube, Vimeo, or cloud storage
                </p>
              </div>
            </div>

            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>Showreel URL</label>
              <input
                className={styles.textInput}
                type="url"
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                value={showreelUrl}
                onChange={(e) => setShowreelUrl(e.target.value)}
              />
            </div>

            <div className={styles.inputField}>
              <label className={styles.fieldTitle}>
                Additional portfolio links <span className={styles.optionalTag}>(optional)</span>
              </label>
              <textarea
                className={styles.textareaInput}
                placeholder="Add IMDb profile, personal website, or links (one per line)..."
                value={portfolioLinks}
                onChange={(e) => setPortfolioLinks(e.target.value)}
              />
            </div>
          </section>
        </main>

        {/* ── 5. Sticky Bottom Action Bar (Save All in One Action) ── */}
        <div className={styles.stickyBottomBar}>
          <button
            className={styles.continueButton}
            onClick={handleSaveProfile}
          >
            <span>{isSaved ? "Saved Successfully!" : "Save & Complete Profile"}</span>
            <Check size={18} strokeWidth={2.5} />
          </button>

          {/* Android Home Navigation Gesture Pill */}
          <div className={styles.gesturePillLine} />
        </div>
      </div>
    </div>
  );
}
