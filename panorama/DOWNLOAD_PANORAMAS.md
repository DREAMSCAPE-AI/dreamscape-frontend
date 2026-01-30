# 📸 Guide de Téléchargement des Panoramas 360°

Ce guide vous aide à trouver et installer des images panoramiques 360° pour Paris et Barcelona.

## 🎯 Images Requises

### 🗼 Paris (5 scènes)
1. `eiffel-tower.jpg` - Tour Eiffel vue du Champ de Mars
2. `louvre.jpg` - Pyramide du Louvre
3. `arc-triomphe.jpg` - Arc de Triomphe
4. `notre-dame.jpg` - Cathédrale Notre-Dame
5. `sacre-coeur.jpg` - Basilique du Sacré-Cœur

### 🏖️ Barcelona (5 scènes)
1. `sagrada-familia.jpg` - Sagrada Família
2. `park-guell.jpg` - Park Güell
3. `casa-batllo.jpg` - Casa Batlló
4. `la-rambla.jpg` - La Rambla
5. `barceloneta.jpg` - Plage de Barceloneta

---

## 🆓 Sources GRATUITES Recommandées

### 1. Flickr (Meilleure option gratuite)

**Recherche** : https://www.flickr.com/search/?text=equirectangular

**Mots-clés par scène** :
```
Paris:
- "equirectangular eiffel tower"
- "equirectangular louvre"
- "equirectangular arc de triomphe"
- "equirectangular notre dame paris"
- "equirectangular sacre coeur"

Barcelona:
- "equirectangular sagrada familia"
- "equirectangular park guell"
- "equirectangular casa batllo"
- "equirectangular la rambla"
- "equirectangular barceloneta beach"
```

**Filtres importants** :
1. Cliquer sur "Any license" → Sélectionner "Commercial use allowed"
2. Chercher des images > 4000px de large
3. Vérifier le ratio 2:1

**Comment télécharger** :
1. Cliquer sur l'image
2. Cliquer sur la flèche de téléchargement ⬇️
3. Choisir "Original" (taille maximale)
4. Renommer selon notre convention

### 2. Poly Haven (Haute qualité, domaine public)

**URL** : https://polyhaven.com/hdris

**Avantages** :
- Domaine public (CC0)
- Très haute qualité
- Plusieurs résolutions disponibles

**Limites** :
- Moins de lieux spécifiques
- Plus orienté nature/architecture générique

### 3. Google Street View (Usage limité)

⚠️ **Attention** : Usage non-commercial uniquement sans permission

**Outil de téléchargement** : https://renderstuff.com/tools/360-panorama-web-viewer-embed/

**Étapes** :
1. Trouver le lieu sur Google Maps
2. Copier l'URL Street View
3. Utiliser l'outil ci-dessus pour extraire
4. Télécharger en haute résolution

### 4. Pexels 360 (Stock photos gratuites)

**URL** : https://www.pexels.com/search/360/

**Recherche** :
- "360 paris"
- "360 barcelona"
- "panoramic [monument]"

---

## 💰 Sources PAYANTES (Qualité Pro)

### 1. Adobe Stock 360

**URL** : https://stock.adobe.com/

**Prix** : ~30€/image
**Qualité** : ⭐⭐⭐⭐⭐
**Recherche** : "360 equirectangular paris"

### 2. Shutterstock 360

**URL** : https://www.shutterstock.com/

**Prix** : Abonnement à partir de 29€/mois
**Qualité** : ⭐⭐⭐⭐⭐

### 3. iStock 360

**URL** : https://www.istockphoto.com/

**Prix** : ~20-50€/image
**Bonne sélection** de lieux touristiques

---

## 📥 Installation des Panoramas

### Méthode 1 : Manuel

```bash
# 1. Télécharger les images depuis Flickr/autre source

# 2. Renommer selon notre convention
# Paris:
mv downloaded-image-1.jpg eiffel-tower.jpg
mv downloaded-image-2.jpg louvre.jpg
# ... etc

# 3. Copier dans le bon dossier
cp eiffel-tower.jpg dreamscape-frontend/panorama/public/panoramas/paris/
cp louvre.jpg dreamscape-frontend/panorama/public/panoramas/paris/
# ... etc
```

### Méthode 2 : Script automatique

Créer un fichier `download-panoramas.sh` :

```bash
#!/bin/bash

# Paris
echo "📥 Téléchargement panoramas Paris..."
# Remplacer les URLs par vos images Flickr
curl -o public/panoramas/paris/eiffel-tower.jpg "URL_FLICKR_1"
curl -o public/panoramas/paris/louvre.jpg "URL_FLICKR_2"
# ... etc

# Barcelona
echo "📥 Téléchargement panoramas Barcelona..."
curl -o public/panoramas/barcelona/sagrada-familia.jpg "URL_FLICKR_6"
# ... etc

echo "✅ Téléchargement terminé!"
```

---

## 🖼️ Création des Thumbnails

