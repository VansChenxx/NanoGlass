
import { GoogleGenAI } from "@google/genai";
import { BackgroundColor, GenerationConfig, ModelTier, GlassStyle, AccentColor, Viewpoint, MetalTexture } from "../types";

const getClient = async (usePro: boolean) => {
  // For Pro models, we need to ensure the user has selected an API key via the UI if available
  const win = window as any;
  if (usePro && win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
  
  // Always recreate the client to pick up the latest key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getStyleInstruction = (level: number = 3): string => {
    switch (level) {
        case 1: // Detailed / Concrete
            return `
            STYLE GUIDELINES (CONCRETE & REALISTIC):
            - High-fidelity industrial design product render.
            - Realistic functional details, screws, seams, and bevels.
            - Clear mechanical logic.
            - Professional studio product photography.
            - The object must look manufacturable.
            `;
        case 2: // Simplified Structure
            return `
            STYLE GUIDELINES (CLEAN GEOMETRY):
            - Modern tech design, reduced visual noise.
            - Focus on the interplay of basic geometric forms (Sphere, Cube, Cylinder).
            - Sleek, polished, recognizable silhouette.
            - Distinct material separation between Glass and Metal/Plaster.
            `;
        case 3: // Balanced (Default)
            return `
            STYLE GUIDELINES (FUTURE AESTHETICS):
            - Balanced minimalist design. Pure geometric foundations.
            - Smooth surfaces, sophisticated lighting.
            - Artistic 3D icon style.
            - High-end conceptual design (Apple/Braun aesthetic but futuristic).
            `;
        case 4: // Minimalist
            return `
            STYLE GUIDELINES (EXTREME MINIMALISM):
            - Reductionist approach. Use the fewest lines possible.
            - Focus purely on silhouette, light, and material refraction.
            - Very little surface detail, large negative spaces.
            - Iconic and symbolic representation.
            `;
        case 5: // Abstract
            return `
            STYLE GUIDELINES (ABSTRACT ART):
            - DECONSTRUCTED FORMS.
            - Abstract composition, museum quality art installation.
            - Non-representational, focus on the refractive properties of light.
            - Ethereal, avant-garde.
            `;
        default:
            return `STYLE GUIDELINES: Clean, modern, minimalist 3D render.`;
    }
};

// Helper to get glass description
const getGlassDescription = (style: GlassStyle) => {
  switch (style) {
    case GlassStyle.Frosted:
      return `
       - **PHYSICS**: High transmission, High Roughness (Blur).
       - **VISUAL**: Matte, Translucent, Soft Blur. Looks like frosted acrylic or ice.
       - **LIGHT**: Diffuses light softly. No sharp internal reflections.
      `;
    case GlassStyle.Smoked:
      return `
       - **PHYSICS**: Tinted Dark Grey Glass.
       - **VISUAL**: Semi-transparent, sunglasses aesthetic, privacy glass.
       - **LIGHT**: Absorbs light. High reflectivity on the surface.
      `;
    case GlassStyle.Clear:
    default:
      return `
       - **PHYSICS**: 100% Transmission, 0% Diffuse. The body is INVISIBLE.
       - **VISUAL**: It should look like "Solid Air" or "Crystal Clear Water". NO grey film, NO milky opacity.
       - **EDGES**: Defined ONLY by high-contrast RIM LIGHTING (Cool White) and REFRACTION.
       - **DISPERSION**: Strong CHROMATIC ABERRATION (Prismatic Rainbow split) at the edges.
      `;
  }
};

const getMetalDescription = (texture: MetalTexture) => {
    switch(texture) {
        case MetalTexture.Brushed:
            return `
            - **MATERIAL**: Brushed Aluminum / Stainless Steel.
            - **TEXTURE**: Visible hairline scratches, anisotropic roughness.
            - **VISUAL**: Industrial, sleek, directional reflections.
            `;
        case MetalTexture.Patterned:
            return `
            - **MATERIAL**: Knurled Metal / Geometric Patterned Steel.
            - **TEXTURE**: CNC Milled texture, diamond cut, knurled, or hexagonal grid pattern on the metal.
            - **VISUAL**: Tactile, complex, high-tech industrial detail. High friction surface.
            `;
        case MetalTexture.Matte:
        default:
            return `
            - **MATERIAL**: Sandblasted Silver / Satin Aluminum.
            - **TEXTURE**: Fine grain noise, soft touch.
            - **VISUAL**: Diffused metallic glow. No sharp reflections. Apple Macbook finish.
            `;
    }
}

// Helper to get accent color description
const getAccentDescription = (color: AccentColor) => {
  // Predefined map for descriptions, but fallback for custom hex
  const map: Record<string, { hex: string, name: string }> = {
    'cyan': { hex: '#00FFFF', name: 'Cyan / Electric Blue' },
    'orange': { hex: '#FF5500', name: 'Safety Orange / Copper' },
    'purple': { hex: '#9900FF', name: 'Electric Purple / Violet' },
    'pink': { hex: '#FF00CC', name: 'Hot Pink / Magenta' },
    'lime': { hex: '#CCFF00', name: 'Lime Green / Chartreuse' },
    'gold': { hex: '#FFD700', name: 'Polished Gold / Brass' },
    '#070808': { hex: '#111111', name: 'Black Metal / Gunmetal' }, // Handle the requested default explicitly
  };
  
  // Check if color is a preset key
  let c;
  if (map[color]) {
      c = map[color];
  } else {
      // Assume custom hex
      c = { hex: color, name: `Custom Metallic (${color})` };
  }
  
  return `
       - **MATERIAL**: Anodized Metallic Finish.
       - **VISUAL**: Metallic reflection. Satin or Polished Metal finish.
       - **COLOR**: ${c.hex}. Vivid and saturated.
       ${c.hex === '#111111' || color === '#070808' ? '- **SPECULARITY**: High gloss black metal, like liquid obsidian.' : ''}
  `;
};

const generateSingleImage = async (ai: GoogleGenAI, config: GenerationConfig, modelName: string): Promise<string | null> => {
  const isBlackBg = config.background === BackgroundColor.Black;
  const isTransparent = config.background === BackgroundColor.Transparent;
  
  let bgDescription = "";
  if (isTransparent) {
      bgDescription = "PURE #000000 BLACK BACKGROUND. The object must be isolated in darkness. High contrast for alpha separation. Do not render any floor or environment. The glass must refract the black background.";
  } else {
      bgDescription = isBlackBg
        ? "Pure solid #000000 VOID BLACK background. The object floats in deep space darkness." 
        : "Pure solid #FFFFFF WHITE background. High key studio photography.";
  }

  // Define secondary material (The Anchor) based on user selection
  let anchorMaterialDesc = "";
  if (config.secondaryMaterialType === 'plaster') {
      anchorMaterialDesc = `
      - **MATERIAL**: Pure White Plaster / Gypsum.
      - **TEXTURE**: Matte, slightly porous, chalky, dry. ZERO gloss.
      - **VISUAL**: High contrast against the glass. Like an architectural model.
      - **COLOR**: #FFFFFF (White).
      `;
  } else {
     // It is Silver
     const textureDesc = getMetalDescription(config.metalTexture || MetalTexture.Matte);
     anchorMaterialDesc = `
      - **COLOR**: Silver / Light Grey.
      ${textureDesc}
     `;
  }

  const materialQualityInstructions = `
    MATERIAL SYSTEM:
    
    1. **THE GLASS (THE HERO)**:
       ${getGlassDescription(config.glassStyle || GlassStyle.Clear)}
       - **OPACITY**: The glass MUST be semi-transparent.
       - **TRANSPARENCY**: The glass parts MUST look transparent.
    
    2. **THE SOLID ANCHOR**:
       ${anchorMaterialDesc}

    3. **THE ACCENT**:
       ${getAccentDescription(config.accentColor || '#070808')}
    `;

  let lightingInstructions = "";
  if (isTransparent) {
      lightingInstructions = "LIGHTING: Bright, contrasty studio lighting. Sharp rim lights. No environment reflections. High contrast for easy background removal.";
  } else {
      lightingInstructions = isBlackBg 
        ? `LIGHTING:
           - dramatic chiaroscuro lighting.
           - Rim lights highlighting the edges of the glass.
           - Subsurface scattering in the frosted parts.
           - Reflections of a minimal studio environment (Softboxes).`
        : `LIGHTING:
           - Global Illumination. Soft shadows.
           - Clean reflections.
           - Bright and airy.`;
  }

  const viewpointInstruction = config.viewpoint || Viewpoint.Isometric;

  const fullPrompt = `
    Create a 3D illustration of: ${config.prompt}
    
    ${getStyleInstruction(config.simplicityLevel)}
    
    VIEWPOINT: ${viewpointInstruction}
    
    ${materialQualityInstructions}
    
    COMPOSITION:
    - Central composition. The object is floating.
    - Ratio: ${config.materials[0].ratio}% Glass, ${config.materials[1].ratio}% Solid Material, ${config.materials[2].ratio}% Accent Color.
    
    BACKGROUND:
    ${bgDescription}
    
    RENDER QUALITY:
    - Octane Render / Redshift style.
    - Raytracing enabled. Caustics enabled.
    - 8k resolution, ultra-sharp.
    - Semi-transparent glass materials.
  `;

  console.log("Generating with prompt:", fullPrompt);

  try {
    const isPro = config.model === ModelTier.Pro;
    const modelId = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          ...(config.referenceImage ? [{
            inlineData: {
              mimeType: 'image/png', // Assuming png for ref, but could be jpeg
              data: config.referenceImage.split(',')[1]
            }
          }] : []),
          { text: fullPrompt }
        ]
      },
      config: {
         // imageConfig: { aspectRatio: config.aspectRatio } 
      }
    });

    // Parse response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Generation failed", e);
    throw e;
  }
  return null;
};

export const generateNanoBananaIllustration = async (config: GenerationConfig): Promise<string[]> => {
  const isPro = config.model === ModelTier.Pro;
  const ai = await getClient(isPro);
  
  // Parallel generation for multiple images
  const promises = Array(config.imageCount).fill(null).map(() => 
    generateSingleImage(ai, config, isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image')
  );

  const results = await Promise.all(promises);
  return results.filter((url): url is string => url !== null);
};