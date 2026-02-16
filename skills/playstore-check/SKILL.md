---
name: playstore-check
description: Validate Android app against Google Play Store requirements and provide remediation guidance
---

# Google Play Store Requirements Validator

## Purpose
Comprehensively validate Android apps against all 2026 Google Play Store requirements (technical, privacy, content, metadata) and provide actionable remediation steps for detected issues.

## When to Use
- Before submitting app to Play Store for the first time
- After receiving rejection notice from Play Store
- As part of pre-release quality checks
- When updating app for new Play Store requirements
- Manual invocation: `/playstore-check`

## Process

### Step 1: Locate App Files

Find the Android app project files in the current directory or ask user for location.

**What to look for:**
- `app/build.gradle` or `app/build.gradle.kts` (Gradle build file)
- `AndroidManifest.xml` (typically in `app/src/main/`)
- `.aab` or `.apk` files (if already built)
- `app/` directory structure

**If app files not found in current directory:**
Ask user: "I couldn't locate Android app files. Please provide the path to your Android project directory (containing app/build.gradle and AndroidManifest.xml)"

### Step 2: Determine Validation Scope

Check if user specified specific validation area or validate all requirements.

**Decision logic:**
- If user mentioned specific issue (e.g., "rejected for API level") → Focus on that tier first, then run full validation
- If general check → Run all four validation tiers
- If troubleshooting rejection → Ask: "What was the rejection reason provided by Play Store?" then prioritize that area

### Step 3: Run Tier 1 - Technical Validation (Blocking Issues)

These are **mandatory** requirements that will cause immediate rejection.

#### 3.1: App Format Check

**Read:** Look for `.aab` file in `app/build/outputs/bundle/` or `app/release/`

**Validation:**
- ✓ PASS: Android App Bundle (.aab) format found
- ✗ FAIL: Only APK (.apk) found or no build output

