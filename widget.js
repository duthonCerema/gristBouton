// Référence aux éléments de l'interface
const updateButton = document.getElementById('update-button');
const statusMessage = document.getElementById('status-message');
console.log("start!")
statusMessage.textContent = "v10";
const TABLE_NAME = 'Historique_notes';

// Initialisation de l'API Grist
grist.ready({
    requiredAccess: 'full', // Nécessite un accès complet pour écrire les données
    columns: ['FAIT', 'ACTIF'] // Spécifie les colonnes que nous allons lire et écrire
});


/**
 * Fonction pour parcourir la table Historique_notes et effectuer la mise à jour.
 */
async function desactiverNotesTerminees() {
    statusMessage.textContent = "Recherche des notes à désactiver...";
    updateButton.disabled = true;

    try {

        console.log("start bouton!")

        statusMessage.textContent = "avant await";

        // 1. Charger toutes les lignes de la table connectée.
        // Cette fonction retourne un objet qui contient à la fois tableId et tableData.
        const allRecords = await grist.docApi.fetchTable(TABLE_NAME);
        const tableId = TABLE_NAME;

        statusMessage.textContent = "après await";
        console.log(tableId);
        
        if (!tableId) {
            statusMessage.textContent = "Erreur: Le widget n'est pas lié à une table.";
            return;
        }
        console.log(tableId);
        
        // 3. Préparer le tableau des mises à jour
        const updates = [];
        let count = 0;

        // allRecords est un objet de type { id: [...], Fait: [...], ACTIF: [...] }
        const ids = allRecords.id;
        const faits = allRecords.FAIT;
        const actifs = allRecords.ACTIF;
        console.log(faits);
        console.log(actifs);

        console.log(faits.length);

        // Parcourir toutes les lignes
        for (let i = 0; i < faits.length; i++) {
            statusMessage.textContent = i;
            console.log(i);
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















