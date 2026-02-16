# App Store Requirements Reference

Quick reference for Apple App Store submission requirements (2026).

## Critical Deadlines

### April 28, 2026: SDK Requirements
- **Requirement**: All apps must be built with Xcode 26 and iOS/iPadOS 26 SDK or later
- **Applies to**: New submissions and updates
- **Impact**: Submissions with older SDK will be rejected
- **Action**: Update Xcode to version 26, rebuild project
- **Source**: https://developer.apple.com/news/upcoming-requirements/

### January 31, 2026: Age Rating Update
- **Requirement**: Complete updated age rating questionnaire
- **New ratings**: 13+, 16+, 18+ (in addition to existing 4+, 9+)
- **Impact**: Cannot submit apps/updates until questionnaire completed
- **Action**: Update age ratings in App Store Connect
- **Source**: https://developer.apple.com/news/?id=ks775ehf

## Required Info.plist Keys by Feature

### Camera Access
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan QR codes</string>
```

### Photo Library Access
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

### Location Access
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location to show nearby restaurants</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need background location for delivery tracking</string>
```

### Microphone Access
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for voice messages</string>
```

### Contacts Access
```xml
<key>NSContactsUsageDescription</key>
<string>We need contacts access to find friends</string>
```

### Calendar Access
```xml
<key>NSCalendarsUsageDescription</key>
<string>We need calendar access to schedule appointments</string>
```

### Reminders Access
```xml
<key>NSRemindersUsageDescription</key>
<string>We need reminders access to create task notifications</string>
```

### Bluetooth Access
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>We need Bluetooth to connect to devices</string>
```

### Motion & Fitness
```xml
<key>NSMotionUsageDescription</key>
<string>We need motion data to track your workouts</string>
```

### Health Data
```xml
<key>NSHealthShareUsageDescription</key>
<string>We need to read health data to track fitness goals</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need to write health data to save workout results</string>
```

### Face ID
```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID for secure authentication</string>
```

### Tracking
```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use tracking to show personalized ads and improve our service</string>
```

## Icon Requirements

### Required Sizes
- **App Store**: 1024x1024 (PNG, no transparency, no alpha channel)
- **iPhone**: 60pt@2x (120x120), 60pt@3x (180x180)
- **iPad**: 76pt@2x (152x152)
- **Apple Watch**: 40mm, 44mm, various sizes

### Specifications
- Format: PNG or JPEG
- Color space: RGB
- No transparency (App Store icon)
- Square shape
- No rounded corners (iOS adds them)

## Screenshot Requirements

### iPhone
- **Recommended**: 1320 x 2868 pixels (6.9-inch display)
- Scales to smaller devices automatically
- **Format**: PNG or JPG, flattened, RGB
- **Count**: 1-10 screenshots (at least 1 required)

### iPad
- **Recommended**: 2064 x 2752 pixels (13-inch display)
- Scales to smaller iPads automatically
- **Format**: PNG or JPG, flattened, RGB
- **Count**: 1-10 screenshots (at least 1 required)

## App Store Connect Checklist

