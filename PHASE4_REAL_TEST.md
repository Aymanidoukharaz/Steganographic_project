# 🧪 PHASE 4 - TEST RÉEL COMPLET
## Décodage Stéganographique en Temps Réel

**Date**: 13 Novembre 2025  
**Objectif**: Valider le pipeline complet d'encodage → décodage avec sous-titres cachés

---

## 📋 Prérequis

### Fichiers Nécessaires
- ✅ Vidéo source avec audio (ex: `test_video.mp4`)
- ✅ Fichier sous-titres (ex: `test_subtitles.srt` ou `.vtt`)
- ✅ Encodeur Python fonctionnel (avec FFmpeg)
- ✅ Décodeur React/OpenCV.js fonctionnel

### Vérifications Préalables
```powershell
# 1. FFmpeg installé
ffmpeg -version

# 2. Python packages installés
pip list | Select-String "opencv|numpy|lz4"

# 3. Décodeur React build
cd decoder
npm run dev
```

---

## 🎬 ÉTAPE 1 : Encodage de Test

### 1.1 Préparation des Fichiers

Créez un fichier de sous-titres de test : `encoder/test_phase4.srt`

```srt
1
00:00:00,000 --> 00:00:03,000
Bonjour ! Test de stéganographie AR 🎬

2
00:00:03,000 --> 00:00:06,000
Les sous-titres sont cachés dans la vidéo

3
00:00:06,000 --> 00:00:10,000
Décodage en temps réel avec OpenCV.js ✨

4
00:00:10,000 --> 00:00:15,000
Projet Master IHM - Réalité Augmentée 🚀
```

### 1.2 Lancement de l'Encodeur

```powershell
cd encoder
python main.py
```

### 1.3 Processus d'Encodage

**Interface GUI** :
1. **Source Video** : Sélectionnez votre vidéo (ex: `test_video.mp4`)
2. **Subtitle File** : Sélectionnez `test_phase4.srt`
3. **Output Video** : Nommez `output_phase4_test.mp4`
4. Cliquez **"Start Encoding"**

### 1.4 Résultat Attendu

**Console Output** :
```
[INFO] 🎬 Starting video encoding with steganography...
[INFO] Source: test_video.mp4
[INFO] Subtitles: test_phase4.srt
[INFO] Output: output_phase4_test.mp4
[INFO] 
[INFO] 📊 Processing...
[INFO] ├─ Frame 0/300 (0%)
[INFO] ├─ Frame 50/300 (16%)
[INFO] ├─ Frame 100/300 (33%)
[INFO] ├─ Frame 150/300 (50%)
[INFO] ├─ Frame 200/300 (66%)
[INFO] ├─ Frame 250/300 (83%)
[INFO] └─ Frame 300/300 (100%)
[INFO] 
[INFO] 🎵 Merging audio with FFmpeg...
[INFO] ✅ Audio merged successfully
[INFO] 
[INFO] ✅ Encoding completed!
[INFO] Output: output_phase4_test.mp4
[INFO] Duration: 15.2s
[INFO] Total frames: 300
```

**Fichier Créé** :
- ✅ `output_phase4_test.mp4` (avec audio !)
- ✅ Taille similaire à l'original
- ✅ Qualité visuelle identique (LSB invisible)

---

## 🔍 ÉTAPE 2 : Décodage en Temps Réel

### 2.1 Démarrage du Décodeur

```powershell
cd decoder
npm run dev
```

**Navigateur** : Ouvrez `http://localhost:5173`

### 2.2 Configuration Initiale

**Interface Web** :
1. **Autoriser caméra** : Cliquez "Allow" quand demandé
2. **Orientation** : Tenez votre téléphone en **portrait** (vertical)
3. **Éclairage** : Assurez un bon éclairage de l'écran

### 2.3 Préparation de la Lecture

**Sur un autre écran/téléphone** :
1. Ouvrez `output_phase4_test.mp4` en plein écran
2. Pausez la vidéo au début
3. Assurez que les **4 marqueurs ArUco** soient visibles :
   ```
   ┌─────────────────┐
   │ [0]       [1]   │
   │                 │
   │   VIDÉO+SOUS    │
   │                 │
   │ [2]       [3]   │
   └─────────────────┘
   ```

### 2.4 Test de Détection

**Actions** :
1. Pointez la caméra vers l'écran
2. Ajustez la distance (30-50 cm optimal)
3. Cadrez pour voir les 4 marqueurs

**Résultat Attendu dans le Décodeur** :

**UI - Status Indicator** :
```
🟢 Detecting (green) 
   └─ "4 markers detected"
```

**UI - Detection Overlay** :
- ✅ Cadre vert autour de la vidéo
- ✅ Coins avec cercles verts
- ✅ Coins numérotés (0, 1, 2, 3)

