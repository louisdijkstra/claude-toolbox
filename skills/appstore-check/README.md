# App Store Requirements Checker

Comprehensive validation skill for iOS/iPadOS apps against Apple App Store submission requirements (2026).

## Overview

This skill validates your iOS/iPadOS app against all Apple App Store requirements and generates a detailed compliance report with automated fix suggestions.

## Features

- **6-Phase Validation**: Technical, Metadata, Privacy, Content, Monetization, Localization
- **Detailed Reports**: ✅/⚠️/❌ format with file paths and specific fixes
- **Interactive Fixes**: Offers to fix issues automatically when safe
- **Progress Tracking**: Saves validation state for tracking improvements
- **2026 Compliance**: Includes latest requirements (SDK deadline, age ratings)

## Usage

### Basic Validation
```bash
/appstore-check
```

The skill will:
1. Discover your Xcode project
2. Run all 6 validation phases
3. Generate a compliance report
4. Offer to fix issues interactively

### When to Use

- **During Development**: Proactive compliance checking (weekly or before milestones)
- **Pre-Submission**: Final validation before App Store submission
- **After Updates**: Re-validate when Apple announces new requirements
- **CI/CD**: Automated compliance checks in build pipeline

## Validation Phases

### 1. Technical Requirements
- SDK version (iOS 26+ required after April 28, 2026)
- Code signing and certificates
- Bundle configuration
- 64-bit support

### 2. Metadata and Assets
- App icons (1024x1024 App Store icon)
- Required icon sizes
- Screenshot recommendations
- Metadata completeness

### 3. Privacy and Permissions
- Info.plist usage descriptions
- Privacy Nutrition Labels
- App Tracking Transparency
- Third-party SDK disclosure

### 4. Content Policy
- Age rating compliance (new 13+, 16+, 18+ by Jan 31, 2026)
- Content restrictions
- Accessibility support (VoiceOver, Dynamic Type)
- Accessibility Nutrition Labels

### 5. Monetization
- In-App Purchase configuration
- Subscription management UI
- Loan app compliance (APR ≤ 36%)

### 6. Localization
- Language support (38 available)
- Localization completeness
- App Store Connect localizations

## Output

### Compliance Report
Generated at: `appstore-compliance-report.md`

Includes:
- Summary (✅ passed, ⚠️ warnings, ❌ critical)
- Detailed issues with locations and fixes
- App Store Connect checklist
- Next steps

### Validation State
Saved to: `.appstore-validation.json`

Tracks validation history for progress monitoring.

## Critical Deadlines

⚠️ **April 28, 2026**: Apps must be built with Xcode 26 and iOS/iPadOS 26 SDK
⚠️ **January 31, 2026**: Age rating questionnaire must be updated

## Files

- `SKILL.md` - Main skill instructions and validation logic
- `REFERENCE.md` - Quick reference guide with code examples
- `templates/report-template.md` - Report format template
- `README.md` - This file

## Research Foundation

Based on comprehensive research: `docs/research/2026-02-16-apple-appstore-requirements.md`

Covers all official Apple requirements from:
- App Store Review Guidelines
- App Store Connect requirements
- Privacy and accessibility standards
- Latest 2026 updates

## Examples

### Example: Clean Project
```
✅ Passed: 42 checks
⚠️  Warnings: 3 issues
❌ Critical: 0 issues

Submission Ready: YES (review warnings)
```

### Example: Issues Found
```
✅ Passed: 35 checks
⚠️  Warnings: 8 issues
❌ Critical: 4 issues

Submission Ready: NO

Critical Issues:
1. ❌ Technical: Built with iOS 25 SDK (requires iOS 26 SDK)
2. ❌ Privacy: Missing NSCameraUsageDescription
3. ❌ Metadata: No 1024x1024 App Store icon
4. ❌ Bundle: Invalid bundle identifier format
```

## Interactive Fix Mode

After generating the report, the skill offers:

1. **Fix all safe issues automatically** - Updates Info.plist, project settings
2. **Fix issues one-by-one** - Interactive mode with confirmations
3. **Just show report** - No changes

## Supported Platforms

- iOS (primary)
- iPadOS (primary)
- macOS (basic support)
- watchOS (when part of iOS app)
- tvOS (basic support)
- visionOS (basic support)

## Best Practices

1. **Run regularly**: Weekly during active development
2. **Before submission**: Final check before App Store submission
3. **After updates**: Re-validate when Apple announces changes
4. **Fix critical first**: Address ❌ issues before ⚠️ warnings
5. **Use TestFlight**: Beta test before final submission

## Anti-Patterns to Avoid

❌ Waiting until submission to validate (wastes time)
❌ Ignoring warnings (affects user experience)
❌ Skipping TestFlight (increases production bugs)
❌ Generic privacy descriptions (damages trust)
❌ Not updating age ratings by deadline (blocks submissions)

## Resources

- **Full Research**: docs/research/2026-02-16-apple-appstore-requirements.md
- **Official Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **SDK Requirements**: https://developer.apple.com/news/upcoming-requirements/
- **Privacy Details**: https://developer.apple.com/app-store/app-privacy-details/

## Updates

This skill is based on requirements current as of February 2026. Re-validate periodically as Apple updates requirements.

## Version

- **Created**: 2026-02-16
- **Based on**: 2026 App Store requirements
- **Research**: docs/research/2026-02-16-apple-appstore-requirements.md
