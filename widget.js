// Initialisation de l'API Grist
grist.ready({
    requiredAccess: 'full', // Nécessite un accès complet pour écrire les données
    columns: ['Fait', 'ACTIF'] // Spécifie les colonnes que nous allons lire et écrire
});

// Référence aux éléments de l'interface
const updateButton = document.getElementById('update-button');
const statusMessage = document.getElementById('status-message');

/**
 * Fonction pour parcourir la table Historique_notes et effectuer la mise à jour.
 */
async function desactiverNotesTerminees() {
    statusMessage.textContent = "Recherche des notes à désactiver...";
    updateButton.disabled = true;

    try {
        // 1. Obtenir le nom de la table connectée
        // Le widget doit être lié à la table Historique_notes
        const tableId = await grist.getTableId();
        
        if (!tableId) {
            statusMessage.textContent = "Erreur: Le widget n'est pas lié à une table (Historique_notes).";
            return;
        }

        // 2. Charger toutes les lignes de la table connectée
        // La colonne 'id' est implicitement incluse.
        const allRecords = await grist.fetchSelectedTable();
        
        // 3. Préparer le tableau des mises à jour
        const updates = [];
        let count = 0;

        // allRecords est un objet de type { id: [...], Fait: [...], ACTIF: [...] }
        const ids = allRecords.id;
        const faits = allRecords.Fait;
        const actifs = allRecords.ACTIF;

        // Parcourir toutes les lignes
        for (let i = 0; i < ids.length; i++) {
            // Vérifier la condition : Fait est True ET ACTIF n'est pas déjà False
            if (faits[i] === true && actifs[i] !== false) {
                updates.push({
                    id: ids[i],
                    fields: {
                        ACTIF: false
                    }
                });
                count++;
            }
        }

        // 4. Effectuer la mise à jour massive
        if (updates.length > 0) {
            await grist.docApi.applyUserActions([
                ['UpdateRecords', tableId, updates]
            ]);
            statusMessage.textContent = `${count} lignes mises à jour dans la table "${tableId}".`;
        } else {
            statusMessage.textContent = "Aucune ligne à mettre à jour n'a été trouvée.";
        }
        
    } catch (error) {
        console.error("Erreur lors de la mise à jour Grist:", error);
        statusMessage.textContent = `Erreur lors de l'exécution: ${error.message || error}`;
    } finally {
        updateButton.disabled = false;
    }
}

// Attacher la fonction au bouton
updateButton.addEventListener('click', desactiverNotesTerminees);