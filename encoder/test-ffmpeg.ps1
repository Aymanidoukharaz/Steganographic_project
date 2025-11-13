# Script de vérification et test FFmpeg
# Exécuter ce script pour vérifier l'installation

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Vérification Installation FFmpeg" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Vérifier si ffmpeg est dans PATH
Write-Host "Test 1: Vérification ffmpeg dans PATH..." -ForegroundColor Yellow
try {
    $ffmpegVersion = & ffmpeg -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ FFmpeg trouvé dans PATH!" -ForegroundColor Green
        $versionLine = ($ffmpegVersion | Select-Object -First 1)
        Write-Host "   Version: $versionLine" -ForegroundColor Gray
    } else {
        throw "FFmpeg non fonctionnel"
    }
} catch {
    Write-Host "❌ FFmpeg NON trouvé dans PATH" -ForegroundColor Red
    Write-Host "   Raison: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  SOLUTION: Redémarrez PowerShell/VS Code" -ForegroundColor Yellow
    Write-Host "   FFmpeg a été installé mais le PATH n'est pas encore chargé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Après redémarrage, réexécutez ce script" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Test 2: Vérifier emplacement ffmpeg
Write-Host "Test 2: Localisation ffmpeg..." -ForegroundColor Yellow
try {
    $ffmpegPath = (Get-Command ffmpeg).Source
    Write-Host "✅ Emplacement: $ffmpegPath" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Impossible de localiser ffmpeg" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Vérifier les codecs
Write-Host "Test 3: Vérification codecs (AAC pour audio)..." -ForegroundColor Yellow
try {
    $codecs = & ffmpeg -codecs 2>&1 | Select-String "aac"
    if ($codecs) {
        Write-Host "✅ Codec AAC disponible" -ForegroundColor Green
        Write-Host "   $($codecs[0])" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Codec AAC non trouvé" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de vérifier codecs" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Test simple de conversion
Write-Host "Test 4: Test conversion (création fichier test)..." -ForegroundColor Yellow

# Créer un fichier vidéo de test ultra-simple (1 seconde, noir)
$testInput = "test_input_temp.mp4"
$testOutput = "test_output_temp.mp4"

try {
    # Créer vidéo test (1 sec, noir, muet)
    Write-Host "   Création vidéo test..." -ForegroundColor Gray
    & ffmpeg -y -f lavfi -i color=c=black:s=320x240:d=1 -c:v libx264 -pix_fmt yuv420p $testInput 2>&1 | Out-Null
    
    if (Test-Path $testInput) {
        Write-Host "   ✓ Vidéo test créée" -ForegroundColor Gray
        
        # Tester conversion
        Write-Host "   Test conversion..." -ForegroundColor Gray
        & ffmpeg -y -i $testInput -c:v copy $testOutput 2>&1 | Out-Null
        
        if (Test-Path $testOutput) {
            Write-Host "✅ Test conversion réussi!" -ForegroundColor Green
            
            # Nettoyage
            Remove-Item $testInput -ErrorAction SilentlyContinue
            Remove-Item $testOutput -ErrorAction SilentlyContinue
        } else {
            Write-Host "❌ Test conversion échoué" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Impossible de créer vidéo test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Test de conversion ignoré: $_" -ForegroundColor Yellow
    # Nettoyage en cas d'erreur
    Remove-Item $testInput -ErrorAction SilentlyContinue
    Remove-Item $testOutput -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Résumé" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FFmpeg est correctement installé et fonctionnel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Vous pouvez maintenant:" -ForegroundColor Cyan
    Write-Host "   1. Lancer l'encodeur: python main.py" -ForegroundColor White
    Write-Host "   2. Les vidéos encodées auront le son ✅" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  FFmpeg installé mais PATH pas encore chargé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 À faire:" -ForegroundColor Cyan
    Write-Host "   1. Fermez cette fenêtre PowerShell" -ForegroundColor White
    Write-Host "   2. Fermez VS Code complètement" -ForegroundColor White
    Write-Host "   3. Rouvrez VS Code" -ForegroundColor White
    Write-Host "   4. Réexécutez ce script" -ForegroundColor White
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
