---
name: applying-look-and-feel
description: Apply consistent UI by reading docs/LOOK_AND_FEEL.md. Create file if missing. Detect changes and update frontend accordingly. Preserve existing design unless user requests changes.
---

# Applying Look and Feel

## Purpose
Maintain UI consistency by reading design guidelines from `docs/LOOK_AND_FEEL.md`. Auto-detect changes and sync frontend.

**CRITICAL**: Preserve existing look and feel. Only change design when user explicitly requests it.

## Process

### 1. Examine Existing Frontend (if exists)

**Before creating/reading LOOK_AND_FEEL.md**, check existing UI code:

```bash
# Find frontend files
find src -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.css" | head -20

# Look for design patterns
grep -r "className\|style\|css" src/components | head -20
cat src/styles/*.css 2>/dev/null
```

**Extract current design from code**:
- Colors used (hex values, CSS variables)
- Font families and sizes
- Spacing patterns (padding, margin values)
- Border radius, shadows
- Component styles (buttons, cards, inputs)

**Priority**: Existing design > Template defaults

### 2. Read or Create Design Doc

```bash
cat docs/LOOK_AND_FEEL.md 2>/dev/null || echo "Not found"
```

**If doc exists**: Read and use it
**If doc missing AND frontend exists**: Generate doc from existing code
**If both missing**: Create doc with user (interactive Q&A)

### 3. Generate LOOK_AND_FEEL.md from Existing Code

If frontend exists but doc doesn't:

```markdown
# Look and Feel Guidelines

## Extracted from Existing Code

### Colors
[List all colors found in codebase with usage]
Primary: #3B82F6 (found in Button.jsx, Card.jsx)
Background: #FFFFFF (found in App.css)
...

### Typography
Font: [Extracted from CSS/component files]
Sizes: [List all font-size values used]
...

### Spacing
[List all padding/margin values used, identify pattern]
...

### Components
[Document actual component styles found]

### Notes
- Generated from existing code on [date]
- Captures current design system
- Update this file if design changes
```

**Then ask user**: "I've documented your current design. Keep it or make changes?"

### 2. Extract Key Info

Parse:
- Colors (primary, secondary, semantic, neutral)
- Typography (fonts, sizes, weights)
- Spacing scale
- Border radius, shadows
- Animation timing/easing
- Component patterns
- Breakpoints
- Accessibility requirements

### 3. Apply to Frontend

**When creating NEW components**:
- Match existing design patterns
- Use design system values (no hardcoded styles)
- Follow established typography scale
- Use spacing system
- Match animation style

**When modifying EXISTING components**:
- Preserve current look and feel
- Only change if user explicitly requests it
- If design is inconsistent, ask user: "I notice X looks different from Y. Should I standardize?"

**Design changes require user permission**:
- Don't change colors unless asked
- Don't change fonts unless asked
- Don't change spacing unless asked
- Don't redesign components without request

### 4. Detect Changes

Compare current doc with implementation:
- Identify what changed
- List affected components
- Offer to update code

## LOOK_AND_FEEL.md Template

```markdown
# Look and Feel Guidelines

## Brand Identity
- **Personality**: [Professional/Playful/Minimal/Bold]
- **Target audience**: [Description]
- **Accessibility**: WCAG 2.1 AA minimum

## Color Palette
```
Primary: #3B82F6
Primary Hover: #2563EB
Secondary: #8B5CF6
Background: #FFFFFF
Surface: #F9FAFB
Border: #E5E7EB
Text: #111827
Text Secondary: #6B7280
Success: #10B981
Warning: #F59E0B
Error: #EF4444
```

## Typography
```
Font: 'Inter', sans-serif
Sizes: 12px/14px/16px/18px/20px/24px/30px/36px
Weights: 400 (regular) / 500 (medium) / 600 (semibold) / 700 (bold)
Line height: 1.5
```

## Spacing (multiples of 4px)
```
xs: 4px
sm: 8px
base: 16px
md: 24px
lg: 32px
xl: 48px
```

## Border & Shadow
```
Radius: 4px/8px/12px/16px
Shadow: 0 1px 3px rgba(0,0,0,0.1) / 0 4px 6px rgba(0,0,0,0.1)
```

## Animations
```
Duration: 150ms (fast) / 200ms (base) / 300ms (slow)
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Style: Subtle, smooth transitions
```

## Components

### Buttons
```
Primary: bg-primary, text-white, px-6 py-3, rounded-lg
Secondary: border border-gray, text-primary, px-6 py-3, rounded-lg
Icon: 40x40px, rounded-lg
```

### Inputs
```
Height: 40px
Padding: 8px 12px
Border: 1px solid border-color
Focus: primary color ring
```

### Cards
```
Background: surface color
Border: 1px solid border-color
Radius: 12px
Padding: 24px
Shadow: base
```

## Responsive Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

## Accessibility
- Color contrast: 4.5:1 (text), 3:1 (UI)
- Keyboard navigation required
- Screen reader support (ARIA labels)
- Respect prefers-reduced-motion
```

