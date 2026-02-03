
import React, { useState, useRef } from 'react';
import { PRESET_POSES, ASPECT_RATIOS, LIGHTING_PRESETS, SKIN_TEXTURES, VARIATION_MODIFIERS } from './constants';
import { GeneratedImage, GenerationStatus, PresetPose } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPose, setSelectedPose] = useState<PresetPose | null>(null);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_PRESETS[0]);
  const [selectedSkinTexture, setSelectedSkinTexture] = useState(SKIN_TEXTURES[0]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const faceInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setter(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async (variationModifier?: string) => {
    if (!faceImage) {
      setError("IDENTITY REQUIRED: Please upload the source face.");
      return;
    }
    if (!outfitImage) {
      setError("OUTFIT REQUIRED: Please provide a garment reference.");
      return;
    }

    const basePrompt = selectedPose ? `${selectedPose.prompt}. ${customPrompt}` : customPrompt;
    const promptToUse = variationModifier ? `${basePrompt}. Variation: ${variationModifier}` : basePrompt;
    
    setStatus(GenerationStatus.LOADING);
    setError(null);

    try {
      const imageUrl = await geminiService.generateInfluencerImage(
        faceImage, 
        promptToUse, 
        outfitImage || undefined, 
        productImage || undefined,
        selectedRatio.value,
        selectedLighting.prompt,
        selectedSkinTexture.prompt
      );
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: promptToUse,
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Synthesis failed.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const triggerVariation = () => {
    const randomMod = VARIATION_MODIFIERS[Math.floor(Math.random() * VARIATION_MODIFIERS.length)];
    generateImage(randomMod);
  };

  const removeImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-sans selection:bg-indigo-500/30 tracking-tight">
      {/* SaaS Navbar */}
      <header className="h-20 px-8 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-sm">
            <span className="text-black font-black text-xl italic">A</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase">ARCHETYPE<span className="text-indigo-500 italic">STUDIO</span></h1>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest mt-0.5 uppercase">Professional Content Engine</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            8K Real-Time Render
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Production Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Asset Slots */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">01. Asset Library</h2>
            <div className="grid grid-cols-1 gap-4">
              {/* Identity Slot with Texture Options */}
              <div className="space-y-3">
                <div 
                  onClick={() => faceInputRef.current?.click()}
                  className={`group relative py-4 px-5 rounded-2xl cursor-pointer transition-all border flex items-center gap-5
                    ${faceImage ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 border-dashed hover:bg-white/[0.04]'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                    {faceImage ? (
                      <img src={`data:image/jpeg;base64,${faceImage}`} className="w-full h-full object-cover" />
                    ) : (
                      <i className={`fa-solid fa-camera text-slate-700 animate-bob`}></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Identity</p>
                    <p className="text-[9px] text-slate-600 uppercase mt-0.5">{faceImage ? 'Asset Synchronized' : 'Upload Identity'}</p>
                  </div>
                  {faceImage && <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>}
                  <input type="file" ref={faceInputRef} onChange={(e) => handleFileUpload(e, setFaceImage)} className="hidden" accept="image/*" />
                </div>
                
                {/* Skin Texture Selector (Only for Identity) */}
                <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {SKIN_TEXTURES.map((texture) => (
                    <button
                      key={texture.id}
                      onClick={() => setSelectedSkinTexture(texture)}
                      className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all
                        ${selectedSkinTexture.id === texture.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {texture.label}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { label: 'Outfit', state: outfitImage, ref: outfitInputRef, setter: setOutfitImage, icon: 'fa-shirt' },
                { label: 'Product', state: productImage, ref: productInputRef, setter: setProductImage, icon: 'fa-box-open' },
              ].map((slot) => (
                <div 
                  key={slot.label}
                  onClick={() => slot.ref.current?.click()}
                  className={`group relative py-4 px-5 rounded-2xl cursor-pointer transition-all border flex items-center gap-5
                    ${slot.state ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 border-dashed hover:bg-white/[0.04]'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                    {slot.state ? (
                      <img src={`data:image/jpeg;base64,${slot.state}`} className="w-full h-full object-cover" />
                    ) : (
                      <i className={`fa-solid ${slot.icon} text-slate-700`}></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{slot.label}</p>
                    <p className="text-[9px] text-slate-600 uppercase mt-0.5">{slot.state ? 'Asset Synchronized' : `Upload ${slot.label}`}</p>
                  </div>
                  {slot.state && <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>}
                  <input type="file" ref={slot.ref as any} onChange={(e) => handleFileUpload(e, slot.setter)} className="hidden" accept="image/*" />
                </div>
              ))}
            </div>
          </section>

          {/* Tech Specs */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">02. Technical Specs</h2>
            
            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Frame Format</label>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    className={`py-3 flex flex-col items-center rounded-xl border transition-all
                      ${selectedRatio.id === ratio.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400'}`}
                  >
                    <i className={`fa-solid ${ratio.icon} text-[10px] mb-1.5`}></i>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{ratio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Lighting Environment</label>
              <div className="grid grid-cols-2 gap-2">
                {LIGHTING_PRESETS.map((light) => (
                  <button
                    key={light.id}
                    onClick={() => setSelectedLighting(light)}
                    className={`py-3 px-4 rounded-xl border text-left transition-all
                      ${selectedLighting.id === light.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400'}`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest">{light.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Preset Styles/Poses */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">03. Production Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_POSES.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => setSelectedPose(selectedPose?.id === pose.id ? null : pose)}
                  className={`py-4 px-4 rounded-xl border text-left transition-all group
                    ${selectedPose?.id === pose.id 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
                >
                  <i className={`fa-solid ${pose.icon} text-[11px] mb-3 block ${selectedPose?.id === pose.id ? 'text-indigo-200' : 'text-slate-700 group-hover:text-indigo-400'}`}></i>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none">{pose.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Prompt */}
          <section className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Additional Directives</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Background color, specific mood, location details..."
              className="w-full h-24 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-[10px] text-white placeholder:text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
            ></textarea>
          </section>

          <div className="pt-4 space-y-3">
            {error && <div className="mb-4 text-red-400 text-[9px] font-black uppercase tracking-widest text-center border border-red-500/10 bg-red-500/5 py-2 rounded-lg">{error}</div>}
            
            <button
              onClick={() => generateImage()}
              disabled={status === GenerationStatus.LOADING}
              className={`w-full py-5 rounded-full font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all
                ${status === GenerationStatus.LOADING ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-white text-black hover:bg-indigo-600 hover:text-white shadow-[0_20px_50px_rgba(79,70,229,0.2)]'}`}
            >
              {status === GenerationStatus.LOADING ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-700 border-t-indigo-400 rounded-full animate-spin"></div>
                  Rendering...
                </>
              ) : 'Generate Production Asset'}
            </button>

            {generatedImages.length > 0 && status !== GenerationStatus.LOADING && (
              <button
                onClick={triggerVariation}
                className="w-full py-4 rounded-full border border-indigo-500/20 bg-indigo-500/5 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Generate Variations
              </button>
            )}
          </div>
        </div>

        {/* Gallery View */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Production Gallery</h2>
              <div className="flex gap-4 mt-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Resolution: 8K</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Engine: Archetype v3.1</span>
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              {generatedImages.length} Frames Captured
            </div>
          </div>

          {generatedImages.length === 0 && status !== GenerationStatus.LOADING ? (
            <div className="flex flex-col items-center justify-center py-48 rounded-[3rem] border border-white/5 border-dashed bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-6 overflow-hidden">
                <i className="fa-solid fa-camera-retro text-slate-800 text-2xl animate-bob"></i>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Studio Awaiting Command</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {status === GenerationStatus.LOADING && (
                <div className="aspect-[4/5] bg-white/[0.01] border border-indigo-500/20 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent animate-pulse"></div>
                  <div className="w-10 h-10 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">Synthesizing Identity</p>
                </div>
              )}
              
              {generatedImages.map((image) => (
                <div key={image.id} className="group relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black hover:border-indigo-500/20 transition-all shadow-2xl">
                  <img src={image.url} className="w-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Output" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                      <i className="fa-solid fa-microchip mr-2"></i> ID LOCKED
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <a 
                          href={image.url} 
                          download={`influencer-${image.id}.png`}
                          className="flex-1 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                        >
                          <i className="fa-solid fa-download"></i> EXPORT
                        </a>
                        <button 
                          onClick={() => removeImage(image.id)}
                          className="w-14 h-14 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                      <button 
                        onClick={triggerVariation}
                        disabled={status === GenerationStatus.LOADING}
                        className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> SIMILAR VARIATION
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 bg-black text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">
        <div className="max-w-screen-2xl mx-auto px-12 flex justify-between items-center">
          <div className="flex gap-12">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Multi-Asset Sync</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> 8K Native Output</span>
          </div>
          <p>© 2025 ARCHETYPE PRODUCTION GROUP</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
