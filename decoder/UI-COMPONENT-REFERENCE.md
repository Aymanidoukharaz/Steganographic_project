# UI Component Library Reference
## AR Subtitles Decoder PWA

**Quick Reference Guide for Custom Components**

---

## 🎨 Import Statement

```jsx
import { 
  Button, 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Toggle, 
  Select, 
  Slider, 
  Modal 
} from './components/ui';
```

---

## 🔘 Button

### Usage
```jsx
<Button 
  variant="primary"      // primary | secondary | ghost | danger | outline
  size="md"              // sm | md | lg | icon
  onClick={handleClick}
  ariaLabel="Descriptive label"
>
  Click Me
</Button>
```

### Variants Visual Reference
- **Primary**: Blue (#2563EB) with white text, shadow
- **Secondary**: Green (#10B981) with white text, shadow
- **Ghost**: Semi-transparent surface with backdrop blur
- **Danger**: Red (#EF4444) with white text, shadow
- **Outline**: Border only, transparent background

### Sizes
- **sm**: 12px height, small padding
- **md**: 16px height, medium padding (default)
- **lg**: 18px height, large padding
- **icon**: Square, rounded-full (for icon-only buttons)

---

## 🃏 Card System

### Basic Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  
  <CardContent>
    {/* Main content here */}
  </CardContent>
  
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### Styling
- Background: Surface (#1E293B)
- Border: Surface-light (#334155)
- Rounded: 16px (xl)
- Shadow: lg

---

## 🔀 Toggle

### Usage
```jsx
<Toggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Afficher les FPS"
  disabled={false}
/>
```

### States
- **Unchecked**: Surface-light gray (#334155)
- **Checked**: Primary blue (#2563EB)
- **Transition**: 200ms smooth slide

---

## 📋 Select

### Usage
```jsx
<Select
  value={selectedValue}
  onChange={setSelectedValue}
  label="Taille du texte"
  placeholder="Sélectionner..."
  options={[
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' }
  ]}
/>
```

### Features
- Auto-close on selection
- Click-outside detection
- Chevron icon rotation
- Scroll for many options
- Primary blue highlight for selected

---

## 🎚️ Slider

### Usage
```jsx
<Slider
  value={quality}
  onChange={setQuality}
  min={0}
  max={2}
  step={1}
  label="Qualité de traitement"
  labels={['Faible', 'Moyenne', 'Élevée']}
  showValue={false}
/>
```

### Features
- Gradient fill (blue = filled, gray = unfilled)
- Optional value display
- Optional label array below
- Focus ring on interaction

---

## 🪟 Modal

### Usage
```jsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Titre du modal"
  closeButton={true}
  size="md"              // sm | md | lg | xl
>
  {/* Modal content */}
</Modal>
```

### Features
- Backdrop blur with fade-in
- Escape key closes
- Body scroll lock
- Click outside closes
- Scale-in animation

---

## 🎯 French Text Constants

### Import
```jsx
import { FRENCH_TEXT } from './utils/constants';
```

### Common Usage Examples

#### Navigation
```jsx
{FRENCH_TEXT.navigation.settings}  // "Paramètres"
{FRENCH_TEXT.navigation.tutorial}  // "Tutoriel"
{FRENCH_TEXT.navigation.about}     // "À propos"
{FRENCH_TEXT.navigation.back}      // "Retour"
```

#### Status Messages
```jsx
{FRENCH_TEXT.status.idle}          // "Pointez la caméra vers un écran encodé"
{FRENCH_TEXT.status.searching}     // "Recherche en cours..."
{FRENCH_TEXT.status.detected}      // "Vidéo détectée!"
{FRENCH_TEXT.status.decoding}      // "Décodage en cours..."
```

#### Settings
```jsx
{FRENCH_TEXT.settings.subtitleStyle}     // "Style des sous-titres"
{FRENCH_TEXT.settings.textSize}          // "Taille du texte"
{FRENCH_TEXT.settings.performance}       // "Performance"

// Text sizes
{FRENCH_TEXT.settings.textSizes.small}   // "Petit"
{FRENCH_TEXT.settings.textSizes.medium}  // "Moyen"
{FRENCH_TEXT.settings.textSizes.large}   // "Grand"

// Colors
{FRENCH_TEXT.settings.colors.white}      // "Blanc"
{FRENCH_TEXT.settings.colors.yellow}     // "Jaune"
{FRENCH_TEXT.settings.colors.cyan}       // "Cyan"
```

#### Actions
```jsx
{FRENCH_TEXT.actions.start}       // "Démarrer"
{FRENCH_TEXT.actions.save}        // "Enregistrer"
{FRENCH_TEXT.settings.save}       // "Enregistrer"
{FRENCH_TEXT.settings.reset}      // "Réinitialiser"
```

---

## 🎨 Tailwind Color Classes

### Primary (Blue)
```jsx
className="bg-primary"              // Background
className="text-primary"            // Text
className="border-primary"          // Border
className="ring-primary"            // Focus ring
```

### Secondary (Green)
```jsx
className="bg-secondary"
className="text-secondary"
className="border-secondary"
```

### Surface
```jsx
className="bg-surface"              // Main surface (#1E293B)
className="bg-surface-light"        // Lighter variant (#334155)
className="bg-background"           // Page background (#0F172A)
```

### Text
```jsx
className="text-text-primary"       // Main text (#F8FAFC)
className="text-text-secondary"     // Secondary text (#94A3B8)
className="text-text-muted"         // Muted text (#64748B)
```

### Status
```jsx
className="bg-error"                // Red (#EF4444)
className="bg-warning"              // Amber (#F59E0B)
className="bg-success"              // Green (#10B981)
```

### Subtitle Colors
```jsx
className="text-subtitle-white"     // White (#FFFFFF)
className="text-subtitle-yellow"    // Yellow (#FDE047)
className="text-subtitle-cyan"      // Cyan (#22D3EE)
```

---

## ✨ Animation Classes

### Fade Animations
```jsx
className="animate-fade-in"         // 300ms fade in
className="animate-fade-out"        // 300ms fade out
```

### Scale & Slide
```jsx
className="animate-scale-in"        // 200ms scale from 95% to 100%
className="animate-slide-up"        // 300ms slide up with fade
```

### Pulse Animations
```jsx
className="animate-pulse-slow"      // 2s pulse (subtle)
className="animate-pulse-detection" // 1s pulse (detection indicator)
```

### Corner Highlight
```jsx
className="animate-corner-highlight" // 2s stroke width animation
```

---

## 📐 Spacing & Layout

### Safe Areas
```jsx
className="pt-safe-top"             // iOS safe area top
className="pb-safe-bottom"          // iOS safe area bottom
className="pl-safe-left"            // iOS safe area left
className="pr-safe-right"           // iOS safe area right
```

### Border Radius
```jsx
className="rounded-lg"              // 8px
className="rounded-xl"              // 16px
className="rounded-full"            // Fully rounded (pills, circles)
```

### Shadows
```jsx
className="shadow-lg"               // Large shadow
className="shadow-primary/20"       // Primary color shadow at 20% opacity
className="shadow-secondary/20"     // Secondary color shadow
```

### Backdrop Blur
```jsx
className="backdrop-blur-sm"        // Small blur
className="backdrop-blur-md"        // Medium blur (most common)
```

---

## 📱 Responsive Design

### Mobile-First Approach
All components are mobile-first. Desktop adjustments use responsive prefixes:

```jsx
className="px-4 md:px-6 lg:px-8"   // Responsive padding
className="text-sm md:text-base"   // Responsive text size
```

### Common Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## ♿ Accessibility

### ARIA Labels
Always provide ARIA labels for icon-only buttons:
```jsx
<Button ariaLabel={FRENCH_TEXT.aria.settingsButton}>
  <SettingsIcon />
</Button>
```

### Common ARIA Labels
```jsx
{FRENCH_TEXT.aria.closeButton}      // "Fermer"
{FRENCH_TEXT.aria.settingsButton}   // "Ouvrir les paramètres"
{FRENCH_TEXT.aria.tutorialButton}   // "Ouvrir le tutoriel"
{FRENCH_TEXT.aria.backButton}       // "Retour"
```

### Focus Management
All interactive elements have focus rings:
```jsx
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
```

---

## 🎯 Common Patterns

### Icon Button
```jsx
<Button variant="ghost" size="icon" ariaLabel="Settings">
  <svg className="w-5 h-5" {...iconProps} />
</Button>
```

### Setting Row
```jsx
<div className="flex items-center justify-between">
  <label className="text-text-secondary text-sm">
    {FRENCH_TEXT.settings.showFPS}
  </label>
  <Toggle checked={showFPS} onChange={setShowFPS} />
</div>
```

### Pill Status Badge
```jsx
<div className="bg-surface/90 backdrop-blur-md rounded-full px-6 py-3 border border-primary/30 shadow-lg shadow-primary/20">
  <div className="flex items-center space-x-3">
    <Icon className="text-primary" />
    <span className="text-primary text-sm font-medium">
      {FRENCH_TEXT.status.searching}
    </span>
  </div>
</div>
```

---

## 📚 Example: Complete Settings Section

```jsx
import { Card, CardHeader, CardTitle, CardContent, Toggle, Select, Slider } from './components/ui';
import { FRENCH_TEXT } from './utils/constants';

function SettingsSection() {
  const [showFPS, setShowFPS] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [quality, setQuality] = useState(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{FRENCH_TEXT.settings.performance}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* FPS Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-text-secondary text-sm">
            {FRENCH_TEXT.settings.showFPS}
          </label>
          <Toggle 
            checked={showFPS} 
            onChange={setShowFPS}
            label={FRENCH_TEXT.settings.showFPS}
          />
        </div>
        
        {/* Text Size Select */}
        <Select
          value={textSize}
          onChange={setTextSize}
          label={FRENCH_TEXT.settings.textSize}
          options={[
            { value: 'small', label: FRENCH_TEXT.settings.textSizes.small },
            { value: 'medium', label: FRENCH_TEXT.settings.textSizes.medium },
            { value: 'large', label: FRENCH_TEXT.settings.textSizes.large },
          ]}
        />
        
        {/* Quality Slider */}
        <Slider
          value={quality}
          onChange={setQuality}
          min={0}
          max={2}
          step={1}
          label={FRENCH_TEXT.settings.processingQuality}
          labels={[
            FRENCH_TEXT.settings.qualities.low,
            FRENCH_TEXT.settings.qualities.medium,
            FRENCH_TEXT.settings.qualities.high,
          ]}
        />
      </CardContent>
    </Card>
  );
}
```

---

## 🚀 Best Practices

1. **Always use FRENCH_TEXT constants** instead of hardcoded strings
2. **Include ARIA labels** on all interactive elements
3. **Use semantic HTML** (button, nav, main, etc.)
4. **Implement focus management** for modals and overlays
5. **Respect safe areas** on mobile devices
6. **Use consistent spacing** (Tailwind's spacing scale)
7. **Prefer composition** over prop drilling
8. **Keep animations subtle** (300ms or less for most)
9. **Test on actual devices** especially iOS Safari
10. **Maintain backward compatibility** with existing backend

---

**This reference guide covers all custom UI components created during the UI/UX revamp.**