### Required Information
- [ ] App name (max 30 characters)
- [ ] Subtitle (max 30 characters)
- [ ] Description (max 4,000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Primary category
- [ ] Privacy policy URL
- [ ] Support URL

### Privacy Nutrition Label
- [ ] Data collection types disclosed
- [ ] Third-party SDK data disclosed
- [ ] Data usage explained
- [ ] Data linking explained
- [ ] Tracking disclosed

### Age Rating
- [ ] Questionnaire completed (updated format by Jan 31, 2026)
- [ ] Rating matches content
- [ ] Content restrictions implemented (if needed)

### Accessibility Nutrition Label
- [ ] VoiceOver support level indicated
- [ ] Dynamic Type support indicated
- [ ] Accessibility features documented

### Monetization (if applicable)
- [ ] In-App Purchases configured
- [ ] Subscription tiers set up
- [ ] Pricing displayed clearly
- [ ] Restore purchase functionality

## Common Rejection Reasons

### 1. Crashes and Bugs
- **Prevention**: Test thoroughly on real devices, use TestFlight
- **Fix**: Debug and resubmit

### 2. Incomplete Information
- **Prevention**: Complete all App Store Connect fields
- **Fix**: Add missing metadata

### 3. Privacy Violations
- **Prevention**: Complete Privacy Nutrition Label, add usage descriptions
- **Fix**: Update privacy disclosures

### 4. Misleading Metadata
- **Prevention**: Ensure screenshots/description match app functionality
- **Fix**: Update metadata to be accurate

### 5. Broken Links
- **Prevention**: Test all URLs (privacy policy, support, external links)
- **Fix**: Update to working URLs

### 6. Missing Features
- **Prevention**: Ensure all advertised features are implemented
- **Fix**: Remove claims or implement features

### 7. Outdated SDK (after April 28, 2026)
- **Prevention**: Build with Xcode 26 and iOS 26 SDK
- **Fix**: Update Xcode, rebuild, resubmit

## Validation Quick Checks

### Before Every Submission
1. ✅ Built with latest SDK (iOS 26+ after April 28, 2026)
2. ✅ All Info.plist usage descriptions present
3. ✅ App Store icon (1024x1024) included
4. ✅ Screenshots prepared for all device types
5. ✅ Privacy Nutrition Label completed
6. ✅ Age rating updated (after Jan 31, 2026)
7. ✅ TestFlight beta testing completed
8. ✅ No placeholder content (icons, text, images)
9. ✅ All links working (privacy, support)
10. ✅ Accessibility labels on interactive elements

### Monthly During Development
1. ✅ SDK version check
2. ✅ New privacy requirements
3. ✅ Accessibility improvements
4. ✅ Localization completeness

## Monetization Rules

### In-App Purchases
- **Required for**: Digital content, premium features, subscriptions
- **Not required for**: Physical goods, external services (reader apps)
- **Commission**: 30% (15% after year 1 for subscriptions, or Small Business Program)

### Loan Apps (New 2026 Rule)
- **Max APR**: 36% including all fees
- **Min repayment**: More than 60 days
- **Impact**: Automatic rejection if violated

### Prohibited Monetization
- ❌ Unlock features via license keys or QR codes
- ❌ Monetize built-in OS capabilities (Push Notifications, Camera)
- ❌ Monetize Apple services (Apple Music, iCloud)

## Accessibility Standards

### VoiceOver Support
- All visible text should have labels
- Interactive elements need labels
- Images need descriptions
- Hint text for complex interactions

### Dynamic Type
- Use system font styles
- Support text scaling
- Test at largest text size

### Color and Contrast
- Minimum 4.5:1 contrast ratio for text
- Don't rely solely on color to convey information
- Support Dark Mode

### Keyboard Navigation
- All features accessible via keyboard (iPad)
- Logical focus order
- Visible focus indicators

## Localization Support

### Supported Languages (38 total)
Arabic, Catalan, Chinese (Simplified), Chinese (Traditional), Croatian, Czech, Danish, Dutch, English (AU/CA/UK/US), Finnish, French, French (Canada), German, Greek, Hebrew, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Polish, Portuguese (Brazil/Portugal), Romanian, Russian, Slovak, Spanish (Mexico/Spain), Swedish, Thai, Turkish, Ukrainian, Vietnamese

### Best Practices
- Use base internationalization
- Localize metadata in App Store Connect
- Test all localizations
- Consider right-to-left languages (Arabic, Hebrew)

## Code Signing Essentials

### Required Components
1. **Apple Developer Account** ($99/year)
2. **Distribution Certificate** (for App Store submission)
3. **Provisioning Profile** (matches bundle identifier)
4. **Valid App ID** (reverse-DNS format)

### Common Issues
- Certificate expired → Renew in Apple Developer portal
- Profile mismatch → Regenerate with correct bundle ID
- Missing entitlements → Add in Xcode capabilities

## TestFlight Requirements

### Before Beta Testing
- App Review for first build (external testers)
- Beta app description required
- Test information provided

### Tester Limits
- **Internal**: 100 members of dev team
- **External**: 10,000 testers
- **Test duration**: 90 days per build

## Full Research Document

For comprehensive details, see: `docs/research/2026-02-16-apple-appstore-requirements.md`

## Official Resources

- **App Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Submission Guide**: https://developer.apple.com/app-store/submitting/
- **Upcoming Requirements**: https://developer.apple.com/news/upcoming-requirements/
- **Privacy Details**: https://developer.apple.com/app-store/app-privacy-details/
- **TestFlight**: https://developer.apple.com/testflight/
- **Accessibility**: https://developer.apple.com/accessibility/
