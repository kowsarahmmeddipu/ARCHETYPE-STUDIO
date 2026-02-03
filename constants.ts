
import { PresetPose } from './types';

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', icon: 'fa-square', value: '1:1' },
  { id: '9:16', label: 'Portrait', icon: 'fa-mobile-screen', value: '9:16' },
  { id: '16:9', label: 'Landscape', icon: 'fa-desktop', value: '16:9' },
  { id: '4:3', label: 'Classic', icon: 'fa-tv', value: '4:3' },
];

export const LIGHTING_PRESETS = [
  { id: 'studio', label: 'Pro Studio', prompt: 'high-end commercial studio lighting, soft box, rim light, sharp details' },
  { id: 'golden', label: 'Golden Hour', prompt: 'warm natural sunset lighting, cinematic lens flare, soft highlights' },
  { id: 'neon', label: 'Cyber Neon', prompt: 'vibrant cinematic neon lighting, dual tone colors, dramatic shadows' },
  { id: 'natural', label: 'Soft Daylight', prompt: 'diffused natural outdoor lighting, overcast day, realistic colors' },
  { id: 'cinematic', label: 'Noir/Dramatic', prompt: 'low-key dramatic lighting, high contrast, moody atmosphere' },
];

export const SKIN_TEXTURES = [
  { id: 'natural', label: 'Natural', prompt: 'Hyper-realistic skin with visible pores, fine lines, and natural textures. Maximum authenticity.' },
  { id: 'smooth', label: 'Smooth', prompt: 'Clean, even skin with subtle professional smoothing while retaining realistic micro-textures.' },
  { id: 'airbrushed', label: 'Airbrushed', prompt: 'Flawless, perfectly even skin with a high-end magazine airbrushed finish. Minimized pores.' },
];

export const VARIATION_MODIFIERS = [
  "Slightly different camera angle",
  "Minor change in depth of field bokeh",
  "Subtle shift in color grading tone",
  "Alternate subtle facial micro-expression",
  "Slightly different hair arrangement",
  "Minor variation in ambient atmosphere",
  "Soft lens bloom effect",
  "High-end grain texture variation"
];

export const PRESET_POSES: PresetPose[] = [
  { 
    id: 'editorial', 
    label: 'Studio Editorial', 
    prompt: 'High-end luxury fashion editorial. Professional studio lighting, sharp focus, 85mm lens aesthetic. The character wears the OUTFIT from reference and maintains 100% FACE identity.', 
    icon: 'fa-camera-retro' 
  },
  { 
    id: 'lifestyle', 
    label: 'Global Lifestyle', 
    prompt: 'Candid high-society lifestyle photography. Natural daylight, soft bokeh, sophisticated environment. Perfect garment matching.', 
    icon: 'fa-earth-americas' 
  },
  { 
    id: 'campaign', 
    label: 'Brand Campaign', 
    prompt: 'Commercial advertising campaign style. Clean, high-contrast, premium aesthetic. Influencer showcases the PRODUCT naturally.', 
    icon: 'fa-award' 
  },
  { 
    id: 'runway', 
    label: 'Runway Look', 
    prompt: 'Fashion week runway photography. Dynamic lighting, motion blur in background, full-body shot.', 
    icon: 'fa-person-walking' 
  },
];

export const SYSTEM_PROMPT_PREFIX = `You are a Lead Technical Photographer for a high-fashion digital studio. 
TASK: Generate a master-quality 8K photograph.

ASSET HIERARCHY:
1. IDENTITY (Face Image): Use this image for face identity. Their facial features must be 100% IDENTICAL.
2. GARMENT (Outfit Image): Replicate the exact clothing from this image (color, texture, pattern).
3. ITEM (Product Image): Integrate this specific item naturally if provided.

STANDARDS:
- Output must be a real DSLR photo (8k resolution).
- NO AI smoothing unless explicitly requested.
- Precise composition based on technical specs.

Context: `;