## Interactive Creation

If file missing, ask:

1. **Brand**: Personality? Target users?
2. **Colors**: Brand colors or suggest based on mood?
3. **Typography**: Preferred font or suggest (Inter/Roboto/System)?
4. **Style**: Rounded/sharp corners? Subtle/prominent shadows?

Then create file with gathered info.

## Implementation

### CSS Variables
```css
:root {
  --color-primary: #3B82F6;
  --color-surface: #F9FAFB;
  --font-base: 1rem;
  --space-base: 16px;
  --radius-base: 8px;
  --shadow-base: 0 1px 3px rgba(0,0,0,0.1);
  --duration-base: 200ms;
}
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
      },
      spacing: {
        'base': '16px',
        'md': '24px',
      },
    },
  },
}
```

### Usage
```jsx
// Bad: hardcoded
<button style={{ backgroundColor: '#3B82F6', padding: '12px 24px' }}>

// Good: design system
<button className="bg-primary px-6 py-3 rounded-base">
```

## Change Detection

When doc changes:
1. Compare with current implementation
2. List differences:
   ```
   Changes:
   - Primary color: #3B82F6 → #2563EB
   - Border radius: 8px → 12px
   
   Affected:
   - src/components/Button.jsx
   - src/styles/globals.css
   ```
3. Update CSS variables/config first
4. Update hardcoded values if found

## Rules

**Always**:
- Read doc at session start
- **Check existing frontend code first** (if it exists)
- **Preserve existing design** unless user requests changes
- Use design system values (CSS vars/Tailwind)
- Follow accessibility guidelines
- Ask before ANY design changes

**Never**:
- Change colors without user request
- Change fonts without user request
- Redesign components without permission
- Hardcode colors/sizes in components
- Ignore accessibility
- Override design system without reason
- Skip doc check before frontend work

**When user says "add login page"**:
- ✅ Match existing button style
- ✅ Use existing form input style
- ✅ Follow existing spacing/colors
- ❌ Don't introduce new design patterns

**When user says "make buttons rounder"**:
- ✅ Update border-radius in doc
- ✅ Update all button components
- ✅ Document change with date

## Workflow Examples

### Scenario 1: Existing Frontend, No Doc

1. Find frontend files: `src/components/*.jsx`
2. Extract design: colors, fonts, spacing from code
3. Generate `docs/LOOK_AND_FEEL.md` from findings
4. Show user: "I've documented your current design. Keep it?"
5. If yes: Use it. If no: Ask what to change.

### Scenario 2: Existing Frontend + Existing Doc

1. Read doc
2. Compare doc with actual code
3. If mismatch: Ask user which is correct
   - "Doc says primary is #3B82F6, code uses #2563EB. Which should I use?"
4. Update either doc or code based on answer

### Scenario 3: No Frontend, No Doc

1. Ask user about design preferences
2. Create doc with answers
3. Build frontend using doc

### Scenario 4: User Requests Design Change

User: "Make all buttons more rounded"

1. Update `docs/LOOK_AND_FEEL.md` (border-radius: 8px → 12px)
2. Update CSS variables/Tailwind config
3. Update button components
4. Add changelog entry

**Don't** just change the code - update doc first.

## Integration

Create CSS variables or Tailwind config from doc on project setup. Use those everywhere.

## Example Sessions

### Session 1: User asks to add settings page

**AI Process**:
1. Check if frontend exists: `ls src/components/`
2. If exists: Examine Button.jsx, Card.jsx, Input.jsx
3. Extract: button style (bg-primary, rounded-lg), card style (shadow-base)
4. Read `docs/LOOK_AND_FEEL.md` (if exists)
5. Create settings page **matching existing components**:
   - Use same button style as existing buttons
   - Use same card style as existing cards
   - Use same spacing as other pages
6. Don't introduce new design patterns

### Session 2: User asks to change primary color

**AI Process**:
1. User: "Change primary color to green"
2. Update `docs/LOOK_AND_FEEL.md`: Primary: #3B82F6 → #10B981
3. Update CSS variables: `--color-primary: #10B981`
4. List affected components:
   ```
   Changed: Primary color #3B82F6 → #10B981
   Updated:
   - src/styles/globals.css (CSS variables)
   - src/components/Button.jsx
   - src/components/Link.jsx
   ```
5. Add changelog: "[2024-11-20]: Changed primary color to green"