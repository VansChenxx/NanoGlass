
export enum BackgroundColor {
  Black = 'black',
  White = 'white',
  Transparent = 'transparent'
}

export enum ModelTier {
  Standard = 'standard', // gemini-2.5-flash-image
  Pro = 'pro' // gemini-3-pro-image-preview
}

export enum AspectRatio {
  Square = '1:1',
  Wide = '16:9',
  Portrait = '9:16',
  Landscape = '4:3',
  PortraitStandard = '3:4'
}

export enum Viewpoint {
  Isometric = 'Isometric View',
  Front = 'Front View',
  Top = 'Top Down View',
  LowAngle = 'Low Angle / Macro',
  Dynamic = 'Dynamic Cinematic Angle'
}

export enum GlassStyle {
  Clear = 'clear',      // Invisible, Solid Air
  Frosted = 'frosted',  // Matte, Translucent
  Smoked = 'smoked'     // Dark Tint
}

export enum MetalTexture {
  Matte = 'matte',       // Sandblasted/Frosted
  Brushed = 'brushed',   // Hairline
  Patterned = 'patterned' // Knurled/Tech texture
}

export type SecondaryMaterialType = 'silver' | 'plaster';
export type AccentColor = string; // Changed to string to allow Hex

export interface MaterialLayer {
  id: string;
  name: string;
  ratio: number;
}

export interface GenerationConfig {
  prompt: string;
  referenceImage: string | null; // Base64 string
  background: BackgroundColor;
  model: ModelTier;
  aspectRatio: AspectRatio;
  viewpoint: Viewpoint;
  imageCount: number;
  secondaryMaterialType: SecondaryMaterialType; // Silver or Plaster
  metalTexture: MetalTexture; // Texture for silver material
  glassStyle: GlassStyle;
  accentColor: AccentColor;
  materials: [MaterialLayer, MaterialLayer, MaterialLayer];
  simplicityLevel: number; // 1 (Detailed/Concrete) to 5 (Abstract/Minimal)
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  config: GenerationConfig;
}