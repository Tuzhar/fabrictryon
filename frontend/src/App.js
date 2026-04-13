import React, { useState, useRef } from 'react';
import './App.css';

const OUTFIT_OPTIONS = [
  { value: 'kurta',         label: '👘 Kurta' },
  { value: 'suit',          label: '🧥 Suit Set' },
  { value: 'shirt',         label: '👔 Shirt' },
  { value: 'lehenga',       label: '👗 Lehenga' },
  { value: 'saree',         label: '🥻 Saree' },
  { value: 'salwar_kameez', label: '👘 Salwar Kameez' },
  { value: 'sherwani',      label: '🎩 Sherwani' },
  { value: 'anarkali',      label: '✨ Anarkali' },
];

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ImageUploadBox({ label, hint, file, onFile, icon }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFile(f);
  };

  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div
      className={`upload-box ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
      onClick={() => inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <div className="upload-preview">
          <img src={preview} alt={label} />
          <div className="upload-overlay">
            <span>Change Photo</span>
          </div>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">{icon}</div>
          <div className="upload-label">{label}</div>
          <div className="upload-hint">{hint}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [personFile, setPersonFile]   = useState(null);
  const [fabricFile, setFabricFile]   = useState(null);
  const [outfitType, setOutfitType]   = useState('kurta');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');
  const [promptUsed, setPromptUsed]   = useState('');

  const handleGenerate = async () => {
    if (!personFile || !fabricFile) {
      setError('Please upload both a person photo and a fabric image.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('person_image', personFile);
      formData.append('fabric_image', fabricFile);
      formData.append('outfit_type', outfitType);

      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Generation failed');
      }

      setResult(`data:image/png;base64,${data.image_base64}`);
      setPromptUsed(data.prompt_used || '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `tryon_${outfitType}_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🪡</span>
            <div>
              <div className="logo-title">FabricFit</div>
              <div className="logo-sub">AI Virtual Try-On for Indian Fabrics</div>
            </div>
          </div>
          <div className="header-badge">Powered by Stable Diffusion</div>
        </div>
      </header>

      <main className="main">
        {/* Step panel */}
        <section className="panel">
          <div className="panel-title">
            <span className="step-badge">1</span>
            Upload Images
          </div>

          <div className="upload-row">
            <div className="upload-col">
              <div className="upload-col-label">Person Photo</div>
              <ImageUploadBox
                label="Upload Person"
                hint="Full body photo works best"
                icon="🧍"
                file={personFile}
                onFile={setPersonFile}
              />
            </div>
            <div className="upload-divider">+</div>
            <div className="upload-col">
              <div className="upload-col-label">Fabric / Cloth</div>
              <ImageUploadBox
                label="Upload Fabric"
                hint="Clear fabric texture image"
                icon="🧵"
                file={fabricFile}
                onFile={setFabricFile}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span className="step-badge">2</span>
            Select Outfit Type
          </div>
          <div className="outfit-grid">
            {OUTFIT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`outfit-btn ${outfitType === opt.value ? 'active' : ''}`}
                onClick={() => setOutfitType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel generate-panel">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !personFile || !fabricFile}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Generating…
              </span>
            ) : (
              <>✨ Generate Try-On</>
            )}
          </button>

          {loading && (
            <div className="loading-note">
              This may take 20–40 seconds. AI is stitching your outfit…
            </div>
          )}

          {error && <div className="error-msg">⚠️ {error}</div>}
        </section>

        {result && (
          <section className="panel result-panel">
            <div className="panel-title">
              <span className="step-badge">3</span>
              Your Virtual Try-On
            </div>
            <div className="result-image-wrap">
              <img src={result} alt="Generated Try-On" className="result-image" />
            </div>
            {promptUsed && (
              <details className="prompt-details">
                <summary>View AI Prompt Used</summary>
                <p className="prompt-text">{promptUsed}</p>
              </details>
            )}
            <button className="download-btn" onClick={handleDownload}>
              ⬇ Download Image
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>FabricFit MVP · AI results are approximate visualizations, not exact representations</p>
      </footer>
    </div>
  );
}
