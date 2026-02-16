# App Store Compliance Report

**Generated**: {{timestamp}}
**Project**: {{app_name}}
**Bundle ID**: {{bundle_id}}
**Version**: {{version}} ({{build}})

---

## Summary

✅ **Passed**: {{passed_count}} checks
⚠️  **Warnings**: {{warning_count}} issues
❌ **Critical**: {{critical_count}} issues

**Submission Ready**: {{submission_ready}}

{{#if critical_issues}}
⚠️ **Action Required**: Fix {{critical_count}} critical issues before submission
{{/if}}

---

## Critical Issues (Must Fix Before Submission)

{{#each critical_issues}}
### {{@index}}. ❌ {{category}}: {{title}}

**Location**: {{location}}
**Impact**: {{impact}}
**Fix**: {{fix}}

{{#if code_example}}
```{{language}}
{{code_example}}
```
{{/if}}

---
{{/each}}

{{#unless critical_issues}}
✅ No critical issues found
{{/unless}}

---

## Warnings (Should Fix)

{{#each warnings}}
### {{@index}}. ⚠️ {{category}}: {{title}}

**Location**: {{location}}
**Recommendation**: {{recommendation}}

{{#if details}}
**Details**: {{details}}
{{/if}}

---
{{/each}}

{{#unless warnings}}
✅ No warnings
{{/unless}}

---

## Passed Checks

✅ **Technical**: {{technical_passed}} / {{technical_total}} checks
✅ **Metadata**: {{metadata_passed}} / {{metadata_total}} checks
✅ **Privacy**: {{privacy_passed}} / {{privacy_total}} checks
✅ **Content**: {{content_passed}} / {{content_total}} checks
✅ **Monetization**: {{monetization_passed}} / {{monetization_total}} checks
✅ **Localization**: {{localization_passed}} / {{localization_total}} checks

**Total**: {{passed_count}} / {{total_checks}} checks passed

---

## Key Deadlines

⚠️ **April 28, 2026**: Apps must be built with Xcode 26 and iOS 26 SDK
⚠️ **January 31, 2026**: Age rating questionnaire must be updated with new ratings (13+, 16+, 18+)

{{#if sdk_compliant}}
✅ SDK requirement met (iOS {{sdk_version}} SDK)
{{else}}
❌ SDK requirement NOT met - update to iOS 26 SDK before April 28, 2026
{{/if}}

{{#if age_rating_updated}}
✅ Age rating guidance followed
{{else}}
⚠️ Ensure age rating questionnaire is updated by January 31, 2026
{{/if}}

---

## App Store Connect Reminders

Complete these items in App Store Connect before submission:

- [{{privacy_label_status}}] Privacy Nutrition Label completed
- [{{age_rating_status}}] Age rating questionnaire updated (new format)
- [{{screenshots_status}}] Screenshots uploaded (1320x2868 iPhone, 2064x2752 iPad)
- [{{metadata_status}}] App metadata: name (≤30 chars), subtitle (≤30 chars), description (≤4000 chars), keywords (≤100 chars)
- [{{urls_status}}] Privacy policy and support URLs provided
- [{{iap_status}}] In-App Purchases configured (if applicable)
- [{{accessibility_status}}] Accessibility Nutrition Label completed

**Status Legend**: ✅ Complete | ⚠️ Check | ❓ Unknown

---

## Detected Configurations

**Platforms**: {{#each platforms}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Localizations**: {{localization_count}} languages ({{#each localizations}}{{this}}{{#unless @last}}, {{/unless}}{{/each}})
**Frameworks Detected**: {{#each frameworks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Permissions Requested**: {{permission_count}} ({{#each permissions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}})

{{#if third_party_sdks}}
**Third-Party SDKs**: {{#each third_party_sdks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
⚠️ Ensure all SDK data collection is disclosed in Privacy Nutrition Label
{{/if}}

---

## Next Steps

{{#if critical_issues}}
### 1. Fix Critical Issues
Address the {{critical_count}} critical issues listed above:
{{#each critical_issues}}
- {{title}} ({{location}})
{{/each}}

### 2. Re-run Validation
After fixing issues, run validation again:
```bash
/appstore-check
```

### 3. Review Warnings
Consider addressing {{warning_count}} warnings to improve app quality

### 4. TestFlight Beta
Submit to TestFlight for external testing

### 5. Final Submission
Submit to App Store via App Store Connect
{{else}}
### 1. Review Warnings
Address {{warning_count}} warnings to improve app quality

### 2. Complete App Store Connect Checklist
Verify all App Store Connect items are complete

### 3. TestFlight Beta Testing
Submit to TestFlight for external testing before final submission

### 4. Submit to App Store
Your app meets technical requirements - ready for submission! 🎉
{{/if}}

---

## Resources

- **Full Requirements**: docs/research/2026-02-16-apple-appstore-requirements.md
- **Official Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **SDK Requirements**: https://developer.apple.com/news/upcoming-requirements/
- **Privacy Details**: https://developer.apple.com/app-store/app-privacy-details/
- **TestFlight**: https://developer.apple.com/testflight/

---

**Validation State**: Saved to `.appstore-validation.json`
**Next Recommended Check**: {{next_check_date}}
