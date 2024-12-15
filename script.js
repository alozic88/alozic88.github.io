async function fetchAndProcessHTML() {
    try {
        const response = await fetch('./distilled_emotions_passives.html');
        if (!response.ok) {
            alert('Failed to fetch the HTML file.');
            return;
        }

        const html = await response.text();
        parseHTMLAndDisplayTable(html);
    } catch (error) {
        console.error('Error during fetch:', error);
        alert('An error occurred while fetching the HTML file.');
    }
}

function getGemCountsFromInputs() {
    return {
        ire: parseInt(document.getElementById('ire').value) || 0,
        guilt: parseInt(document.getElementById('guilt').value) || 0,
        greed: parseInt(document.getElementById('greed').value) || 0,
        despair: parseInt(document.getElementById('despair').value) || 0,
        fear: parseInt(document.getElementById('fear').value) || 0,
        envy: parseInt(document.getElementById('envy').value) || 0,
        disgust: parseInt(document.getElementById('disgust').value) || 0,
        isolation: parseInt(document.getElementById('isolation').value) || 0,
        paranoia: parseInt(document.getElementById('paranoia').value) || 0,
        suffering: parseInt(document.getElementById('suffering').value) || 0
    };
}

function parseHTMLAndDisplayTable(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rows = doc.querySelectorAll('table.table-hover.table-striped tbody tr');

    const gemCounts = getGemCountsFromInputs();
    displayCraftablePassives(rows, gemCounts, 'results');
}

function displayCraftablePassives(rows, gemCounts, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = '';

    rows.forEach((row, index) => {
        try {
            const emotions = Array.from(row.querySelectorAll('td:first-child a.item_currency'))
                .map(e => e.textContent.trim());
            const passive = row.querySelector('td:nth-child(2) a')?.textContent.trim() || '';
            const effects = Array.from(row.querySelectorAll('td:nth-child(2) .implicitMod'))
                .map(e => e.textContent.trim())
                .join(' ');

            if (emotions.length === 0 && passive === '') return;

            const requiredGems = {};
            emotions.forEach(emotion => {
                const cleanedEmotion = emotion.replace(/^Distilled\s+/, '').toLowerCase().replace(' ', '_');
                requiredGems[cleanedEmotion] = (requiredGems[cleanedEmotion] || 0) + 1;
            });

            let canCraft = true;
            for (const [gem, requiredCount] of Object.entries(requiredGems)) {
                const availableCount = gemCounts[gem] || 0;
                if (availableCount < requiredCount) {
                    canCraft = false;
                    break;
                }
            }

            if (canCraft) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${passive}</td>
                    <td>${emotions.join(', ')}</td>
                    <td>${effects}</td>
                `;
                tableBody.appendChild(tr);
            }

        } catch (error) {
            console.error(`Error processing row ${index + 1}:`, error);
        }
    });
    console.log('Table update complete for', tableBodyId);
}

function resetGems() {
    document.getElementById('ire').value = 0;
    document.getElementById('guilt').value = 0;
    document.getElementById('greed').value = 0;
    document.getElementById('despair').value = 0;
    document.getElementById('fear').value = 0;
    document.getElementById('envy').value = 0;
    document.getElementById('disgust').value = 0;
    document.getElementById('isolation').value = 0;
    document.getElementById('paranoia').value = 0;
    document.getElementById('suffering').value = 0;
}

const reforgeChain = {
    ire: 'guilt',
    guilt: 'greed',
    greed: 'paranoia',
    paranoia: 'envy',
    envy: 'disgust',
    disgust: 'despair',
    despair: 'fear',
    fear: 'suffering',
    suffering: 'isolation'
};

function reforge(gemId, keepOne) {
    const currentVal = parseInt(document.getElementById(gemId).value) || 0;
    const nextGem = reforgeChain[gemId];

    if (!nextGem) {
        alert(gemId + " does not reforge further.");
        return;
    }

    const nextVal = parseInt(document.getElementById(nextGem).value) || 0;

    if (keepOne && currentVal > 0) {
        const available = currentVal - 1;
        const sets = Math.floor(available / 3);

        if (sets > 0) {
            const used = sets * 3;
            const leftover = available - used;
            const finalCurrentVal = leftover + 1;
            const finalNextVal = nextVal + sets;

            document.getElementById(gemId).value = finalCurrentVal;
            document.getElementById(nextGem).value = finalNextVal;
        } else {
            alert("Not enough gems to reforge with Keep 1.");
        }

    } else {
        const sets = Math.floor(currentVal / 3);
        if (sets > 0) {
            const used = sets * 3;
            const leftover = currentVal - used;
            document.getElementById(gemId).value = leftover;
            document.getElementById(nextGem).value = nextVal + sets;
        } else {
            alert("Not enough gems to reforge.");
        }
    }
}