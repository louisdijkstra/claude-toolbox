---
name: appstore-check
description: Validate iOS/iPadOS apps against Apple App Store submission requirements, generate compliance report, and offer automated fixes
---

# App Store Requirements Checker

## Purpose
Comprehensive validation of iOS/iPadOS apps against Apple App Store submission requirements (2026). Checks technical compliance, metadata, privacy, content policy, monetization, and localization. Generates structured report with automated fix suggestions.

## When to Use
- **Development phase**: Proactive compliance checking during active development
- **Pre-submission**: Final validation before App Store submission
- **After guideline updates**: Re-validate when Apple updates requirements
- **CI/CD integration**: Automated compliance checks in build pipeline

## Process

### Step 1: Discovery and Context

**Find Xcode Project:**
1. Search current directory for `.xcodeproj` or `.xcworkspace` files using Glob tool
2. If multiple projects found, ask user: "Found multiple Xcode projects: [list]. Which should I validate?"
3. If no projects found, ask user: "No Xcode project found. Please provide the path to your .xcodeproj or .xcworkspace file."

**Gather Context:**
Read the following files to understand the app:
- `Info.plist` (bundle identifier, version, permissions, capabilities)
- Project settings (build configuration, SDK version, deployment target)
- `Assets.xcassets` (icons, images)
- Localizations (`.lproj` directories)

**If uncertain about project structure:** Ask user: "Is this a standard Xcode project or does it use a cross-platform framework (React Native, Flutter, etc.)?"

### Step 2: Six-Phase Validation

Run all validation phases and collect results. For each phase, track:
- ✅ Passed checks (count)
- ⚠️ Warnings (non-critical issues)
- ❌ Critical failures (must fix before submission)

#### Phase 1: Technical Requirements

**SDK and Build Configuration:**
1. Check Xcode version ≥ 26 (required after April 28, 2026)
   - Read project build settings for `IPHONEOS_DEPLOYMENT_TARGET`
   - Verify SDK version ≥ iOS/iPadOS 26
   - ❌ If SDK < 26 after April 28, 2026: "Must build with iOS 26 SDK or later"