**Console Browser (F12)** :
```javascript
[CV Pipeline] ✅ 4 markers detected
[CV Pipeline] ✅ Homography calculated
[CV Pipeline] 📐 Perspective correction applied
```

### 2.5 Test de Décodage des Sous-titres

**Action** : Lancez la lecture de la vidéo

**Chronologie Attendue** :

#### T = 0-3s : Premier Sous-titre
**Écran Vidéo** : `Bonjour ! Test de stéganographie AR 🎬`

**Décodeur Web - UI Overlay** :
```
┌─────────────────────────────────────┐
│  Caméra en direct avec marqueurs    │
│                                     │
│  [Vidéo détectée avec cadre vert]  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Bonjour ! Test de           │   │
│  │ stéganographie AR 🎬        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Console Browser** :
```javascript
[Decoder Pipeline] 📦 LSB data extracted: 156 bytes
[Decoder Pipeline] 🗜️  Decompressing with LZ4...
[Decoder Pipeline] ✅ Decompression successful
[Decoder Pipeline] 📝 Subtitle decoded:
   {
     startTime: 0,
     endTime: 3000,
     text: "Bonjour ! Test de stéganographie AR 🎬"
   }
[Timing Sync] ⏰ Displaying subtitle (0-3s)
```

#### T = 3-6s : Deuxième Sous-titre
**Overlay Change** :
```
┌─────────────────────────────────┐
│ Les sous-titres sont cachés     │
│ dans la vidéo                   │
└─────────────────────────────────┘
```

**Console** :
```javascript
[Decoder Pipeline] 📝 New subtitle decoded
[Timing Sync] ⏰ Subtitle changed (3-6s)
```

#### T = 6-10s : Troisième Sous-titre
```
┌─────────────────────────────────┐
│ Décodage en temps réel avec     │
│ OpenCV.js ✨                    │
└─────────────────────────────────┘
```

#### T = 10-15s : Quatrième Sous-titre
```
┌─────────────────────────────────┐
│ Projet Master IHM - Réalité     │
│ Augmentée 🚀                    │
└─────────────────────────────────┘
```

---

## ✅ CRITÈRES DE VALIDATION

### 1. Encodage ✓
- [ ] Vidéo encodée créée avec succès
- [ ] Audio préservé (vérifiable en lecture)
- [ ] Qualité visuelle identique (LSB imperceptible)
- [ ] Taille fichier similaire (±5%)
- [ ] Console montre "✅ Audio merged successfully"

### 2. Détection Marqueurs ✓
- [ ] 4 marqueurs ArUco détectés simultanément
- [ ] Cadre vert stable autour de la vidéo
- [ ] Homographie calculée avec succès
- [ ] Status indicator vert ("Detecting")

### 3. Décodage Stéganographique ✓
- [ ] LSB extraction réussie (logs console)
- [ ] Décompression LZ4 sans erreur
- [ ] Parsing des sous-titres correct
- [ ] Format `startTime|endTime|text` reconnu

### 4. Synchronisation Temporelle ✓
- [ ] Sous-titres affichés au bon moment
- [ ] Changement de sous-titre fluide
- [ ] Timing précis (±500ms acceptable)
- [ ] Affichage pendant la durée correcte

### 5. Affichage UI ✓
- [ ] Overlay de sous-titre visible
- [ ] Texte lisible et formaté
- [ ] Emojis affichés correctement (🎬✨🚀)
- [ ] Caractères français corrects (é, à, etc.)
- [ ] Positionnement centré/bas de l'overlay

### 6. Performance ✓
- [ ] Décodage fluide (>20 FPS)
- [ ] Pas de lag notable
- [ ] Utilisation CPU raisonnable (<80%)
- [ ] Pas d'erreurs console

---

## 🐛 PROBLÈMES COURANTS ET SOLUTIONS

### Problème 1 : Pas de détection des marqueurs
**Symptômes** :
- Status indicator rouge
- Console : "No markers detected"

**Solutions** :
1. ✅ Améliorer l'éclairage
2. ✅ Rapprocher/éloigner la caméra (distance optimale: 40cm)
3. ✅ Tenir le téléphone stable
4. ✅ Nettoyer la lentille de la caméra
5. ✅ Vérifier que les 4 marqueurs sont dans le cadre

### Problème 2 : Marqueurs détectés mais pas de sous-titres
**Symptômes** :
- Cadre vert visible
- Console : "Homography OK" mais pas "Subtitle decoded"

**Solutions** :
1. ✅ Vérifier console pour erreurs de décompression
2. ✅ Vérifier que la vidéo encodée est bien utilisée
3. ✅ Relancer le décodage (rafraîchir page)
4. ✅ Vérifier format des sous-titres dans l'encodage

### Problème 3 : Sous-titres décodés mais mal synchronisés
**Symptômes** :
- Texte affiché mais pas au bon moment

**Solutions** :
1. ✅ Vérifier timestamps dans fichier `.srt` source
2. ✅ Vérifier FPS de la vidéo (doit être constant)
3. ✅ Ajuster `syncTimestamp` dans le code si décalage constant

### Problème 4 : Emojis ou accents manquants
**Symptômes** :
- `�` à la place des emojis
- `Ã©` au lieu de `é`

**Solutions** :
1. ✅ Vérifier encodage UTF-8 du fichier `.srt`
2. ✅ Vérifier `TextDecoder('utf-8')` dans `subtitle-parser.js`
3. ✅ Vérifier police CSS supporte UTF-8

### Problème 5 : Décodage lent/saccadé
**Symptômes** :
- FPS < 15
- Lag notable

**Solutions** :
1. ✅ Réduire résolution caméra dans settings
2. ✅ Désactiver autres onglets/applications
3. ✅ Utiliser navigateur Chrome/Edge (meilleur WebAssembly)
4. ✅ Vérifier `performance-monitor.js` pour bottlenecks

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance Attendue
| Métrique | Cible | Acceptable | Critique |
|----------|-------|------------|----------|
| **FPS Décodeur** | >25 | >20 | <15 |
| **Latence Détection** | <100ms | <200ms | >500ms |
| **Précision Timing** | ±100ms | ±500ms | >1s |
| **Taux Décodage** | >95% | >80% | <50% |
| **CPU Usage** | <60% | <80% | >90% |

### Qualité Visuelle
| Aspect | Validation |
|--------|------------|
| **LSB Imperceptible** | ✅ Aucune différence visible à l'œil nu |
| **Audio Qualité** | ✅ Identique à l'original |
| **Compression** | ✅ Taille ±5% de l'original |
| **Overlay UI** | ✅ Lisible, bien positionné |

---

## 🎯 RÉSULTAT FINAL ATTENDU

### Vidéo de Démonstration
**Ce que vous devez pouvoir faire** :
1. 📹 Encoder une vidéo avec sous-titres cachés (avec audio)
2. 🎬 Lire la vidéo encodée sur un écran
3. 📱 Pointer smartphone vers l'écran
4. 🔍 Décodeur détecte les marqueurs ArUco
5. ✨ Sous-titres apparaissent en overlay en temps réel
6. ⏱️ Synchronisation parfaite avec la vidéo
7. 🌐 Texte français + emojis correctement affichés

### Preuve de Concept Réussie
**Captures d'écran à produire** :
1. ✅ Console encodeur avec "Audio merged successfully"
2. ✅ Fichier `output_phase4_test.mp4` créé
3. ✅ Interface décodeur avec 4 marqueurs détectés (cadre vert)
4. ✅ Overlay de sous-titre affiché en temps réel
5. ✅ Console browser avec logs de décodage réussi

### Validation Technique
```javascript
// État final dans AppContext
{
  markersDetected: [0, 1, 2, 3],
  homographyValid: true,
  currentSubtitle: {
    startTime: 10000,
    endTime: 15000,
    text: "Projet Master IHM - Réalité Augmentée 🚀"
  },
  subtitleHistory: [
    { startTime: 0, endTime: 3000, text: "Bonjour ! Test de stéganographie AR 🎬" },
    { startTime: 3000, endTime: 6000, text: "Les sous-titres sont cachés dans la vidéo" },
    { startTime: 6000, endTime: 10000, text: "Décodage en temps réel avec OpenCV.js ✨" },
    { startTime: 10000, endTime: 15000, text: "Projet Master IHM - Réalité Augmentée 🚀" }
  ],
  decodingActive: true,
  decodingErrors: 0
}
```

---

## 🚀 PROCHAINES ÉTAPES (Phase 5)

Une fois Phase 4 validée :
- ✅ **Phase 5** : Rendu 3D AR avec perspective-correct subtitle positioning
- ✅ Three.js/WebGL integration
- ✅ Projection 3D des sous-titres dans l'espace AR
- ✅ Effets visuels avancés

---

## 📝 CHECKLIST FINALE

**Avant de marquer Phase 4 comme COMPLÈTE** :

- [ ] Vidéo encodée avec audio fonctionnel
- [ ] 4 sous-titres décodés correctement
- [ ] Synchronisation temporelle validée
- [ ] Emojis et accents français affichés
- [ ] Performance >20 FPS maintenue
- [ ] Aucune erreur console critique
- [ ] Test filmé/capturé pour démonstration
- [ ] Documentation à jour

**Une fois tous les items cochés** :
```
✅ PHASE 4 VALIDÉE - Décodage Stéganographique Fonctionnel
```

---

**Date de validation** : _________________  
**Validé par** : _________________  
**Notes** : _________________

