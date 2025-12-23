import React, { useState, useEffect } from 'react';
import { Vector, VectorOperation } from '../types';
import { generateId, calculateMagnitude, normalizeVector } from '../utils/vectorMath';
import '../styles/VectoringSPA.css';

const VectoringSPA: React.FC = () => {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [operations, setOperations] = useState<VectorOperation[]>([]);
  const [selectedVector, setSelectedVector] = useState<Vector | null>(null);

  useEffect(() => {
    // Initialize with sample vectors
    const createSampleVector = (id: string, name: string, dimensions: number[]): Vector => {
      const magnitude = calculateMagnitude(dimensions);
      const direction = normalizeVector(dimensions);
      return {
        id,
        name,
        dimensions,
        magnitude,
        direction,
        timestamp: new Date(),
      };
    };

    const sampleVectors: Vector[] = [
      createSampleVector('1', 'Vector Alpha', [3.5, 2.1, 4.7]),
      createSampleVector('2', 'Vector Beta', [1.2, 5.4, 2.8]),
      createSampleVector('3', 'Vector Gamma', [4.1, 3.3, 1.6]),
    ];
    setVectors(sampleVectors);

    // Initialize with sample operations
    const sampleOperations: VectorOperation[] = [
      {
        id: '1',
        type: 'add',
        inputVectors: ['1', '2'],
        resultVector: '4',
        status: 'completed',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'normalize',
        inputVectors: ['3'],
        resultVector: '5',
        status: 'processing',
        timestamp: new Date(),
      },
    ];
    setOperations(sampleOperations);
  }, []);

  const handleCreateVector = () => {
    const dimensions = [
      Math.random() * 5,
      Math.random() * 5,
      Math.random() * 5,
    ];
    const magnitude = calculateMagnitude(dimensions);
    const direction = normalizeVector(dimensions);
    
    const newVector: Vector = {
      id: generateId(),
      name: `Vector ${String.fromCharCode(65 + vectors.length)}`,
      dimensions,
      magnitude,
      direction,
      timestamp: new Date(),
    };
    setVectors([...vectors, newVector]);
  };

  const getStatusColor = (status: VectorOperation['status']) => {
    switch (status) {
      case 'completed':
        return '#4ade80';
      case 'processing':
        return '#fbbf24';
      case 'pending':
        return '#60a5fa';
      case 'failed':
        return '#f87171';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="vectoring-container">
      <header className="vectoring-header">
        <h1>Vectoring SPA</h1>
        <p className="vectoring-subtitle">Neuromorphic Vector Processing System</p>
      </header>

      <div className="vectoring-main">
        <section className="vector-section">
          <div className="section-header">
            <h2>Active Vectors</h2>
            <button onClick={handleCreateVector} className="button-primary">
              + Create Vector
            </button>
          </div>

          <div className="vector-grid">
            {vectors.map((vector) => (
              <div
                key={vector.id}
                className={`vector-card ${selectedVector?.id === vector.id ? 'selected' : ''}`}
                onClick={() => setSelectedVector(vector)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedVector(vector);
                    // Prevent scrolling when Space is pressed
                    e.preventDefault();
                  }
                }}
              >
                <div className="vector-header">
                  <h3>{vector.name}</h3>
                  <span className="vector-id">#{vector.id}</span>
                </div>
                
                <div className="vector-data">
                  <div className="data-row">
                    <span className="data-label">Dimensions:</span>
                    <span className="data-value">
                      [{vector.dimensions.map(d => d.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                  
                  <div className="data-row">
                    <span className="data-label">Magnitude:</span>
                    <span className="data-value">{vector.magnitude.toFixed(2)}</span>
                  </div>
                  
                  <div className="vector-visualization">
                    <div className="vector-bars">
                      {vector.dimensions.map((dim, idx) => (
                        <div
                          key={idx}
                          className="vector-bar"
                          style={{
                            height: `${(dim / 5) * 100}%`,
                            background: `linear-gradient(135deg, #667eea ${idx * 30}%, #764ba2 100%)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="operations-section">
          <div className="section-header">
            <h2>Vector Operations</h2>
          </div>

          <div className="operations-list">
            {operations.map((operation) => (
              <div key={operation.id} className="operation-card card">
                <div className="operation-header">
                  <div className="operation-type">
                    <span className="type-badge">{operation.type}</span>
                  </div>
                  <div
                    className="operation-status"
                    style={{
                      color: getStatusColor(operation.status),
                    }}
                  >
                    ● {operation.status}
                  </div>
                </div>
                
                <div className="operation-details">
                  <div className="detail-item">
                    <span className="detail-label">Input Vectors:</span>
                    <span className="detail-value">
                      {operation.inputVectors.join(', ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Result Vector:</span>
                    <span className="detail-value">{operation.resultVector}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">
                      {operation.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedVector && (
          <section className="vector-details-panel card">
            <div className="panel-header">
              <h3>Vector Details: {selectedVector.name}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedVector(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="panel-content">
              <div className="detail-group">
                <label>Vector ID</label>
                <p>{selectedVector.id}</p>
              </div>
              
              <div className="detail-group">
                <label>Dimensions</label>
                <p>[{selectedVector.dimensions.map(d => d.toFixed(4)).join(', ')}]</p>
              </div>
              
              <div className="detail-group">
                <label>Magnitude</label>
                <p>{selectedVector.magnitude.toFixed(4)}</p>
              </div>
              
              <div className="detail-group">
                <label>Direction (Normalized)</label>
                <p>[{selectedVector.direction.map(d => d.toFixed(4)).join(', ')}]</p>
              </div>
              
              <div className="detail-group">
                <label>Created</label>
                <p>{selectedVector.timestamp.toLocaleString()}</p>
              </div>
              
              <div className="panel-actions">
                <button
                  className="button-primary"
                  disabled
                  aria-disabled="true"
                  title="Not yet implemented"
                >
                  Transform
                </button>
                <button
                  className="button-secondary"
                  disabled
                  aria-disabled="true"
                  title="Not yet implemented"
                >
                  Normalize
                </button>
                <button
                  className="button-secondary"
                  disabled
                  aria-disabled="true"
                  title="Not yet implemented"
                >
                  Clone
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default VectoringSPA;
