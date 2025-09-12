# Palette de couleurs Dark Mode

## Couleurs de base
- **Background principal**: `#191919`
- **Background secondaire (cartes)**: `#202020`
- **Background tertiaire (éléments)**: `#252525`
- **Background hover**: `#2A2A2A`
- **Background input/progress**: `#1A1A1A`

## Bordures
- **Bordure principale**: `#2F2F2F`
- **Bordure secondaire**: `rgba(255, 255, 255, 0.094)`

## Texte
- **Texte principal**: `white/80` ou `rgba(255, 255, 255, 0.81)`
- **Texte secondaire**: `white/60` ou `rgba(255, 255, 255, 0.60)`
- **Texte tertiaire**: `white/40` ou `rgba(255, 255, 255, 0.40)`
- **Texte désactivé**: `white/30` ou `rgba(255, 255, 255, 0.30)`
- **Texte très léger**: `white/20` ou `rgba(255, 255, 255, 0.20)`

## Couleurs d'accent
- **Bleu principal**: `#2383E2`
- **Bleu hover**: `#2383E2/80`
- **Vert (succès)**: `#22C55E`
- **Jaune (avertissement)**: `#FBB924`
- **Rouge (erreur)**: `#EF4444`

## Application dans les composants

### Cartes
```css
background: #202020;
border: 1px solid #2F2F2F;
```

### Boutons
```css
background: #252525;
border: 1px solid #2F2F2F;
hover:background: #2A2A2A;
```

### Inputs
```css
background: #1A1A1A;
border: 1px solid #2F2F2F;
```

### Barres de progression
```css
background: #1A1A1A; /* fond */
fill: #2383E2; /* progression */
```

### Listes/Items
```css
background: #252525;
border: 1px solid #2F2F2F;
hover:background: #2A2A2A;
```

## Classes Tailwind correspondantes
- `bg-[#191919]` - Background principal
- `bg-[#202020]` - Cards
- `bg-[#252525]` - Elements
- `bg-[#2A2A2A]` - Hover
- `border-[#2F2F2F]` - Bordures
- `text-white/80` - Texte principal
- `text-white/60` - Texte secondaire
- `text-white/40` - Texte tertiaire
- `bg-[#2383E2]` - Accent bleu