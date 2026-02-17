/**
 * Font Loader Utility
 * Ensures all fonts are properly loaded before PDF generation
 */

export const ensureFontsLoaded = async (): Promise<void> => {
  console.log('[FontLoader] Starting font loading...');
  
  // Wait for document.fonts API to be ready
  if (document.fonts && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 8000)) // 8 second timeout
      ]);
      console.log('[FontLoader] document.fonts.ready completed');
    } catch (e) {
      console.warn('[FontLoader] Font loading timeout:', e);
    }
  } else {
    console.warn('[FontLoader] document.fonts API not available');
  }

  // Define all fonts that need to be loaded
  const fontsToLoad = [
    { family: 'Noto Sans Bengali', weight: '400' },
    { family: 'Noto Sans Bengali', weight: '500' },
    { family: 'Noto Sans Bengali', weight: '600' },
    { family: 'Noto Sans Bengali', weight: '700' },
    { family: 'Noto Serif Bengali', weight: '400' },
    { family: 'Noto Serif Bengali', weight: '500' },
    { family: 'Noto Serif Bengali', weight: '600' },
    { family: 'Noto Serif Bengali', weight: '700' },
    { family: 'Hind Siliguri', weight: '400' },
    { family: 'Hind Siliguri', weight: '500' },
    { family: 'Hind Siliguri', weight: '600' },
  ];

  // Check and wait for each font to load
  const fontPromises = fontsToLoad.map(async (font) => {
    try {
      // Check if font is loaded
      const fontFace = `${font.weight} 16px "${font.family}"`;
      const isLoaded = document.fonts.check(fontFace);
      if (!isLoaded) {
        console.log(`[FontLoader] Loading font: ${font.family} ${font.weight}`);
        // Load the font with timeout
        await Promise.race([
          document.fonts.load(fontFace),
          new Promise(resolve => setTimeout(resolve, 3000)) // 3 second per font timeout
        ]);
        console.log(`[FontLoader] Loaded font: ${font.family} ${font.weight}`);
      } else {
        console.log(`[FontLoader] Font already loaded: ${font.family} ${font.weight}`);
      }
    } catch (e) {
      console.warn(`[FontLoader] Failed to load font: ${font.family} ${font.weight}`, e);
    }
  });

  await Promise.all(fontPromises);

  // Additional delay to ensure fonts are fully rendered in the DOM
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('[FontLoader] Font loading completed');
};

/**
 * Convert oklch() and other modern color functions to RGB
 */
const convertColorToRGB = (colorValue: string): string => {
  if (!colorValue) return colorValue;
  
  // Check if it's a modern color function that needs conversion
  if (colorValue.includes('oklch(') || colorValue.includes('oklab(') || 
      colorValue.includes('lch(') || colorValue.includes('lab(')) {
    try {
      // Create a temporary element to let browser compute the color
      const tempDiv = document.createElement('div');
      tempDiv.style.color = colorValue;
      document.body.appendChild(tempDiv);
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
      return computedColor || colorValue;
    } catch (e) {
      console.warn('Failed to convert color:', colorValue, e);
      return colorValue;
    }
  }
  
  return colorValue;
};

/**
 * Recursively convert all oklch colors in an element tree
 */
const convertAllColorsToRGB = (element: HTMLElement): void => {
  try {
    const computed = window.getComputedStyle(element);
    
    // All color-related properties that might contain oklch
    const colorProps = [
      'color',
      'background-color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
    ];
    
    // Convert each color property
    colorProps.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
        const rgbValue = convertColorToRGB(value);
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        (element.style as any)[camelProp] = rgbValue;
      }
    });
    
    // Handle box-shadow and text-shadow which may contain multiple colors
    ['box-shadow', 'text-shadow'].forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'none') {
        // Replace any oklch() in the shadow value
        const converted = value.replace(/oklch\([^)]+\)/g, (match) => convertColorToRGB(match));
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        (element.style as any)[camelProp] = converted;
      }
    });
    
    // Process all children
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        convertAllColorsToRGB(child);
      }
    });
  } catch (e) {
    console.warn('Error converting colors:', e);
  }
};