**If FAIL:**
```
❌ BLOCKING: APK format not allowed

Issue: Google Play requires Android App Bundle (.aab) format for all apps since August 2021.

Fix:
1. In Android Studio: Build > Generate Signed Bundle / APK > Select "Android App Bundle"
2. Or via command line: ./gradlew bundleRelease

Add to app/build.gradle:
```gradle
android {
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

Reference: https://developer.android.com/guide/app-bundle
```

#### 3.2: Target API Level Check

**Read:** `app/build.gradle` or `app/build.gradle.kts`

**Look for:**
```gradle
android {
    compileSdk 35
    defaultConfig {
        targetSdkVersion 35  // Must be >= 35 as of Feb 2026
        minSdkVersion 24
    }
}
```

**Validation:**
- ✓ PASS: targetSdkVersion >= 35 (Android 15)
- ⚠️ WARNING: targetSdkVersion == 34 (will fail soon)
- ✗ FAIL: targetSdkVersion < 34

**If FAIL:**
```
❌ BLOCKING: Outdated target API level

Issue: As of February 2026, new apps must target API 35 (Android 15).
Current: targetSdkVersion {actual_value}
Required: targetSdkVersion 35

Fix in app/build.gradle:
```gradle
android {
    compileSdk 35
    defaultConfig {
        targetSdkVersion 35
        minSdkVersion 24  // or your minimum
    }
}
```

After changing:
1. Sync Gradle: File > Sync Project with Gradle Files
2. Test thoroughly on Android 15 devices/emulator
3. Check for deprecated API usage: ./gradlew lintRelease
4. Rebuild: ./gradlew clean bundleRelease

Reference: https://developer.android.com/google/play/requirements/target-sdk
```

#### 3.3: App Signing Check

**Read:** `app/build.gradle` for signing configuration

**Look for:**
```gradle
android {
    signingConfigs {
        release {
            // signing configuration
        }
    }
}
```

**Validation:**
- ✓ PASS: Signing config present, Play App Signing mentioned in comments/docs
- ⚠️ WARNING: No signing config (needs setup)
- ✗ FAIL: Only v1 signing scheme

**If WARNING/FAIL:**
```
⚠️ HIGH PRIORITY: App signing not configured

Issue: Play Store requires APK Signature Scheme v2 or higher and Play App Signing enrollment.

Fix:
1. Enable Play App Signing in Play Console when uploading first release
2. Add signing config to app/build.gradle:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/keystore.jks")
            storePassword "keystore_password"
            keyAlias "key_alias"
            keyPassword "key_password"

            // Ensure v2 signing
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Security Note: NEVER commit keystore passwords to version control!
Use gradle.properties or environment variables:
```gradle
storePassword System.getenv("KEYSTORE_PASSWORD")
```

Reference: https://developer.android.com/studio/publish/app-signing
```

#### 3.4: App Size Check

**If .aab file exists:** Check file size

**Validation:**
- ✓ PASS: Base APK will be < 200MB per device config
- ⚠️ WARNING: Total size > 2GB (consider optimization)
- ✗ FAIL: Likely exceeds 4GB total compressed limit

**If WARNING/FAIL:**
```
⚠️ App size exceeds recommendations

Issue: AAB file is {size}. Play Store limits:
- 200MB per device configuration APK
- 4GB total compressed download size

Optimization strategies:

1. Enable ProGuard/R8 shrinking in app/build.gradle:
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

2. Use vector drawables instead of PNGs:
- Convert large PNGs to SVG/vector drawables
- Enable vector drawable support

3. Use WebP images:
- Android Studio: Right-click image > Convert to WebP

4. Use Play Asset Delivery for large assets:
```gradle
android {
    assetPacks = [":largeAssets"]
}
```

5. Remove unused resources:
- Analyze: ./gradlew assembleRelease --scan
- Remove unused languages in app/build.gradle:

```gradle
android {
    defaultConfig {
        resConfigs "en", "de", "fr"  // only keep needed languages
    }
}
```

Reference: https://developer.android.com/topic/performance/reduce-apk-size
```

### Step 4: Run Tier 2 - Privacy & Security Validation (High Priority)

These are **critical for approval** and common rejection reasons.

#### 4.1: Privacy Policy Check

**Ask user:** "Do you have a privacy policy URL for this app?"

**If YES:**
- Verify URL is publicly accessible (try to fetch with WebFetch tool)
- Check it's not a PDF (must be HTML page)
- Verify it covers: data collection, usage, sharing, retention, deletion

**If NO or inaccessible:**
```
❌ BLOCKING: Privacy policy required

Issue: ALL apps must have a publicly accessible privacy policy URL, even if they don't collect data.

Requirements:
- Must be active, publicly accessible URL (not PDF)
- Cannot be geofenced or require login
- Must explain:
  * What data you collect (or state you collect none)
  * How you use it
  * How you share it
  * How long you retain it
  * How users can request deletion

Quick solutions:

1. Free hosting options:
   - GitHub Pages (https://pages.github.com)
   - App Privacy Policy Generator (https://app-privacy-policy-generator.nisrulz.com)

2. Minimum viable privacy policy template:
```
[App Name] Privacy Policy

Effective Date: [Date]

Data Collection:
This app [does not collect any personal data / collects the following data: ...]

Data Usage:
[Explain how data is used]

Data Sharing:
[Explain if/how data is shared]

Data Retention:
[Explain how long data is kept]

Data Deletion:
Users can request data deletion by emailing [support email]

Contact:
[Your email]
```

3. Add URL to AndroidManifest.xml:
```xml
<application>
    <meta-data
        android:name="privacy_policy_url"
        android:value="https://yoursite.com/privacy" />
</application>
```

Reference: https://support.google.com/googleplay/android-developer/answer/9859455
```

#### 4.2: Data Safety Form Preparation

**Read:** `AndroidManifest.xml` to identify permissions

**Look for:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<!-- etc -->
```

**Analyze third-party SDKs:** Check `app/build.gradle` for common SDKs
```gradle
dependencies {
    implementation 'com.google.firebase:firebase-analytics:...'
    implementation 'com.google.android.gms:play-services-ads:...'
    // etc
}
```

**Generate Data Safety checklist:**
```
⚠️ REQUIRED: Data Safety Form must be completed in Play Console

Based on your app's permissions and SDKs, you need to declare:

Permissions found:
- INTERNET: ✓ (Required for most apps)
- ACCESS_FINE_LOCATION: ⚠️ Must declare location data collection
- CAMERA: ⚠️ Must declare photo/video collection
- [list all dangerous permissions]

Third-party SDKs detected:
- Firebase Analytics: ⚠️ Collects: analytics, device ID, usage data
- AdMob: ⚠️ Collects: advertising ID, device data, ad interaction
- [list other SDKs]

Data types you MUST declare in Play Console:
1. Location data (if using location permissions)
   - Approximate vs Precise
   - Purpose: [feature name]
   - Shared: Yes/No

2. Personal info (if collecting name, email, etc)
   - Types: [list specific fields]
   - Purpose: [account creation, etc]

3. Financial info (if handling payments)

4. Device/App info (analytics SDKs collect this)
   - Device ID
   - App interactions
   - Crash logs

Actions required:
1. Go to Play Console > App content > Data safety
2. Complete form for each data type
3. Declare data handling for ALL SDKs
4. State security practices (encryption in transit/rest)

Common mistakes:
- ❌ Not declaring SDK data collection (you're responsible for ALL data collection)
- ❌ Saying "no data collected" when using analytics/ads
- ❌ Not updating form when adding new permissions/SDKs

Reference: https://support.google.com/googleplay/android-developer/answer/10787469
```

#### 4.3: Account Deletion Check

**Read:** Source code to detect account creation capability

**Look for:**
- Authentication code (sign up, register, create account)
- Database user tables
- Firebase Authentication usage
- OAuth/OIDC integration

**If account creation found:**
```
⚠️ REQUIRED: Account deletion mechanism

Issue: Your app creates user accounts. Play Store requires you to provide account deletion.

Requirements:
1. In-app deletion option (easily discoverable)
2. OR web-based deletion with link in app
3. Process completes within reasonable time (30 days max)

Implementation options:

Option 1: In-app deletion
Add to user profile/settings screen:

```kotlin
// Example Kotlin code
Button(onClick = { showDeleteAccountDialog() }) {
    Text("Delete Account")
}

fun showDeleteAccountDialog() {
    AlertDialog(
        title = "Delete Account?",
        text = "This will permanently delete your account and all data. This cannot be undone.",
        confirmButton = {
            Button(onClick = { deleteUserAccount() }) {
                Text("Delete")
            }
        },
        dismissButton = {
            Button(onClick = { /* dismiss */ }) {
                Text("Cancel")
            }
        }
    )
}

suspend fun deleteUserAccount() {
    // 1. Delete user data from your backend
    api.deleteUser(userId)

    // 2. Delete local data
    database.clearUserData()

    // 3. Sign out
    auth.signOut()

    // 4. Navigate to welcome screen
    navigateToWelcome()
}
```

Option 2: Web-based deletion
1. Create deletion endpoint: https://yourapp.com/delete-account
2. Add link in app settings:

```kotlin
Text(
    text = "Delete your account",
    modifier = Modifier.clickable {
        openUrl("https://yourapp.com/delete-account")
    },
    color = MaterialTheme.colors.error
)
```

Documentation requirement:
Update privacy policy to include account deletion instructions.

Reference: https://support.google.com/googleplay/android-developer/answer/13316080
```

### Step 5: Run Tier 3 - Content & Metadata Validation (Approval Quality)

These affect approval success rate and discoverability.

#### 5.1: Store Listing Metadata

**Ask user for store listing info or check Play Console files:**

"Please provide your app's store listing information, or let me know if it's already in Play Console:"

**Validate each field:**

1. **App Title**
   - ✓ PASS: 1-30 characters
   - ✗ FAIL: > 30 characters or empty

2. **Short Description**
   - ✓ PASS: 1-80 characters
   - ✗ FAIL: > 80 characters or empty

3. **Full Description**
   - ✓ PASS: 10-4000 characters, well-formatted
   - ⚠️ WARNING: < 200 characters (too brief)
   - ✗ FAIL: > 4000 characters or empty

4. **App Icon**
   - ✓ PASS: 512x512px, 32-bit PNG with alpha
   - ✗ FAIL: Wrong size or format

5. **Feature Graphic**
   - ✓ PASS: 1024x500px, JPEG or PNG
   - ✗ FAIL: Wrong dimensions

6. **Screenshots**
   - ✓ PASS: 2-8 images, correct dimensions (320-3840px)
   - ✗ FAIL: < 2 screenshots or wrong dimensions

**If any FAIL:**
```
❌ Store listing incomplete or invalid

Issues found:
[List specific failures]

Requirements:

App Title:
- Length: 1-30 characters
- Example: "MyApp - Task Manager"
- Current: [if provided]

Short Description:
- Length: 1-80 characters
- Purpose: Shown in search results
- Example: "Simple task manager with reminders and cloud sync"

Full Description:
- Length: 10-4000 characters
- Format: Use line breaks, bullet points
- Include: Features, benefits, what problem it solves
- Avoid: Excessive keywords, all caps, special characters

Example template:
```
[App Name] helps you [solve problem].

KEY FEATURES:
• Feature 1
• Feature 2
• Feature 3

WHY CHOOSE [APP NAME]:
- Benefit 1
- Benefit 2

PERFECT FOR:
- Use case 1
- Use case 2

Contact: [support email]
```

App Icon (512x512px):
- Must be 32-bit PNG with alpha channel
- No rounded corners (Google adds them)
- Create in design tool or use Android Asset Studio

Feature Graphic (1024x500px):
- Landscape format
- Showcase key feature or brand
- No text that duplicates title

Screenshots:
- Minimum: 2, Maximum: 8
- Dimensions: 320px - 3840px (each side)
- Aspect ratio: Max 2:1 ratio
- Show actual app UI (not marketing material)
- Different screens per device type (phone/tablet/TV)

Tools:
- Figma/Canva for graphics
- Android Studio for screenshots (Tools > Device Manager)
- Screenshot frames: https://screenshots.pro

Reference: https://support.google.com/googleplay/android-developer/answer/9866151
```

#### 5.2: Content Rating (IARC)

**Check if content rating completed:**

Ask user: "Have you completed the IARC content rating questionnaire in Play Console?"

**If NO:**
```
⚠️ REQUIRED: Content rating (IARC questionnaire)

Issue: All apps must complete content rating before publishing.

What it is:
- Short questionnaire about app content
- Generates age ratings for different countries/regions
- Free and instant

How to complete:
1. Go to Play Console > App content > Content rating
2. Click "Start questionnaire"
3. Answer questions about:
   - Violence level
   - Sexual content
   - Controlled substances
   - Language
   - User interactions
   - Sharing of location/info

4. Rating generated immediately
5. Display rating in your store listing

Common mistakes:
- ❌ Answering "No" to user interactions when app has chat/social features
- ❌ Not disclosing in-app purchases
- ❌ Understating violence/content levels

Tip: Be honest and conservative. Understating content can lead to rejection.

Reference: https://support.google.com/googleplay/android-developer/answer/9859655
```

#### 5.3: Target Audience & Family Policy

**Check for children's content:**

Look at app description, screenshots, manifest for indicators:
- Educational content
- Child-friendly themes
- Parental controls

**Ask user:** "Does your app target children under 13, or is it a family-friendly app?"

**If YES:**
```
⚠️ SPECIAL REQUIREMENTS: Family Policy compliance

Issue: Apps targeting children have additional restrictions.

Requirements:

1. Families Policy Declaration
   - Complete in Play Console > App content > Target audience
   - Select age groups: Under 5, 6-8, 9-12, 13+

2. Privacy & Data Restrictions
   - NO precise location data (approximate only)
   - NO SDK-based device identifiers
   - Only use certified ad networks (list: https://support.google.com/googleplay/android-developer/answer/9900633)

3. Content Restrictions
   - No adult themes (violence, sexual content)
   - No gambling or simulated gambling
   - No social features without parental consent

4. Ads Requirements
   - Must use family-safe ad networks
   - No interest-based ads
   - No retargeting
   - Certified networks: AdMob (with family settings), others at link above

Implementation checklist:
□ Remove location permissions or limit to COARSE
□ Verify all SDKs are COPPA-compliant
□ Implement parental gate for external links
□ Use certified ad networks only
□ Complete Family Policy declaration
□ Test with Play Store's Family Policy checklist

Code example - Parental gate:
```kotlin
fun openExternalLink(url: String) {
    // Simple math question for parental gate
    showDialog(
        title = "Parent verification",
        message = "What is 7 + 5?",
        onCorrectAnswer = { openUrl(url) }
    )
}
```

Reference: https://support.google.com/googleplay/android-developer/answer/9893335
```

### Step 6: Run Tier 4 - Testing & Quality (Best Practice)

These improve approval chances and app quality.

#### 6.1: Testing Requirements

**Check user's developer account type:**

Ask user: "Is this a personal developer account or organization account? When was it created?"

**If personal account created after November 13, 2023:**
```
⚠️ BLOCKING (for new accounts): Testing requirements

Issue: Personal developer accounts created after Nov 13, 2023 must complete closed testing.

Requirements:
- Minimum 12 testers opted-in
- Testing period: 14 consecutive days
- Must complete BEFORE production release

Setup steps:

1. Create test track:
   - Play Console > Testing > Closed testing
   - Click "Create new release"

2. Add testers (need 12+):
   - Create email list: testers@googlegroups.com
   - Or use email addresses directly
   - Send invitation link to testers

3. Testers must:
   - Click invitation link
   - Opt-in to testing
   - Install app
   - Keep installed for 14 days

4. Monitor in Play Console:
   - Check opt-in count daily
   - Ensure 12+ opted-in continuously
   - Track for 14 consecutive days

5. After 14 days:
   - "Promote to production" button becomes available
   - Submit for production review

Workaround options:
- Use organization account (no testing requirement)
- Find 12 friends/colleagues to test
- Join testing communities (r/alphaandbetausers)

Tip: Start testing early! The 14-day countdown begins when you hit 12 opted-in testers.

Reference: https://support.google.com/googleplay/android-developer/answer/14151465
```

**If organization account or older personal account:**
```
✓ Testing requirements: Not applicable (optional but recommended)

Recommendation: Set up internal or closed testing anyway for quality assurance.

Benefits:
- Catch bugs before public release
- Test on real devices
- Gather feedback
- Iterate before production

Quick setup:
1. Play Console > Testing > Internal testing
2. Add small group (teammates, friends)
3. Test for few days
4. Fix issues found
5. Then promote to production
```

#### 6.2: App Quality Checks

**Run static analysis if possible:**

If Gradle project accessible:
```bash
./gradlew lintRelease
```

**Review common quality issues:**
```
✓ Quality recommendations

Run these checks before submission:

1. Lint warnings:
   ./gradlew lintRelease
   - Fix errors (red)
   - Review warnings (yellow)
   - Check for: deprecated APIs, security issues, performance

2. Test on multiple devices:
   - Different screen sizes (phone, tablet)
   - Different Android versions (min SDK to latest)
   - Different languages (if localized)

3. Test offline behavior:
   - Does app crash without internet?
   - Are errors handled gracefully?

4. Test edge cases:
   - Empty states (no data)
   - Network errors
   - Permission denied scenarios
   - Low storage/memory

5. Performance checks:
   - App starts in < 5 seconds
   - No ANRs (Application Not Responding)
   - Memory usage reasonable
   - Battery drain acceptable

Tools:
- Android Profiler (Android Studio)
- Firebase Performance Monitoring
- Play Console pre-launch reports (after first upload)

Reference: https://developer.android.com/quality
```

### Step 7: Generate Validation Report

Create comprehensive report with all findings.

**Report structure:**

```markdown
# Google Play Store Validation Report

Generated: [timestamp]
App: [app name if available]
Status: [READY / NEEDS FIXES / BLOCKED]

## Executive Summary

Total issues found: [count]
- 🔴 Blocking: [count] (must fix before submission)
- 🟡 High Priority: [count] (likely to cause rejection)
- 🟢 Recommended: [count] (improve approval chances)

Overall assessment: [1-2 sentence summary]

---

## 🔴 Blocking Issues (Must Fix)

Issues that will cause immediate rejection:

### Issue 1: [Issue name]
**Severity:** Blocking
**Category:** Technical / Privacy / Content

**Problem:**
[Detailed explanation]

**Fix:**
[Step-by-step remediation]
[Code examples if applicable]

**Reference:** [link]

---

## 🟡 High Priority Issues

Issues that commonly lead to rejection:

[Same format as blocking]

---

## 🟢 Recommendations

Best practices to improve approval chances:

[Same format as above]

---

## ✓ Passed Checks

Requirements already met:
- [List passed checks]

---

## Next Steps

1. [Prioritized action item 1]
2. [Prioritized action item 2]
3. [...]

After fixing issues:
1. Re-run validation: /playstore-check
2. Build release: ./gradlew bundleRelease
3. Upload to Play Console
4. Complete store listing
5. Submit for review

---

## Resources

- [Play Console](https://play.google.com/console)
- [Android Developer Documentation](https://developer.android.com)
- [Policy Center](https://play.google/developer-content-policy/)

**Estimated time to fix issues:** [rough estimate based on severity]

---

*This report is based on Google Play Store requirements as of February 2026. Requirements may change. Always verify with official Play Console documentation.*
```

### Step 8: Offer Follow-up Actions

After delivering report, ask user:

"Would you like me to:
1. Help implement specific fixes from this report?
2. Review updated files after you make changes?
3. Focus on a specific high-priority issue?
4. Generate code templates for common fixes?"

## Output Format

The skill generates a detailed markdown report with:
1. Executive summary (status + issue counts)
2. Issues categorized by severity (Blocking / High Priority / Recommended)
3. Each issue includes: problem description, step-by-step fix, code examples, references
4. List of passed checks
5. Prioritized next steps

Report is both displayed to user and saved to file for reference.

## Examples

### Example 1: First-time Submission

**Input:** User runs `/playstore-check` in Android project directory before first submission

**Process:**
1. Locate app files ✓ (found app/build.gradle)
2. Run Tier 1: Found targetSdkVersion 33 (FAIL), no AAB built yet (WARNING)
3. Run Tier 2: No privacy policy URL (FAIL)
4. Run Tier 3: No store listing info (ask user)
5. Run Tier 4: Personal account created Dec 2023 (need 12 testers)

**Output:**
```markdown
# Google Play Store Validation Report

Status: BLOCKED - Cannot submit yet

## Executive Summary

Total issues: 5
- 🔴 Blocking: 2 (API level, privacy policy)
- 🟡 High Priority: 1 (AAB not built)
- 🟢 Recommended: 2 (testing, metadata)

Overall: App not ready for submission. Fix blocking issues first.

## 🔴 Blocking Issues

### Issue 1: Outdated Target API Level
[Full details + fix as shown in Step 3.2]

### Issue 2: Missing Privacy Policy
[Full details + fix as shown in Step 4.1]

[... rest of report ...]

## Next Steps

1. Update targetSdkVersion to 35 in build.gradle
2. Create and publish privacy policy
3. Build AAB: ./gradlew bundleRelease
4. Set up closed testing (12 testers, 14 days)
5. Prepare store listing assets

Estimated time to fix: 2-4 days (including 14-day testing period)
```

### Example 2: Troubleshooting Rejection

**Input:** "My app was rejected for 'Privacy Policy violation'. Can you check what's wrong?"

**Process:**
1. Focus on Tier 2 (Privacy) first
2. User provides privacy policy URL
3. Fetch URL - it's a PDF (FAIL)
4. Check Data Safety form - user said "no data collected" but app uses Firebase Analytics (FAIL)
5. Run full validation to find other issues

**Output:**
```markdown
# Google Play Store Validation Report - Rejection Analysis

Status: ISSUES IDENTIFIED

## Executive Summary

Rejection reason analysis: Privacy Policy Violation

Root causes found:
- 🔴 Privacy policy is PDF format (not allowed)
- 🔴 Data Safety form incomplete (didn't declare Firebase data)

## 🔴 Blocking Issues

### Issue 1: Privacy Policy Invalid Format

**Problem:**
Your privacy policy URL (https://example.com/privacy.pdf) returns a PDF file.
Google Play requires privacy policies to be HTML web pages.

**Fix:**
[Detailed fix as shown in Step 4.1]

### Issue 2: Data Safety Form Incomplete

**Problem:**
Your app declares "no data collected", but Firebase Analytics SDK is present.
Firebase collects:
- Analytics identifiers
- Device information
- App interactions
- Crash logs

This is a policy violation (inaccurate declaration).

**Fix:**
[Detailed fix as shown in Step 4.2]

[... rest of report ...]

## Next Steps

1. Convert privacy policy PDF to HTML page (host on GitHub Pages)
2. Update Data Safety form in Play Console
3. Declare all Firebase Analytics data types
4. Resubmit app for review

Estimated time to fix: 2-3 hours
```

## Anti-Patterns to Avoid

### ❌ Validating without locating app files first
**Why bad:** Can't provide specific fixes without seeing actual project structure
**Do instead:** Always locate and read build.gradle, AndroidManifest.xml first

### ❌ Providing generic advice instead of specific fixes
**Why bad:** User doesn't know exactly what to do
**Do instead:** Show exact code snippets, file paths, and step-by-step instructions

### ❌ Overwhelming user with all issues at once
**Why bad:** User doesn't know where to start
**Do instead:** Categorize by severity, prioritize blocking issues, provide clear "Next Steps"

### ❌ Assuming user knows Play Console navigation
**Why bad:** Many first-time publishers are lost in Play Console
**Do instead:** Provide exact navigation paths: "Go to Play Console > App content > Data safety"

### ❌ Not checking for third-party SDK data collection
**Why bad:** #1 cause of "incorrect Data Safety form" rejections
**Do instead:** Always scan dependencies in build.gradle and flag SDK data collection

### ❌ Validating only technical requirements
**Why bad:** Privacy and content issues cause majority of rejections
**Do instead:** Run all four tiers (Technical, Privacy, Content, Quality)

### ❌ Providing outdated requirements
**Why bad:** Requirements change frequently (especially API levels)
**Do instead:** Reference research doc (docs/research/2026-02-16-google-play-store-requirements.md)

### ❌ Not offering follow-up help
**Why bad:** User may need help implementing fixes
**Do instead:** Always ask if they want help with specific fixes after report

### ❌ Missing code examples
**Why bad:** Users may not know how to implement fixes
**Do instead:** Provide Kotlin/Java code snippets for every fix that requires code changes

### ❌ Not explaining WHY rules exist
**Why bad:** User may skip fixes they don't understand importance of
**Do instead:** Add context: "This prevents malware", "This protects user privacy", etc.

## When to Revisit This Skill

Update this skill when:
1. Google announces policy changes (monitor https://support.google.com/googleplay/android-developer/announcements)
2. Target API level requirements increase (annually, usually Q3)
3. New privacy requirements added (GDPR updates, new regions)
4. Validation finds false positives/negatives
5. Research doc updated (docs/research/2026-02-16-google-play-store-requirements.md)
6. Android version releases (new APIs to check)

Review quarterly or when major Play Store policy updates announced.

## References

- Primary research: `docs/research/2026-02-16-google-play-store-requirements.md`
- Play Console Help: https://support.google.com/googleplay/android-developer
- Android Developer Docs: https://developer.android.com/google/play/requirements
- Developer Policy Center: https://play.google/developer-content-policy/
