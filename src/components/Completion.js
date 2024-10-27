// src/components/Completion.js

import React from 'react';
import PropTypes from 'prop-types';
import './Completion.css'; // Optional: For styling

// Import Chart.js components
import { PolarArea } from 'react-chartjs-2';
import { Chart, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(RadialLinearScale, ArcElement, Tooltip, Legend);

function Completion({ facetScores, domainScores }) {
  // Defensive checks to ensure facetScores and domainScores are objects
  const validFacetScores =
    facetScores && typeof facetScores === 'object' ? facetScores : {};
  const validDomainScores =
    domainScores && typeof domainScores === 'object' ? domainScores : {};

  // Prepare data for the Polar Area Chart
  const domainLabels = Object.keys(validDomainScores);
  const domainValues = Object.values(validDomainScores).map((score) => {
    // Normalize scores between 1 and 5
    if (score < 1) return 1;
    if (score > 5) return 5;
    return score;
  });

  const polarData = {
    labels: domainLabels,
    datasets: [
      {
        label: 'Domain Scores',
        data: domainValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const polarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        grid: {
          circular: true,
        },
        angleLines: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        enabled: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="completion-container">
      <h2>Test Completed</h2>

      <div className="scores-section">
        {/* Facet Scores */}
        <div className="facet-scores">
          <h3>Facet Scores:</h3>
          {Object.keys(validFacetScores).length > 0 ? (
            <ul>
              {Object.entries(validFacetScores).map(([facet, score]) => (
                <li key={facet}>
                  <strong>{facet}:</strong> {score}
                </li>
              ))}
            </ul>
          ) : (
            <p>No facet scores available.</p>
          )}
        </div>

        {/* Domain Scores Chart */}
        <div className="domain-scores-chart">
          <h3>Domain Scores:</h3>
          {Object.keys(validDomainScores).length > 0 ? (
            <div className="chart-container">
              <PolarArea data={polarData} options={polarOptions} />
            </div>
          ) : (
            <p>No domain scores available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

Completion.propTypes = {
  facetScores: PropTypes.object,
  domainScores: PropTypes.object,
};

Completion.defaultProps = {
  facetScores: {},
  domainScores: {},
};

export default Completion;
