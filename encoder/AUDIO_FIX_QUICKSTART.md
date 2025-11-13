# 🔊 CORRECTION : Audio Préservé dans Vidéos Encodées

## ✅ Problème Résolu

**Problème :** Les vidéos encodées perdaient leur son  
**Cause :** OpenCV ne gère pas l'audio  
**Solution :** Utilisation de FFmpeg pour fusionner l'audio original  

---

## 🚀 Installation Rapide (Windows)

### **Étape 1 : Installer FFmpeg**

**Option la plus simple (Chocolatey) :**
```powershell
# En tant qu'administrateur :
choco install ffmpeg
```

**OU téléchargement manuel :**
1. Aller sur : https://www.gyan.dev/ffmpeg/builds/
2. Télécharger "ffmpeg-release-essentials.zip"
3. Extraire dans `C:\ffmpeg`
4. Ajouter `C:\ffmpeg\bin` au PATH système
5. Redémarrer PowerShell

### **Étape 2 : Vérifier**
```bash
ffmpeg -version
```

Si ça affiche la version, c'est bon ! ✅

---

## 📝 Ce Qui a Été Modifié

**Fichier modifié :** `encoder/core/video_processor.py`

### **Nouvelles Fonctionnalités**

1. ✅ **Sauvegarde temporaire sans audio**
2. ✅ **Fusion automatique avec audio original via ffmpeg**
3. ✅ **Nettoyage fichier temporaire**
4. ✅ **Fallback si ffmpeg absent** (fonctionne sans audio)

### **Nouveau Pipeline**

```
Vidéo Originale (avec audio)
    ↓
Extraction frames + Encodage stéganographique
    ↓
Sauvegarde frames → video_temp.mp4 (sans audio)
    ↓
[NOUVEAU] FFmpeg merge audio original
    ↓
Vidéo Finale (avec audio) ✅
```

---

## 🧪 Test Immédiat

```bash
cd encoder
python main.py
```

1. Sélectionner une vidéo **avec son**
2. Sélectionner fichier SRT
3. Cliquer "Encoder"

**Résultat attendu :**
```
[INFO] Video writer setup: ...
[INFO] Merging video with original audio...
[INFO] Running ffmpeg to merge audio...
[INFO] ✅ Audio merged successfully
[INFO] Video saved successfully with audio: encoded_output.mp4
```

**Vérifier :** Lire `encoded_output.mp4` → Le son doit être présent ! 🔊

---

## 📊 Comparaison

| Avant | Après |
|-------|-------|
| ❌ Vidéo sans son | ✅ Vidéo avec son |
| 📹 Muet | 📹🔊 Audio intact |
| OpenCV seulement | OpenCV + FFmpeg |

---

## ⚠️ Si FFmpeg N'est Pas Installé

**Le système fonctionne quand même !**

Console affichera :
```
[WARNING] ffmpeg not found, cannot merge audio
[WARNING] Audio merge failed, using video without audio
[INFO] Video saved without audio: encoded_output.mp4
```

➡️ **Installation recommandée** pour avoir l'audio !

---

## 🎯 Avantages

✅ **Audio original préservé** à 100%  
✅ **Pas de perte qualité** (copie directe)  
✅ **Rapide** (pas de ré-encodage vidéo)  
✅ **Automatique** (transparent pour utilisateur)  
✅ **Compatible** (AAC pour web/mobile)  

---

## 📚 Documentation Complète

Voir `AUDIO_FIX.md` pour :
- Instructions détaillées installation
- Détails techniques
- Troubleshooting
- Exemples commandes ffmpeg

---

## ✅ Checklist

- [ ] FFmpeg installé
- [ ] `ffmpeg -version` fonctionne
- [ ] Terminal/IDE redémarré
- [ ] Test encodage réussi
- [ ] Audio présent dans vidéo finale ✅

---

**🎉 C'est corrigé ! Vos vidéos encodées auront maintenant le son !**
