// Media Components - Image, Video, Gallery, Background Video, Audio

import type { ComponentDefinition } from '@/types/builder';

// ============================================================================
// IMAGE
// ============================================================================

export const ImageComponent: ComponentDefinition = {
  type: 'image',
  name: 'Image',
  category: 'media',
  description: 'An image element',
  icon: 'image',
  defaultProps: {
    src: 'https://via.placeholder.com/400x300',
    alt: 'Placeholder image',
    objectFit: 'cover',
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '8px',
  },
  meta: {
    isDroppable: false,
    description: 'Image with alt text',
  },
  render: ({ node, styles }) => {
    const src = (node.props.src as string) || '';
    const alt = (node.props.alt as string) || 'Image';
    const objectFit = (node.props.objectFit as React.CSSProperties['objectFit']) || 'cover';
    
    return (
      <img 
        src={src} 
        alt={alt} 
        style={{ ...styles, objectFit }}
      />
    );
  },
};

// ============================================================================
// VIDEO
// ============================================================================

export const VideoComponent: ComponentDefinition = {
  type: 'video',
  name: 'Video',
  category: 'media',
  description: 'A video player (YouTube, Vimeo, or direct file)',
  icon: 'video',
  defaultProps: {
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    poster: '',
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '640px',
    borderRadius: '8px',
    aspectRatio: '16/9',
  },
  meta: {
    isDroppable: false,
    description: 'Video player component',
  },
  render: ({ node, styles }) => {
    const src = (node.props.src as string) || '';
    const autoplay = node.props.autoplay as boolean;
    const loop = node.props.loop as boolean;
    const muted = node.props.muted as boolean;
    const controls = node.props.controls as boolean;
    const poster = node.props.poster as string;
    
    // YouTube embed
    if (src.includes('youtube') || src.includes('youtu.be')) {
      const videoId = src.split('/').pop()?.split('?')[0] || src.split('v=').pop();
      const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        mute: muted ? '1' : '0',
        loop: loop ? '1' : '0',
        controls: controls ? '1' : '0',
      });
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
          style={styles}
          allowFullScreen
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }
    
    // Vimeo embed
    if (src.includes('vimeo')) {
      const videoId = src.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}${muted ? '&muted=1' : ''}`}
          style={styles}
          allowFullScreen
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
        />
      );
    }
    
    // Direct video file
    return (
      <video 
        src={src} 
        style={styles} 
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        poster={poster}
      >
        Your browser does not support the video tag.
      </video>
    );
  },
};

// ============================================================================
// GALLERY
// ============================================================================

export const GalleryComponent: ComponentDefinition = {
  type: 'gallery',
  name: 'Gallery',
  category: 'media',
  description: 'An image gallery grid',
  icon: 'grid-3x3',
  defaultProps: {
    images: [
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
    ],
    columns: 3,
    gap: '16px',
    aspectRatio: '4/3',
  },
  defaultStyles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    width: '100%',
  },
  meta: {
    isDroppable: false,
    description: 'Image gallery grid',
  },
  render: ({ node, styles }) => {
    const images = (node.props.images as string[]) || [];
    const columns = (node.props.columns as number) || 3;
    const gap = (node.props.gap as string) || '16px';
    const aspectRatio = (node.props.aspectRatio as string) || '4/3';
    
    return (
      <div style={{ ...styles, gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Gallery image ${index + 1}`}
            style={{ 
              width: '100%', 
              aspectRatio,
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        ))}
      </div>
    );
  },
};

// ============================================================================
// BACKGROUND VIDEO
// ============================================================================

export const BackgroundVideoComponent: ComponentDefinition = {
  type: 'backgroundVideo',
  name: 'Background Video',
  category: 'media',
  description: 'A full-width background video',
  icon: 'video',
  defaultProps: {
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    autoplay: true,
    loop: true,
    muted: true,
    overlay: true,
    overlayColor: 'rgba(0,0,0,0.5)',
  },
  defaultStyles: {
    width: '100%',
    height: '500px',
    position: 'relative',
    overflow: 'hidden',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['heading', 'paragraph', 'button', 'container'],
    description: 'Background video with content overlay',
  },
  render: ({ node, styles, children }) => {
    const src = (node.props.src as string) || '';
    const overlay = node.props.overlay as boolean;
    const overlayColor = (node.props.overlayColor as string) || 'rgba(0,0,0,0.5)';
    
    const videoId = src.split('/').pop()?.split('?')[0] || src.split('v=').pop();
    
    return (
      <div style={styles}>
        {/* Background Video */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <iframe
            src={`${src}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '300%',
              height: '300%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
            title="Background Video"
          />
        </div>
        
        {/* Overlay */}
        {overlay && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: overlayColor,
              zIndex: 1,
            }}
          />
        )}
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
          {children}
        </div>
      </div>
    );
  },
};

// ============================================================================
// AUDIO
// ============================================================================

export const AudioComponent: ComponentDefinition = {
  type: 'audio',
  name: 'Audio',
  category: 'media',
  description: 'An audio player',
  icon: 'music',
  defaultProps: {
    src: '',
    autoplay: false,
    loop: false,
    controls: true,
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '400px',
  },
  meta: {
    isDroppable: false,
    description: 'Audio player component',
  },
  render: ({ node, styles }) => {
    const src = (node.props.src as string) || '';
    const autoplay = node.props.autoplay as boolean;
    const loop = node.props.loop as boolean;
    const controls = node.props.controls as boolean;
    
    return (
      <audio 
        src={src} 
        style={styles}
        autoPlay={autoplay}
        loop={loop}
        controls={controls}
      >
        Your browser does not support the audio element.
      </audio>
    );
  },
};

// ============================================================================
// IFRAME
// ============================================================================

export const IframeComponent: ComponentDefinition = {
  type: 'iframe',
  name: 'Iframe',
  category: 'media',
  description: 'Embed external content via iframe',
  icon: 'external-link',
  defaultProps: {
    src: '',
    title: 'Embedded content',
    allowFullScreen: true,
  },
  defaultStyles: {
    width: '100%',
    height: '400px',
    border: 'none',
  },
  meta: {
    isDroppable: false,
    description: 'Embedded iframe content',
  },
  render: ({ node, styles }) => {
    const src = (node.props.src as string) || '';
    const title = (node.props.title as string) || 'Embedded content';
    const allowFullScreen = node.props.allowFullScreen as boolean;
    
    return (
      <iframe
        src={src}
        title={title}
        style={styles}
        allowFullScreen={allowFullScreen}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  },
};

// Export all media components
export const mediaComponents: ComponentDefinition[] = [
  ImageComponent,
  VideoComponent,
  GalleryComponent,
  BackgroundVideoComponent,
  AudioComponent,
  IframeComponent,
];
