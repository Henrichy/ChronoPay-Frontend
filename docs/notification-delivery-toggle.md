# Notification Delivery Toggle

The notification delivery toggle provides users with a top-level choice between real-time and daily digest delivery modes, with visual previews showing how each format looks.

## Design Principles

- **Clear Choice**: Binary toggle between real-time (immediate) and digest (bundled) delivery
- **Visual Preview**: Live examples showing notification format for each mode
- **Immediate Feedback**: Preview styling updates instantly when mode changes
- **Persistent Preference**: Choice is saved to localStorage and restored on page load

## Component Structure

The toggle consists of:
1. **Radio Group Toggle**: Segmented control with "Real-time" and "Daily digest" options
2. **Preview Cards**: Side-by-side examples showing notification formats
3. **Visual Feedback**: Active mode is highlighted with cyan accent colors

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Semantic HTML**: Uses proper `role="radiogroup"` and `role="radio"`
- **ARIA Labels**: Full descriptive labels for screen readers
- **Keyboard Navigation**: Arrow keys navigate between options
- **Focus Management**: Visible focus indicators with proper contrast
- **Live Regions**: Changes announced to assistive technology
- **Touch Targets**: Minimum 44px clickable areas for mobile

### Screen Reader Support

```html
<div role="radiogroup" aria-label="Notification delivery timing">
  <button role="radio" aria-checked="true">Real-time</button>
  <button role="radio" aria-checked="false">Daily digest</button>
</div>
```

## Responsive Design

### Desktop (md+)
- Side-by-side preview cards for easy comparison
- Toggle aligned to the right of description text
- Full-width preview examples with detailed content

### Mobile (below md)
- Stacked preview cards for better readability
- Toggle remains accessible and properly sized
- Condensed but clear notification examples

## Visual States

### Real-time Mode (Default)
- Real-time preview card: `border-cyan-300/50 bg-cyan-300/5`
- Digest preview card: `border-white/10 bg-white/[0.02]`
- Real-time button: active styling with white background

### Digest Mode
- Digest preview card: `border-cyan-300/50 bg-cyan-300/5`
- Real-time preview card: `border-white/10 bg-white/[0.02]`
- Digest button: active styling with white background

## Preview Examples

### Real-time Preview
Shows individual notifications with timestamps:
```
• Payment received - 2:14 PM
• Booking confirmed - 1:45 PM
```

### Digest Preview
Shows bundled summary format:
```
Daily summary - 3 updates
• Payment received ($1,250)
• Booking confirmed (Sarah M.)
• Review posted (5 stars)
8:00 AM
```

## Data Persistence

Delivery mode preference is stored in localStorage under the key `chronopay:notification-preferences` along with other notification settings:

```typescript
{
  deliveryMode: "realtime" | "digest",
  categories: PreferenceCategory[],
  quietHoursEnabled: boolean,
  quietHoursStart: string,
  quietHoursEnd: string
}
```

## Integration Notes

- Works seamlessly with existing notification categories and quiet hours
- Preserves all existing accessibility features of the notification panel
- Maintains consistent styling with the existing design system
- Compatible with dark mode and RTL layouts

## Edge Cases Handled

- **No localStorage**: Falls back to "realtime" default
- **Malformed Data**: Gracefully handles parsing errors
- **SSR Compatibility**: Safe for server-side rendering
- **Storage Errors**: Shows appropriate error messages
- **Zero Notifications**: Preview examples work regardless of user's notification count

## Testing Coverage

- ✅ Accessibility audit with axe-core
- ✅ Keyboard navigation and focus management
- ✅ Screen reader announcements
- ✅ Touch target sizing for mobile
- ✅ Dark mode contrast ratios
- ✅ RTL layout support
- ✅ localStorage persistence and error handling
- ✅ Integration with existing features
- ✅ Responsive design verification

## Performance Considerations

- Minimal bundle impact (< 2KB additional code)
- No network requests - all interactions are local
- Efficient re-rendering with React state updates
- Leverages existing design system tokens and utilities