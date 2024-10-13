document.getElementById('calculatorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const expression = document.getElementById('expressionInput').value;
  const encodedExpression = encodeURIComponent(expression);
  const apiUrl = `https://www.inchcalculator.com/api/calculators/feet-and-inches/?uc_length=${encodedExpression}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const result = data.results;

      // Clear previous results
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '';  // Clear previous results

      // Function to safely create elements with text content
      function createResultItem(label, value) {
        const p = document.createElement('p');
        const strongLabel = document.createElement('strong');
        strongLabel.textContent = label;

        const spanValue = document.createElement('span');
        spanValue.textContent = ` ${value} `;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-btn';
        copyButton.setAttribute('data-copy', value);

        // Attach copy button functionality
        copyButton.addEventListener('click', function () {
          const textToCopy = value; // Copy the value directly
          navigator.clipboard.writeText(textToCopy).then(() => {
            alert(`Copied to clipboard: ${textToCopy}`);
          }).catch(err => {
            console.error('Error copying to clipboard', err);
          });
        });

        // Append label, value, and copy button
        p.appendChild(strongLabel);
        p.appendChild(spanValue);
        p.appendChild(copyButton);

        resultDiv.appendChild(p);
      }

      // Create and append each result item
      createResultItem('Display Value:', result.display_value);
      createResultItem('Inches:', `${result.inches.standard} inches`);
      createResultItem('Feet:', `${result.feet.standard} feet`);
      createResultItem('Millimeters:', `${result.millimeters.standard} mm`);
      createResultItem('Centimeters:', `${result.centimeters.standard} cm`);
      createResultItem('Meters:', `${result.meters.standard} m`);
    })
    .catch(err => console.error('Error fetching data: ', err));
});
