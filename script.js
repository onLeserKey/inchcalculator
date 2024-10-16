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

      // Function to sanitize HTML and insert a non-breaking space before the first <span>
      function sanitizeHtml(html) {
        const tempDiv = document.createElement('div');
        const cleanHtml = html.replace('<span', '&nbsp;<span');
        tempDiv.innerHTML = cleanHtml;
        return tempDiv.textContent || tempDiv.innerText || '';
      }

      // Function to round fractions to nearest 1/8, 1/4, or 1/2
      function roundFraction(fraction) {
        let [numerator, denominator] = fraction.split('/').map(Number);
        const targetDenominator = 8;
        const denominators = [128, 64, 32, 16, 8, 4, 2];

        if (denominator > targetDenominator) {
          let nextCheck = 0;
          let candidateNumerator = numerator + nextCheck;
          let candidateDomenator = 0.0;
          let foundNumeratorCandidate = 0;
          let foundDomenator = denominator;
          let diff = 0.0;
          let bestDiff = 0.0;

          while (candidateNumerator < denominator && candidateNumerator > 0 && foundNumeratorCandidate == 0) {
            nextCheck++
            for (let i = 0; i < denominators.length; i++) {
              let nextDomenator = denominators[i];
              candidateDomenator = denominator / nextDomenator;
              if (candidateDomenator > targetDenominator) continue;

              candidateNumerator = numerator + nextCheck;
              diff = candidateNumerator / nextDomenator - Math.round(candidateNumerator / nextDomenator);
              
              if (diff == 0) {
                foundNumeratorCandidate = candidateNumerator;
                foundDomenator = nextDomenator;
                break;
              }

              candidateNumerator = numerator - nextCheck;
              diff = candidateNumerator / nextDomenator - Math.round(candidateNumerator / nextDomenator);
              if (diff == 0) {
                foundNumeratorCandidate = candidateNumerator;
                foundDomenator = nextDomenator;
                break;
              }
            }
            if (foundNumeratorCandidate != 0) {
              numerator = foundNumeratorCandidate / foundDomenator;
              denominator = denominator / foundDomenator;
              break;
            }
          }
                    
          return `${numerator}/${denominator}`;
        }

        return fraction;
      }

      // Function to handle complex measurements with feet, inches, and fractions
      function roundMeasurement(measurement) {
        measurement = sanitizeHtml(measurement);
        const feetInchesRegex = /(?:(\d+)')?\s*(?:(\d+))?\s*(\d+\/\d+)?"/;
        const match = measurement.match(feetInchesRegex);

        if (match) {
          let feet = match[1] ? match[1] + "'" : '';
          let inches = match[2] ? match[2] : '';
          let fraction = match[3] ? match[3] : '';

          if (fraction) {
            fraction = roundFraction(fraction);
          }

          let result = `${feet} ${inches}`;
          if (fraction) {
            result += ` ${fraction}"`;
          } else if (inches) {
            result += '"';
          }

          return result.trim();
        }

        return measurement;
      }

      // Function to create result items and sanitize the value if needed
      function createResultItem(label, value, sanitize = false) {
        const p = document.createElement('p');
        const strongLabel = document.createElement('strong');
        strongLabel.textContent = label;

        const spanValue = document.createElement('span');
        const cleanValue = sanitize ? sanitizeHtml(value) : value;
        spanValue.textContent = ` ${cleanValue} `;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-btn';
        copyButton.setAttribute('data-copy', cleanValue);

        copyButton.addEventListener('click', function () {
          navigator.clipboard.writeText(cleanValue).then(() => {
            alert(`Copied to clipboard: ${cleanValue}`);
          }).catch(err => {
            console.error('Error copying to clipboard', err);
          });
        });

        p.appendChild(copyButton);
        p.appendChild(strongLabel);
        p.appendChild(spanValue);
        

        resultDiv.appendChild(p);

        return cleanValue;
      }

      // Create and append each result item (sanitize only those with HTML)
      createResultItem('Imperial:', result.display_value, true);

      // Add a second display for the rounded fraction
      const roundedMeasurement = roundMeasurement(result.display_value);
      createResultItem('Rounded:', roundedMeasurement);
      const inches = createResultItem('Inches & fractions:', result.inches.fraction + "\"", true);
      createResultItem('Rounded:', roundMeasurement(inches), true);
      createResultItem('Decimal Inches:', result.inches.standard.replace(",", ""));
      createResultItem('Decimal Inches:', result.inches.precision.replace(",", ""));
      createResultItem('Decimal Feet:', result.feet.standard.replace(",", ""));
      createResultItem('Decimal Feet:', result.feet.precision.replace(",", ""));
      createResultItem('Millimeters:', result.millimeters.standard.replace(",",""));
      //createResultItem('Millimeters:', result.millimeters.precision.replace(",",""));
      createResultItem('Centimeters:', result.centimeters.standard.replace(",", ""));
      //createResultItem('Centimeters:', result.centimeters.precision.replace(",", ""));
      createResultItem('Meters:', result.meters.standard.replace(",", ""));
      createResultItem('Meters:', result.meters.precision.replace(",", ""));
    })
    .catch(err => console.error('Error fetching data: ', err));
});