2. Check minimum deployment target
   - Read `IPHONEOS_DEPLOYMENT_TARGET` from project settings
   - ✅ Any version is valid (developer's choice)
   - ⚠️ If deployment target < iOS 15: "Consider supporting newer iOS versions for better features"

3. Validate 64-bit support
   - Check `ARCHS` setting contains `arm64`
   - ❌ If missing: "Must include 64-bit support (arm64 architecture)"

**Code Signing and Certificates:**
1. Check provisioning profile exists
   - Look for `.mobileprovision` files or embedded profiles
   - ❌ If missing: "No provisioning profile found"

2. Validate bundle identifier format
   - Read from `Info.plist`: `CFBundleIdentifier`
   - ✅ Format: reverse-DNS (e.g., com.company.appname)
   - ❌ If invalid format: "Bundle identifier must use reverse-DNS notation"

3. Check version and build numbers
   - Read `CFBundleShortVersionString` (version)
   - Read `CFBundleVersion` (build number)
   - ❌ If missing: "Version and build numbers required"
   - ⚠️ If build number not incremented: "Build number should increment with each submission"

#### Phase 2: Metadata and Assets

**App Icons:**
1. Check for 1024x1024 App Store icon
   - Search `Assets.xcassets` for AppIcon asset
   - Read `Contents.json` for icon sizes
   - ❌ If 1024x1024 missing: "App Store icon (1024x1024) required"
   - ❌ If icon has transparency: "App Store icon cannot have transparency"

2. Validate all required icon sizes present
   - Check for iPhone sizes: 60pt@2x, 60pt@3x
   - Check for iPad sizes (if iPad supported): 76pt@2x
   - ⚠️ If sizes missing: "Missing icon size: [specific size]"

3. Check for placeholder icons
   - If icon files are named "placeholder" or "default": ⚠️ "Replace placeholder icons"

**Screenshots (if applicable):**
Note: Screenshots are uploaded to App Store Connect, not in project
- ⚠️ Remind user: "Ensure screenshots are prepared: 1320x2868 (iPhone), 2064x2752 (iPad)"

**App Store Metadata:**
Note: Metadata is set in App Store Connect, not in project
- ⚠️ Remind user to verify in App Store Connect:
  - App name ≤ 30 characters
  - Subtitle ≤ 30 characters
  - Description ≤ 4,000 characters
  - Keywords ≤ 100 characters
  - Privacy policy URL
  - Support URL

#### Phase 3: Privacy and Permissions

**Privacy Usage Descriptions:**
1. Check `Info.plist` for required usage description keys
   - Common keys to check:
     - `NSCameraUsageDescription` (camera access)
     - `NSPhotoLibraryUsageDescription` (photo library)
     - `NSLocationWhenInUseUsageDescription` (location)
     - `NSMicrophoneUsageDescription` (microphone)
     - `NSContactsUsageDescription` (contacts)
     - `NSCalendarsUsageDescription` (calendar)
     - `NSUserTrackingUsageDescription` (tracking)

2. For each permission requested in code or frameworks:
   - ❌ If usage description missing: "Missing [key] in Info.plist for [feature] access"
   - ⚠️ If description is generic: "Usage description should explain WHY access is needed"

3. Validate description quality
   - ✅ Good: "We need camera access to scan QR codes for authentication"
   - ❌ Bad: "This app needs camera access" (too vague)

**App Tracking Transparency:**
1. If app uses tracking (analytics, ads, cross-app data):
   - Check for `NSUserTrackingUsageDescription` in Info.plist
   - ❌ If missing and tracking detected: "Must include NSUserTrackingUsageDescription"

2. Check for tracking permission request in code
   - Search Swift/Objective-C files for `ATTrackingManager.requestTrackingAuthorization`
   - ⚠️ If tracking description present but no request code: "Ensure tracking permission is requested at runtime"

**Privacy Nutrition Labels:**
- ⚠️ Remind user: "Complete Privacy Nutrition Label in App Store Connect"
- ⚠️ List detected frameworks that collect data: "Found [Firebase/Analytics/Ads SDK] - ensure disclosed in Privacy Label"

#### Phase 4: Content Policy

**Age Rating:**
- ⚠️ Remind user: "Age rating questionnaire must be updated by January 31, 2026 (new 13+, 16+, 18+ ratings)"
- ⚠️ "Verify age rating matches app content in App Store Connect"

**Content Restrictions:**
1. Check for inappropriate content in assets
   - Scan asset file names for keywords (basic check only)
   - ⚠️ If suspicious names found: "Review asset: [filename] for appropriate content"

2. Check for brand usage
   - Scan asset names for major brand names (Apple, Google, etc.)
   - ⚠️ If found: "Ensure you have permission to use [brand] assets"

**Accessibility:**
1. Search Swift/Objective-C files for accessibility labels
   - Grep for `accessibilityLabel`, `accessibilityHint`, `accessibilityTraits`
   - ⚠️ If very few found: "Consider adding accessibility labels to UI elements for VoiceOver support"

2. Check for Dynamic Type support
   - Grep for `UIFontTextStyle` or `.font(.body)` (SwiftUI)
   - ⚠️ If not found: "Consider supporting Dynamic Type for better accessibility"

3. Check for accessibility identifiers (for testing)
   - Grep for `accessibilityIdentifier`
   - ⚠️ If not found: "Add accessibility identifiers for UI testing"

**Accessibility Nutrition Labels:**
- ⚠️ Remind user: "Accessibility Nutrition Labels required - provide VoiceOver support details in App Store Connect"

#### Phase 5: Monetization (if applicable)

**In-App Purchases:**
1. Search for StoreKit usage
   - Grep for `SKProduct`, `SKPaymentQueue`, `StoreKit` imports
   - If found, validate:
     - ⚠️ "Ensure In-App Purchases are configured in App Store Connect"
     - ⚠️ "Verify restore purchase functionality exists"

2. Check for subscription handling
   - Grep for `SKProductSubscriptionPeriod`, subscription-related code
   - If found:
     - ⚠️ "Ensure subscription management UI exists (view status, cancel)"
     - ⚠️ "Provide clear pricing before purchase"

**Loan Apps (if detected):**
- Search for financial/loan-related keywords in code/assets
- ⚠️ If loan app: "Loan apps must have APR ≤ 36% (including fees) and repayment > 60 days"

#### Phase 6: Localization

**Language Support:**
1. Find `.lproj` directories
   - Count localizations (e.g., en.lproj, es.lproj, fr.lproj)
   - ✅ List supported languages

2. Check for complete localizations
   - For each .lproj, verify `Localizable.strings` or `.stringsdict` files exist
   - ⚠️ If incomplete: "Localization [language] missing Localizable.strings"

3. Validate base internationalization
   - Check for `Base.lproj` directory
   - ✅ If present: "Using base internationalization (good practice)"

**App Store Connect Localizations:**
- ⚠️ Remind user: "App Store supports 38 languages - localize metadata in App Store Connect for target markets"

### Step 3: Generate Compliance Report

**Format the report using this structure:**

```
# App Store Compliance Report
Generated: [timestamp]
Project: [app name from Info.plist]
Bundle ID: [bundle identifier]

## Summary
✅ Passed: [count] checks
⚠️  Warnings: [count] issues
❌ Critical: [count] issues

**Submission Ready:** [YES/NO]
- If critical issues > 0: NO
- If critical issues = 0: YES (but review warnings)

## Critical Issues (Must Fix Before Submission)
[List all ❌ issues with:]
1. ❌ [Category]: [Issue description]
   - Location: [file path or App Store Connect]
   - Impact: [Why this blocks submission]
   - Fix: [Specific steps to resolve]

## Warnings (Should Fix)
[List all ⚠️ issues with:]
1. ⚠️ [Category]: [Issue description]
   - Location: [file path or setting]
   - Recommendation: [What to do]

## Passed Checks
✅ Technical: [count] checks passed
✅ Metadata: [count] checks passed
✅ Privacy: [count] checks passed
✅ Content: [count] checks passed
✅ Monetization: [count] checks passed
✅ Localization: [count] checks passed

## Key Deadlines
⚠️ April 28, 2026: Apps must be built with Xcode 26 and iOS 26 SDK
⚠️ January 31, 2026: Age rating questionnaire must be updated

## App Store Connect Reminders
[List items that must be completed in App Store Connect:]
- [ ] Privacy Nutrition Label completed
- [ ] Age rating questionnaire updated
- [ ] Screenshots uploaded (1320x2868 iPhone, 2064x2752 iPad)
- [ ] App metadata: name, subtitle, description, keywords
- [ ] Privacy policy and support URLs provided
- [ ] In-App Purchases configured (if applicable)
- [ ] Accessibility Nutrition Label completed

## Next Steps
[If critical issues > 0:]
1. Fix [count] critical issues listed above
2. Re-run validation: /appstore-check
3. Submit to TestFlight for beta testing
4. Submit to App Store

[If no critical issues:]
1. Review [count] warnings
2. Complete App Store Connect checklist
3. Submit to TestFlight for beta testing
4. Submit to App Store

---
Full requirements: docs/research/2026-02-16-apple-appstore-requirements.md
```

**Save the report:**
- Create `appstore-compliance-report.md` in project root
- Or ask user: "Where should I save the compliance report?"

### Step 4: Interactive Fix Session

After generating the report, offer to fix issues interactively:

**Present options:**
```
Report generated: [path to report]

Would you like me to help fix these issues?
1. Fix all safe issues automatically (Info.plist, project settings)
2. Fix issues one-by-one interactively (I'll ask before each change)
3. Just show me the report (no changes)
```

**If user chooses option 1 or 2:**

For each fixable issue, attempt automatic resolution:

**Automatically Fixable Issues:**

1. **Missing Info.plist keys:**
   - Add required usage description keys with template text
   - Example: `NSCameraUsageDescription` = "This app needs camera access to [feature]"
   - ⚠️ Tell user: "Added template description - please update with specific reason"

2. **Missing icons:**
   - Cannot auto-fix, but provide guidance
   - Tell user: "Create 1024x1024 PNG icon and add to Assets.xcassets AppIcon set"

3. **Bundle identifier format:**
   - Suggest correct format based on current identifier
   - Ask before changing: "Change bundle ID from [current] to [suggested]?"

4. **Version/build numbers:**
   - Suggest incrementing build number
   - Ask: "Increment build number from [current] to [suggested]?"

5. **Accessibility labels:**
   - Cannot auto-fix (requires understanding UI purpose)
   - Provide template code: `button.accessibilityLabel = "Submit form"`

**For each fix:**
- Show what will change
- Ask for confirmation
- Apply change using Edit tool
- Verify change was applied correctly

**After all fixes:**
- Re-run validation to confirm issues resolved
- Generate updated report
- Show summary: "Fixed [count] issues. [count] remaining."

### Step 5: Track Progress

**Create/update validation state file:**
Save validation results to `.appstore-validation.json` in project root:

```json
{
  "last_check": "2026-02-16T10:30:00Z",
  "app_name": "MyApp",
  "bundle_id": "com.company.myapp",
  "version": "1.0.0",
  "build": "42",
  "critical_issues": 2,
  "warnings": 5,
  "passed_checks": 38,
  "submission_ready": false,
  "issues": [
    {
      "severity": "critical",
      "category": "Technical",
      "description": "Must build with iOS 26 SDK",
      "fixed": false
    }
  ]
}
```

This allows tracking progress over time and seeing improvements.

## Output Format Examples

### Example 1: Clean Project (Few Issues)

```
# App Store Compliance Report
Generated: 2026-02-16 10:30:00
Project: MyAwesomeApp
Bundle ID: com.company.myawesomeapp

## Summary
✅ Passed: 42 checks
⚠️  Warnings: 3 issues
❌ Critical: 0 issues

**Submission Ready:** YES (review warnings)

## Warnings (Should Fix)
1. ⚠️ Accessibility: Only 5 UI elements have accessibility labels
   - Location: Multiple view controllers
   - Recommendation: Add accessibilityLabel to buttons, images, and interactive elements

2. ⚠️ Localization: App supports only English
   - Location: Project localizations
   - Recommendation: Consider adding Spanish, French, German for broader reach

3. ⚠️ Metadata: Review screenshot recommendations
   - Location: App Store Connect
   - Recommendation: Use 1320x2868 for iPhone, 2064x2752 for iPad

## Passed Checks
✅ Technical: 12 checks passed
✅ Metadata: 8 checks passed
✅ Privacy: 10 checks passed
✅ Content: 5 checks passed
✅ Monetization: 4 checks passed
✅ Localization: 3 checks passed

## Next Steps
1. Review 3 warnings
2. Complete App Store Connect checklist
3. Submit to TestFlight for beta testing
4. Submit to App Store
```

### Example 2: Project with Critical Issues

```
# App Store Compliance Report
Generated: 2026-02-16 10:30:00
Project: MyApp
Bundle ID: com.example.myapp

## Summary
✅ Passed: 35 checks
⚠️  Warnings: 8 issues
❌ Critical: 4 issues

**Submission Ready:** NO

## Critical Issues (Must Fix Before Submission)
1. ❌ Technical: App built with iOS 25 SDK (requires iOS 26 SDK)
   - Location: Xcode project settings
   - Impact: Submission will be rejected after April 28, 2026
   - Fix: Update Xcode to version 26, set iOS Deployment Target to iOS 26 SDK

2. ❌ Privacy: Missing NSCameraUsageDescription in Info.plist
   - Location: Info.plist
   - Impact: App will crash when requesting camera permission
   - Fix: Add key NSCameraUsageDescription with description explaining why camera access is needed

3. ❌ Metadata: No 1024x1024 App Store icon found
   - Location: Assets.xcassets/AppIcon.appiconset
   - Impact: Cannot submit without App Store icon
   - Fix: Add 1024x1024 PNG icon (no transparency) to AppIcon asset

4. ❌ Bundle: Invalid bundle identifier format "my app"
   - Location: Info.plist -> CFBundleIdentifier
   - Impact: Invalid format will be rejected
   - Fix: Change to reverse-DNS format: com.company.myapp

## Warnings (Should Fix)
[... 8 warnings listed ...]

## Next Steps
1. Fix 4 critical issues listed above
2. Re-run validation: /appstore-check
3. Submit to TestFlight for beta testing
4. Submit to App Store
```

## Common Scenarios

### Scenario 1: First-Time Submission
**Characteristics**: Many issues, unfamiliar with process
**Approach**:
1. Generate full report to understand all requirements
2. Focus on critical issues first
3. Offer to fix safe issues automatically
4. Provide step-by-step guidance for manual fixes
5. Explain App Store Connect requirements

### Scenario 2: Update Existing App
**Characteristics**: Fewer issues, mainly checking new requirements
**Approach**:
1. Compare against previous validation (if .appstore-validation.json exists)
2. Highlight new requirements (SDK deadline, age ratings)
3. Quick validation with focus on changes
4. Remind about metadata updates if needed

### Scenario 3: Cross-Platform App (React Native, Flutter)
**Characteristics**: Different project structure, may have platform-specific issues
**Approach**:
1. Locate iOS project in platform-specific directory (ios/, android/)
2. Validate Xcode project within platform directory
3. Check for platform-specific configurations
4. Note: Cross-platform apps may need additional validation for their toolchain

### Scenario 4: CI/CD Integration
**Characteristics**: Automated check, need machine-readable output
**Approach**:
1. Run validation silently (no interactive prompts)
2. Output JSON format for parsing
3. Exit with non-zero code if critical issues found
4. Generate both human-readable and JSON reports

## Anti-Patterns to Avoid

### ❌ Skipping Validation Until Submission
**Why Bad**: Wastes time discovering issues during App Review (2-3 day delay)
**Correct Approach**: Run validation regularly during development (weekly or before major milestones)

### ❌ Ignoring Warnings
**Why Bad**: Warnings often indicate quality issues that affect user experience
**Correct Approach**: Review all warnings, prioritize accessibility and privacy warnings

### ❌ Not Testing on Real Devices
**Why Bad**: Simulator doesn't catch device-specific issues (permissions, performance)
**Correct Approach**: Always test on physical iOS/iPadOS devices before submission

### ❌ Skipping TestFlight Beta
**Why Bad**: Increases risk of bugs reaching production, poor user reviews
**Correct Approach**: Use TestFlight for external testing before final submission

### ❌ Generic Privacy Descriptions
**Why Bad**: Violates guidelines, risks rejection, damages user trust
**Correct Approach**: Provide specific, clear explanations for each permission request

### ❌ Not Updating Age Ratings (Deadline: Jan 31, 2026)
**Why Bad**: Blocks app submissions and updates until completed
**Correct Approach**: Update questionnaire proactively before deadline

### ❌ Building with Old SDK After Deadline (April 28, 2026)
**Why Bad**: Automatic rejection, wasted submission time
**Correct Approach**: Update Xcode and rebuild with iOS 26 SDK before deadline

## Error Handling

**If Xcode project cannot be parsed:**
- Ask user: "Could not read project settings. Is this a standard Xcode project?"
- Offer manual validation mode: "I can guide you through a manual checklist instead."

**If Info.plist is malformed:**
- Show error: "Info.plist has syntax errors. Please fix XML/plist formatting first."
- Suggest: "Use Xcode to open and validate Info.plist"

**If project is very large:**
- Show: "Large project detected. Validation may take 2-3 minutes."
- Validate in phases, show progress

**If cross-platform framework detected:**
- Adjust validation approach for React Native, Flutter, etc.
- Look for platform-specific directories and configurations

## When to Re-validate

**Triggers for re-validation:**
- After fixing issues from previous report
- Before every App Store submission
- After major code changes (new features, frameworks)
- When Apple announces new requirements
- After updating Xcode or iOS SDK
- Monthly during active development

## References

- Full research: `docs/research/2026-02-16-apple-appstore-requirements.md`
- Official guidelines: https://developer.apple.com/app-store/review/guidelines/
- SDK requirements: https://developer.apple.com/news/upcoming-requirements/
- Privacy details: https://developer.apple.com/app-store/app-privacy-details/