/**
 * Apply all computed styles inline to an element and its children
 * This ensures html2canvas captures all styles correctly
 */
export const applyAllInlineStyles = (element: HTMLElement): void => {
  try {
    const computed = window.getComputedStyle(element);
    
    // List of all important CSS properties to preserve
    const importantProps = [
      'color',
      'backgroundColor',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'fontStyle',
      'lineHeight',
      'letterSpacing',
      'textAlign',
      'textDecoration',
      'textTransform',
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'border',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderLeft',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'borderWidth',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'borderStyle',
      'borderTopStyle',
      'borderRightStyle',
      'borderBottomStyle',
      'borderLeftStyle',
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'width',
      'height',
      'maxWidth',
      'maxHeight',
      'minWidth',
      'minHeight',
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'zIndex',
      'opacity',
      'boxShadow',
      'textShadow',
      'transform',
      'gap',
      'gridTemplateColumns',
      'gridTemplateRows',
      'gridColumn',
      'gridRow',
      'gridColumnGap',
      'gridRowGap',
      'flexDirection',
      'flexWrap',
      'justifyContent',
      'alignItems',
      'alignContent',
      'flex',
      'flexGrow',
      'flexShrink',
      'flexBasis',
      'overflow',
      'overflowX',
      'overflowY',
      'whiteSpace',
      'wordBreak',
      'wordWrap',
      'verticalAlign',
    ];
    
    // Apply each computed style as inline style
    importantProps.forEach(prop => {
      try {
        const value = computed.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'normal') {
          // Skip 'auto' for most properties except certain layout ones
          if (value === 'auto' && !['overflow', 'overflowX', 'overflowY'].includes(prop)) {
            return;
          }
          
          // Convert oklch() colors to RGB
          let finalValue = convertColorToRGB(value);
          
          // Convert kebab-case to camelCase for style object
          const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          (element.style as any)[camelProp] = finalValue;
        }
      } catch (e) {
        // Skip properties that throw errors
      }
    });
    
    // Ensure background color is set (white if transparent)
    if (!element.style.backgroundColor || element.style.backgroundColor === 'rgba(0, 0, 0, 0)' || element.style.backgroundColor === 'transparent') {
      const parentBg = computed.backgroundColor;
      if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
        element.style.backgroundColor = parentBg;
      }
    }
    
    // Ensure text color is set
    if (!element.style.color || element.style.color === 'rgba(0, 0, 0, 0)' || element.style.color === 'transparent') {
      const textColor = computed.color;
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
        element.style.color = textColor;
      }
    }
    
    // Process all children recursively
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        applyAllInlineStyles(child);
      }
    });
  } catch (e) {
    console.warn('Error applying inline styles:', e);
  }
};

/**
 * Create a clone of an element with all styles applied inline
 */
export const createStyledClone = async (element: HTMLElement): Promise<HTMLElement> => {
  // Create a temporary wrapper
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.setAttribute('data-pdf-temp', 'true'); // Mark for easy cleanup
  
  // Clone the element
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Ensure clone has white background and proper dimensions
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.width = element.offsetWidth + 'px';
  clone.style.height = element.offsetHeight + 'px';
  
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // First convert all oklch colors to RGB throughout the tree
  console.log('[FontLoader] Converting oklch colors to RGB...');
  convertAllColorsToRGB(clone);

  // Then apply all inline styles
  console.log('[FontLoader] Applying inline styles...');
  applyAllInlineStyles(clone);

  // Wait for styles to settle
  await new Promise(resolve => setTimeout(resolve, 200));

  return wrapper; // Return wrapper instead of clone so we can clean it up properly
};

/**
 * Clean up temporary elements
 */
export const cleanupElement = (element: HTMLElement | null): void => {
  if (element && element.parentElement) {
    element.parentElement.removeChild(element);
  } else if (element) {
    element.remove();
  }
};
