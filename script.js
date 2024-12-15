async function fetchAndProcessHTML() {
    try {
        console.log('Fetching the HTML file...');
        const response = await fetch('./distilled_emotions_passives.html');
        if (!response.ok) {
            alert('Failed to fetch the HTML file.');
            return;
        }

        const html = await response.text();
        console.log('HTML fetched successfully:', html.slice(0, 500));
        parseHTMLAndDisplayTable(html);
    } catch (error) {
        console.error('Error during fetch:', error);
        alert('An error occurred while fetching the HTML file.');
    }
}

function parseHTMLAndDisplayTable(html) {
    console.log('Parsing HTML content...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rows = doc.querySelectorAll('table.table-hover.table-striped tbody tr');
    console.log(`Found ${rows.length} table rows.`);

    const gemCounts = {
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
    console.log('Gem counts:', gemCounts);

    const tableBody = document.getElementById('results');
    tableBody.innerHTML = ''; // Clear previous results

    rows.forEach((row, index) => {
        try {
            console.log(`Row ${index + 1} content:`, row.innerHTML);

            const emotions = Array.from(row.querySelectorAll('td:first-child a.item_currency'))
                .map(e => e.textContent.trim());
            console.log(`Row ${index + 1}: Emotions -`, emotions);

            const passive = row.querySelector('td:nth-child(2) a')?.textContent.trim() || '';
            const effects = Array.from(row.querySelectorAll('td:nth-child(2) .implicitMod'))
                .map(e => e.textContent.trim())
                .join(' ');
            console.log(`Row ${index + 1}: Passive - ${passive}, Effects - ${effects}`);

            const requiredGems = {};
            emotions.forEach(emotion => {
                const cleanedEmotion = emotion.replace(/^Distilled\s+/, '').toLowerCase().replace(' ', '_');
                requiredGems[cleanedEmotion] = (requiredGems[cleanedEmotion] || 0) + 1;
            });
            
            console.log(`Row ${index + 1}: Required Gems -`, requiredGems);

            let canCraft = true;
            for (const [gem, requiredCount] of Object.entries(requiredGems)) {
                const availableCount = gemCounts[gem.toLowerCase().replace(' ', '_')] || 0;
                if (availableCount < requiredCount) {
                    console.log(`Row ${index + 1}: Missing ${gem} - Required: ${requiredCount}, Available: ${availableCount}`);
                    canCraft = false;
                    break;
                }
            }
            console.log(`Row ${index + 1}: Can craft? ${canCraft}`);
            
            if (emotions.length === 0 && passive === '') {
                return;
            }

            if (canCraft) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${passive}</td>
                    <td>${emotions.join(', ')}</td>
                    <td>${effects}</td>
                `;
                tableBody.appendChild(tr);
                console.log(`Row ${index + 1}: Added to table.`);
            }
        } catch (error) {
            console.error(`Error processing row ${index + 1}:`, error);
        }
    });
    
    console.log('Table update complete.');
}
