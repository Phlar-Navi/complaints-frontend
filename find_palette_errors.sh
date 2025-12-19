#!/bin/bash

# Chercher tous les fichiers qui utilisent "palette" sans l'importer
# Dans votre dossier frontend

echo "🔍 Recherche des usages de 'palette' sans import..."
echo ""

# Chercher dans les fichiers JS/JSX
grep -rn "palette\[" src/ --include="*.js" --include="*.jsx" | while read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    line_number=$(echo "$line" | cut -d: -f2)
    
    # Vérifier si le fichier importe palette
    if ! grep -q "import.*palette" "$file"; then
        echo "❌ PROBLÈME TROUVÉ:"
        echo "   Fichier: $file"
        echo "   Ligne: $line_number"
        echo "   Contenu: $(echo "$line" | cut -d: -f3-)"
        echo ""
    fi
done

echo "Recherche terminée."
echo ""
echo "Vérifiez aussi manuellement ces fichiers:"
echo "  - src/assets/theme/functions/index.js"
echo "  - src/assets/theme/components/icon/index.js"
echo "  - Tout fichier dans src/examples/ ou src/layouts/"