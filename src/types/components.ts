import { ComponentLibraryItem, ComponentType, ComponentCategory } from '@/types';

export const componentDefinitions: ComponentLibraryItem[] = [
  // Basic Components
  {
    type: 'section',
    category: 'basic',
    name: 'Section',
    description: 'A container section for grouping content',
    icon: 'layout-template',
    defaultStyles: {
      width: '100%',
      minHeight: '200px',
      padding: '40px 20px',
      backgroundColor: '#ffffff',
    },
    defaultContent: {},
  },
  {
    type: 'container',
    category: 'basic',
    name: 'Container',
    description: 'A flexible container for content',
    icon: 'box',
    defaultStyles: {
      width: '100%',
      maxWidth: '1200px',
      padding: '20px',
      margin: '0 auto',
    },
    defaultContent: {},
  },
  {
    type: 'divider',
    category: 'basic',
    name: 'Divider',
    description: 'A horizontal line divider',
    icon: 'minus',
    defaultStyles: {
      width: '100%',
      margin: '20px 0',
      borderTop: '1px solid #e5e5e5',
    },
    defaultContent: {},
  },
  {
    type: 'spacer',
    category: 'basic',
    name: 'Spacer',
    description: 'Add vertical spacing',
    icon: 'arrow-down-up',
    defaultStyles: {
      width: '100%',
      height: '40px',
    },
    defaultContent: {},
  },
  
  // Text Components
  {
    type: 'heading',
    category: 'text',
    name: 'Heading',
    description: 'A heading element (H1-H6)',
    icon: 'heading',
    defaultStyles: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: '16px',
    },
    defaultContent: {
      text: 'Your Heading Here',
      level: 1,
    },
  },
  {
    type: 'paragraph',
    category: 'text',
    name: 'Paragraph',
    description: 'A paragraph of text',
    icon: 'pilcrow',
    defaultStyles: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#4a4a4a',
      marginBottom: '16px',
    },
    defaultContent: {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },
  {
    type: 'subheading',
    category: 'text',
    name: 'Subheading',
    description: 'A subheading element',
    icon: 'heading',
    defaultStyles: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2a2a2a',
      marginBottom: '12px',
    },
    defaultContent: {
      text: 'Your Subheading Here',
      level: 2,
    },
  },
  {
    type: 'list',
    category: 'text',
    name: 'List',
    description: 'An ordered or unordered list',
    icon: 'list',
    defaultStyles: {
      paddingLeft: '20px',
      marginBottom: '16px',
    },
    defaultContent: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      ordered: false,
    },
  },
  {
    type: 'quote',
    category: 'text',
    name: 'Quote',
    description: 'A blockquote element',
    icon: 'quote',
    defaultStyles: {
      padding: '20px',
      borderLeft: '4px solid #3b82f6',
      backgroundColor: '#f8fafc',
      fontStyle: 'italic',
      marginBottom: '16px',
    },
    defaultContent: {
      text: 'This is a beautiful quote that will inspire your visitors.',
    },
  },
  
  // Media Components
  {
    type: 'image',
    category: 'media',
    name: 'Image',
    description: 'An image element',
    icon: 'image',
    defaultStyles: {
      width: '100%',
      maxWidth: '400px',
      borderRadius: '8px',
    },
    defaultContent: {
      src: 'https://via.placeholder.com/400x300',
      alt: 'Placeholder image',
    },
  },
  {
    type: 'video',
    category: 'media',
    name: 'Video',
    description: 'A video player',
    icon: 'video',
    defaultStyles: {
      width: '100%',
      maxWidth: '640px',
      borderRadius: '8px',
    },
    defaultContent: {
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
    },
  },
  {
    type: 'gallery',
    category: 'media',
    name: 'Gallery',
    description: 'An image gallery',
    icon: 'grid-3x3',
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      width: '100%',
    },
    defaultContent: {
      images: [
        'https://via.placeholder.com/300x200',
        'https://via.placeholder.com/300x200',
        'https://via.placeholder.com/300x200',
      ],
    },
  },
  {
    type: 'backgroundVideo',
    category: 'media',
    name: 'Background Video',
    description: 'A full-width background video',
    icon: 'video',
    defaultStyles: {
      width: '100%',
      height: '500px',
      position: 'relative',
      overflow: 'hidden',
    },
    defaultContent: {
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      autoplay: true,
      loop: true,
      muted: true,
    },
  },
  
  // Layout Components
  {
    type: 'hero',
    category: 'layout',
    name: 'Hero Section',
    description: 'A hero section with title and CTA',
    icon: 'star',
    defaultStyles: {
      width: '100%',
      minHeight: '500px',
      padding: '80px 20px',
      backgroundColor: '#1a1a2e',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
    },
    defaultContent: {
      text: 'Welcome to Our Website',
    },
  },
  {
    type: 'grid',
    category: 'layout',
    name: 'Grid',
    description: 'A responsive grid layout',
    icon: 'grid',
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      width: '100%',
    },
    defaultContent: {
      columns: 3,
      gap: '20px',
    },
  },
  {
    type: 'columns',
    category: 'layout',
    name: 'Columns',
    description: 'Multi-column layout',
    icon: 'columns',
    defaultStyles: {
      display: 'flex',
      gap: '20px',
      width: '100%',
    },
    defaultContent: {
      columns: 2,
    },
  },
  {
    type: 'cards',
    category: 'layout',
    name: 'Cards',
    description: 'A card grid layout',
    icon: 'credit-card',
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      width: '100%',
    },
    defaultContent: {
      cardData: [
        { title: 'Card 1', description: 'Description for card 1', image: 'https://via.placeholder.com/300x200' },
        { title: 'Card 2', description: 'Description for card 2', image: 'https://via.placeholder.com/300x200' },
        { title: 'Card 3', description: 'Description for card 3', image: 'https://via.placeholder.com/300x200' },
      ],
    },
  },
  {
    type: 'tabs',
    category: 'layout',
    name: 'Tabs',
    description: 'Tabbed content sections',
    icon: 'folder',
    defaultStyles: {
      width: '100%',
    },
    defaultContent: {
      tabs: [
        { label: 'Tab 1', content: 'Content for tab 1' },
        { label: 'Tab 2', content: 'Content for tab 2' },
        { label: 'Tab 3', content: 'Content for tab 3' },
      ],
    },
  },
  {
    type: 'accordion',
    category: 'layout',
    name: 'Accordion',
    description: 'Collapsible accordion sections',
    icon: 'chevrons-up',
    defaultStyles: {
      width: '100%',
    },
    defaultContent: {
      accordionItems: [
        { title: 'Section 1', content: 'Content for section 1', expanded: false },
        { title: 'Section 2', content: 'Content for section 2', expanded: false },
        { title: 'Section 3', content: 'Content for section 3', expanded: false },
      ],
    },
  },
  
  // Form Components
  {
    type: 'input',
    category: 'forms',
    name: 'Input',
    description: 'A text input field',
    icon: 'cursor-text',
    defaultStyles: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
    },
    defaultContent: {
      type: 'text',
      placeholder: 'Enter text...',
      label: 'Label',
      name: 'input',
      required: false,
    },
  },
  {
    type: 'textarea',
    category: 'forms',
    name: 'Textarea',
    description: 'A multi-line text input',
    icon: 'align-left',
    defaultStyles: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '100px',
    },
    defaultContent: {
      placeholder: 'Enter your message...',
      label: 'Message',
      name: 'message',
      required: false,
    },
  },
  {
    type: 'select',
    category: 'forms',
    name: 'Select',
    description: 'A dropdown select field',
    icon: 'chevron-down',
    defaultStyles: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
    },
    defaultContent: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
      label: 'Select',
      name: 'select',
    },
  },
  {
    type: 'checkbox',
    category: 'forms',
    name: 'Checkbox',
    description: 'A checkbox input',
    icon: 'check-square',
    defaultStyles: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    defaultContent: {
      label: 'I agree to the terms',
      name: 'checkbox',
      checked: false,
    },
  },
  {
    type: 'loginForm',
    category: 'forms',
    name: 'Login Form',
    description: 'A complete login form',
    icon: 'log-in',
    defaultStyles: {
      width: '100%',
      maxWidth: '400px',
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    defaultContent: {
      formAction: '/api/login',
      formMethod: 'POST',
    },
  },
  {
    type: 'signupForm',
    category: 'forms',
    name: 'Signup Form',
    description: 'A complete signup form',
    icon: 'user-plus',
    defaultStyles: {
      width: '100%',
      maxWidth: '400px',
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    defaultContent: {
      formAction: '/api/signup',
      formMethod: 'POST',
    },
  },
  {
    type: 'contactForm',
    category: 'forms',
    name: 'Contact Form',
    description: 'A contact form with name, email, and message',
    icon: 'mail',
    defaultStyles: {
      width: '100%',
      maxWidth: '500px',
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    defaultContent: {
      formAction: '/api/contact',
      formMethod: 'POST',
    },
  },
  
  // Ecommerce Components
  {
    type: 'productCard',
    category: 'ecommerce',
    name: 'Product Card',
    description: 'A single product card',
    icon: 'shopping-bag',
    defaultStyles: {
      width: '100%',
      maxWidth: '300px',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    defaultContent: {
      productName: 'Product Name',
      price: '$99.99',
      description: 'Product description goes here.',
      image: 'https://via.placeholder.com/300x300',
      sku: 'PROD-001',
    },
  },
  {
    type: 'productGrid',
    category: 'ecommerce',
    name: 'Product Grid',
    description: 'A grid of product cards',
    icon: 'grid',
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      width: '100%',
    },
    defaultContent: {
      columns: 3,
    },
  },
  {
    type: 'shoppingCart',
    category: 'ecommerce',
    name: 'Shopping Cart',
    description: 'Shopping cart display',
    icon: 'shopping-cart',
    defaultStyles: {
      width: '100%',
      padding: '24px',
    },
    defaultContent: {},
  },
  {
    type: 'checkout',
    category: 'ecommerce',
    name: 'Checkout',
    description: 'Checkout form',
    icon: 'credit-card',
    defaultStyles: {
      width: '100%',
      maxWidth: '600px',
      padding: '32px',
    },
    defaultContent: {},
  },
  {
    type: 'paymentBlock',
    category: 'ecommerce',
    name: 'Payment Block',
    description: 'Payment method selection',
    icon: 'dollar-sign',
    defaultStyles: {
      width: '100%',
      padding: '24px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
    },
    defaultContent: {},
  },
  
  // Navigation Components
  {
    type: 'navbar',
    category: 'navigation',
    name: 'Navbar',
    description: 'Navigation bar',
    icon: 'menu',
    defaultStyles: {
      width: '100%',
      padding: '16px 24px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    defaultContent: {
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  },
  {
    type: 'sidebarNav',
    category: 'navigation',
    name: 'Sidebar Navigation',
    description: 'Vertical sidebar navigation',
    icon: 'sidebar',
    defaultStyles: {
      width: '250px',
      padding: '24px',
      backgroundColor: '#1a1a2e',
      color: '#ffffff',
      minHeight: '100vh',
    },
    defaultContent: {
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profile', href: '/profile' },
        { label: 'Settings', href: '/settings' },
      ],
    },
  },
  {
    type: 'breadcrumbs',
    category: 'navigation',
    name: 'Breadcrumbs',
    description: 'Breadcrumb navigation',
    icon: 'chevron-right',
    defaultStyles: {
      padding: '12px 0',
      fontSize: '14px',
      color: '#6b7280',
    },
    defaultContent: {
      links: [
        { label: 'Home', href: '/' },
        { label: 'Category', href: '/category' },
        { label: 'Current Page', href: '#' },
      ],
    },
  },
  
  // Advanced Components
  {
    type: 'html',
    category: 'advanced',
    name: 'HTML Component',
    description: 'Custom HTML code',
    icon: 'code',
    defaultStyles: {
      width: '100%',
    },
    defaultContent: {
      html: '<div>Your custom HTML here</div>',
      language: 'html',
    },
  },
  {
    type: 'customCode',
    category: 'advanced',
    name: 'Custom Code',
    description: 'Custom JavaScript/React code',
    icon: 'file-code',
    defaultStyles: {
      width: '100%',
    },
    defaultContent: {
      code: '// Your custom code here\nconsole.log("Hello World");',
      language: 'javascript',
    },
  },
  {
    type: 'apiComponent',
    category: 'advanced',
    name: 'API Component',
    description: 'Fetch and display API data',
    icon: 'cloud',
    defaultStyles: {
      width: '100%',
      padding: '24px',
    },
    defaultContent: {
      endpoint: 'https://api.example.com/data',
      method: 'GET',
      headers: {},
    },
  },
];

export const getCategoryComponents = (category: ComponentCategory): ComponentLibraryItem[] => {
  return componentDefinitions.filter((comp) => comp.category === category);
};

export const getComponentDefinition = (type: ComponentType): ComponentLibraryItem | undefined => {
  return componentDefinitions.find((comp) => comp.type === type);
};

export const categories: { id: ComponentCategory; name: string; icon: string }[] = [
  { id: 'basic', name: 'Basic', icon: 'box' },
  { id: 'text', name: 'Text', icon: 'type' },
  { id: 'media', name: 'Media', icon: 'image' },
  { id: 'layout', name: 'Layout', icon: 'layout-template' },
  { id: 'forms', name: 'Forms', icon: 'form-input' },
  { id: 'ecommerce', name: 'Ecommerce', icon: 'shopping-cart' },
  { id: 'navigation', name: 'Navigation', icon: 'navigation' },
  { id: 'advanced', name: 'Advanced', icon: 'cpu' },
];
