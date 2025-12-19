/**
 * Ce fichier est maintenant géré dynamiquement dans le composant Dashboard
 * Les données sont récupérées via l'API getDashboardStats()
 * 
 * Format retourné pour le graphique :
 * {
 *   labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
 *   datasets: {
 *     label: "Plaintes",
 *     data: [12, 15, 8, 20, 18, 14, 10]
 *   }
 * }
 */

// Données par défaut si l'API échoue
export default {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  datasets: {
    label: "Plaintes",
    data: [0, 0, 0, 0, 0, 0, 0],
  },
};