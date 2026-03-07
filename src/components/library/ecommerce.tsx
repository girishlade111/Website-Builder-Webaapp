// Ecommerce Components - Product Card, Product Grid, Shopping Cart, Checkout, Payment

import type { ComponentDefinition } from '@/types/builder';

// ============================================================================
// PRODUCT CARD
// ============================================================================

export const ProductCardComponent: ComponentDefinition = {
  type: 'productCard',
  name: 'Product Card',
  category: 'ecommerce',
  description: 'A single product card with image, price, and add to cart',
  icon: 'shopping-bag',
  defaultProps: {
    productName: 'Product Name',
    price: '$99.99',
    comparePrice: '',
    description: 'Product description goes here.',
    image: 'https://via.placeholder.com/300x300',
    sku: 'PROD-001',
    inStock: true,
    rating: 4.5,
    badge: '',
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '300px',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  meta: { isDroppable: false, description: 'Product display card' },
  render: ({ node, styles }) => {
    const productName = (node.props.productName as string) || 'Product';
    const price = (node.props.price as string) || '$0.00';
    const comparePrice = node.props.comparePrice as string;
    const description = (node.props.description as string) || '';
    const image = (node.props.image as string) || '';
    const inStock = node.props.inStock as boolean;
    const badge = (node.props.badge as string) || '';
    
    return (
      <div style={styles}>
        <div style={{ position: 'relative' }}>
          <img src={image} alt={productName} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
          {badge && (
            <span style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 12px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{productName}</h3>
          {description && <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{description}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>{price}</span>
              {comparePrice && <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through', marginLeft: '8px' }}>{comparePrice}</span>}
            </div>
            <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              Add to Cart
            </button>
          </div>
          {inStock ? (
            <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '8px' }}>✓ In Stock</p>
          ) : (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>Out of Stock</p>
          )}
        </div>
      </div>
    );
  },
};

// ============================================================================
// PRODUCT GRID
// ============================================================================

export const ProductGridComponent: ComponentDefinition = {
  type: 'productGrid',
  name: 'Product Grid',
  category: 'ecommerce',
  description: 'A grid of product cards',
  icon: 'grid',
  defaultProps: {
    columns: 3,
    products: Array.from({ length: 6 }).map((_, i) => ({
      id: `product-${i}`,
      name: `Product ${i + 1}`,
      price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
      image: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
    })),
  },
  defaultStyles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
  },
  meta: { isDroppable: false, description: 'Product grid layout' },
  render: ({ node, styles }) => {
    const columns = (node.props.columns as number) || 3;
    const products = (node.props.products as Array<{ id: string; name: string; price: string; image: string }>) || [];
    
    return (
      <div style={{ ...styles, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// SHOPPING CART
// ============================================================================

export const ShoppingCartComponent: ComponentDefinition = {
  type: 'shoppingCart',
  name: 'Shopping Cart',
  category: 'ecommerce',
  description: 'Shopping cart with items and totals',
  icon: 'shopping-cart',
  defaultProps: {
    title: 'Shopping Cart',
    items: [
      { name: 'Product 1', price: 49.99, quantity: 1, image: 'https://via.placeholder.com/80' },
      { name: 'Product 2', price: 29.99, quantity: 2, image: 'https://via.placeholder.com/80' },
    ] as Array<{ name: string; price: number; quantity: number; image: string }>,
    showDiscount: true,
    discountCode: 'SAVE10',
  },
  defaultStyles: { width: '100%', padding: '24px', backgroundColor: '#fff' },
  meta: { isDroppable: false, description: 'Shopping cart display' },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Shopping Cart';
    const items = ((node.props.items as Array<{ name: string; price: number; quantity: number; image: string }>) || []) as Array<{ name: string; price: number; quantity: number; image: string }>;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 9.99;
    const total = subtotal + shipping;
    
    return (
      <div style={styles}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{title}</h2>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
            <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{item.name}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Qty: {item.quantity}</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
        <div style={{ borderTop: '2px solid #e5e5e5', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
        <button style={{ width: '100%', marginTop: '24px', padding: '16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          Proceed to Checkout
        </button>
      </div>
    );
  },
};

// ============================================================================
// CHECKOUT
// ============================================================================

export const CheckoutComponent: ComponentDefinition = {
  type: 'checkout',
  name: 'Checkout',
  category: 'ecommerce',
  description: 'Checkout form with shipping and payment',
  icon: 'credit-card',
  defaultProps: {
    title: 'Checkout',
    showShipping: true,
    showBilling: true,
    showPayment: true,
  },
  defaultStyles: { width: '100%', maxWidth: '600px', padding: '32px', backgroundColor: '#fff', borderRadius: '8px' },
  meta: { isDroppable: false, description: 'Checkout form' },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Checkout';
    const showShipping = node.props.showShipping as boolean;
    
    return (
      <div style={styles}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{title}</h2>
        {showShipping && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Shipping Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input type="text" placeholder="First Name" style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              <input type="text" placeholder="Last Name" style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <input type="text" placeholder="Address" style={{ width: '100%', marginTop: '16px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <input type="text" placeholder="City" style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              <input type="text" placeholder="State" style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              <input type="text" placeholder="ZIP" style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
          </div>
        )}
        <button style={{ width: '100%', padding: '16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          Place Order
        </button>
      </div>
    );
  },
};

// ============================================================================
// PAYMENT BLOCK
// ============================================================================

export const PaymentBlockComponent: ComponentDefinition = {
  type: 'paymentBlock',
  name: 'Payment Block',
  category: 'ecommerce',
  description: 'Payment method selection',
  icon: 'dollar-sign',
  defaultProps: {
    methods: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay'],
    defaultMethod: 'Credit Card',
  },
  defaultStyles: { width: '100%', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px' },
  meta: { isDroppable: false, description: 'Payment methods' },
  render: ({ node, styles }) => {
    const methods = (node.props.methods as string[]) || ['Credit Card'];
    
    return (
      <div style={styles}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment Method</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {methods.map((method) => (
            <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
              <input type="radio" name="payment" />
              {method}
            </label>
          ))}
        </div>
      </div>
    );
  },
};

export const ecommerceComponents: ComponentDefinition[] = [
  ProductCardComponent,
  ProductGridComponent,
  ShoppingCartComponent,
  CheckoutComponent,
  PaymentBlockComponent,
];