### Avec ImageMagick (gratuit)

```bash
# Installer ImageMagick
# Windows: https://imagemagick.org/script/download.php#windows
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Générer les thumbnails (400x200)
cd public/panoramas/paris
for img in *.jpg; do
  convert "$img" -resize 400x200 "thumbnails/${img%.jpg}-thumb.jpg"
done

cd ../barcelona
for img in *.jpg; do
  convert "$img" -resize 400x200 "thumbnails/${img%.jpg}-thumb.jpg"
done
```

### Avec Python (script fourni)

```python
# resize_thumbnails.py (à créer)
from PIL import Image
import os

def create_thumbnail(input_path, output_path, size=(400, 200)):
    img = Image.open(input_path)
    img.thumbnail(size, Image.Resampling.LANCZOS)
    img.save(output_path, 'JPEG', quality=80)

# Paris
for img_name in ['eiffel-tower', 'louvre', 'arc-triomphe', 'notre-dame', 'sacre-coeur']:
    create_thumbnail(
        f'public/panoramas/paris/{img_name}.jpg',
        f'public/panoramas/paris/thumbnails/{img_name}-thumb.jpg'
    )

# Barcelona
for img_name in ['sagrada-familia', 'park-guell', 'casa-batllo', 'la-rambla', 'barceloneta']:
    create_thumbnail(
        f'public/panoramas/barcelona/{img_name}.jpg',
        f'public/panoramas/barcelona/thumbnails/{img_name}-thumb.jpg'
    )

print("✅ Thumbnails créés!")
```

---

## ✅ Checklist de Vérification

Après téléchargement, vérifier :

- [ ] **Format** : Fichiers .jpg (pas .png)
- [ ] **Ratio** : 2:1 (largeur = 2 × hauteur)
- [ ] **Taille** : Minimum 4096x2048px
- [ ] **Nommage** : Exact selon la convention
- [ ] **Projection** : Équirectangulaire (pas cubemap)
- [ ] **Thumbnails** : 400x200px créés

### Test rapide

```bash
# Vérifier les dimensions
file public/panoramas/paris/*.jpg

# Devrait afficher : "JPEG image data, ... 8192 x 4096" ou similaire
```

---

## 🎨 Placeholders Temporaires

Si vous n'avez pas encore les vraies images, utilisez des placeholders :

**Service recommandé** : https://placeholder.com/

```bash
# Générer des placeholders (8192x4096)
curl "https://via.placeholder.com/8192x4096/87CEEB/FFFFFF?text=Tour+Eiffel" \
  -o public/panoramas/paris/eiffel-tower.jpg

curl "https://via.placeholder.com/8192x4096/87CEEB/FFFFFF?text=Sagrada+Familia" \
  -o public/panoramas/barcelona/sagrada-familia.jpg

# ... etc pour toutes les scènes
```

---

## 🧪 Test des Panoramas

### 1. Vérifier qu'ils se chargent

```bash
cd dreamscape-frontend/panorama
npm run dev
```

Ouvrir : http://localhost:3006?environment=paris

### 2. Vérifier la console

```
✅ Image chargée: 8192 x 4096
✅ Image déjà aux bonnes dimensions pour ce GPU
✅ Texture chargée avec succès
```

### 3. Vérifier l'affichage

- La sphère doit afficher l'image
- Pas de déformation étrange
- Navigation fluide
- FPS > 30

---

## 📊 Récapitulatif

| Scène | Fichier | Source | Statut |
|-------|---------|--------|--------|
| Tour Eiffel | eiffel-tower.jpg | Flickr | ⬜ À faire |
| Louvre | louvre.jpg | Flickr | ⬜ À faire |
| Arc Triomphe | arc-triomphe.jpg | Flickr | ⬜ À faire |
| Notre-Dame | notre-dame.jpg | Flickr | ⬜ À faire |
| Sacré-Cœur | sacre-coeur.jpg | Flickr | ⬜ À faire |
| Sagrada Família | sagrada-familia.jpg | Flickr | ⬜ À faire |
| Park Güell | park-guell.jpg | Flickr | ⬜ À faire |
| Casa Batlló | casa-batllo.jpg | Flickr | ⬜ À faire |
| La Rambla | la-rambla.jpg | Flickr | ⬜ À faire |
| Barceloneta | barceloneta.jpg | Flickr | ⬜ À faire |

---

## 💡 Conseils Pro

1. **Privilégier Flickr CC** pour commencer (gratuit, bonne qualité)
2. **Vérifier la licence** avant téléchargement
3. **Télécharger en Original** (taille max)
4. **Tester immédiatement** après chaque download
5. **Garder les sources** (URLs Flickr) pour référence

## 🆘 Besoin d'Aide ?

Si vous ne trouvez pas d'images ou avez des questions :
1. Consulter `ENVIRONMENTS_README.md`
2. Vérifier les logs de la console navigateur
3. Tester avec des placeholders d'abord

---

**Bon téléchargement !** 🚀
