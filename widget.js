// Initialisation de l'API Grist
grist.ready({
    requiredAccess: 'full', // Nécessite un accès complet pour écrire les données
    columns: ['Fait', 'ACTIF'] // Spécifie les colonnes que nous allons lire et écrire
});

// Référence aux éléments de l'interface
const updateButton = document.getElementById('update-button');
const statusMessage = document.getElementById('status-message');


statusMessage.textContent = "ggg";
/**
 * Fonction pour parcourir la table Historique_notes et effectuer la mise à jour.
 */
async function desactiverNotesTerminees() {
    statusMessage.textContent = "Recherche des notes à désactiver...";
    updateButton.disabled = true;

    try {

        statusMessage.textContent = "avant await";

        // 1. Charger toutes les lignes de la table connectée.
        // Cette fonction retourne un objet qui contient à la fois tableId et tableData.
        const result = await grist.fetchSelectedTable();

        statusMessage.textContent = "après await";
        
        // 2. Extraire l'ID de la table et les données du résultat
        const tableId = result.tableId; // <-- C'est ainsi que vous obtenez le nom de la table
        const allRecords = result.tableData; // <-- C'est ainsi que vous obtenez les données des colonnes
        
        if (!tableId) {
            statusMessage.textContent = "Erreur: Le widget n'est pas lié à une table.";
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
            statusMessage.textContent = str(i);
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
        statusMessage.textContent = "finally";
    }
}

// Attacher la fonction au bouton

updateButton.addEventListener('click', desactiverNotesTerminees);



