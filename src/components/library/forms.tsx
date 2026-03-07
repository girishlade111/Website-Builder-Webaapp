// Form Components - Input, Textarea, Select, Checkbox, Radio, Button, Forms

import type { ComponentDefinition } from '@/types/builder';

// ============================================================================
// INPUT
// ============================================================================

export const InputComponent: ComponentDefinition = {
  type: 'input',
  name: 'Input',
  category: 'forms',
  description: 'A text input field',
  icon: 'cursor-text',
  defaultProps: {
    type: 'text',
    placeholder: 'Enter text...',
    label: 'Label',
    name: 'input',
    required: false,
    disabled: false,
  },
  defaultStyles: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  meta: {
    isDroppable: false,
    description: 'Text input field',
  },
  render: ({ node, styles }) => {
    const type = (node.props.type as string) || 'text';
    const placeholder = (node.props.placeholder as string) || '';
    const label = (node.props.label as string) || '';
    const name = (node.props.name as string) || 'input';
    const required = node.props.required as boolean;
    const disabled = node.props.disabled as boolean;
    
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          required={required}
          disabled={disabled}
          style={{ ...styles, opacity: disabled ? 0.6 : 1 }}
        />
      </div>
    );
  },
};

// ============================================================================
// TEXTAREA
// ============================================================================

export const TextareaComponent: ComponentDefinition = {
  type: 'textarea',
  name: 'Textarea',
  category: 'forms',
  description: 'A multi-line text input',
  icon: 'align-left',
  defaultProps: {
    placeholder: 'Enter your message...',
    label: 'Message',
    name: 'message',
    required: false,
    disabled: false,
    rows: 4,
  },
  defaultStyles: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '100px',
  },
  meta: {
    isDroppable: false,
    description: 'Multi-line text input',
  },
  render: ({ node, styles }) => {
    const placeholder = (node.props.placeholder as string) || '';
    const label = (node.props.label as string) || '';
    const name = (node.props.name as string) || 'message';
    const required = node.props.required as boolean;
    const disabled = node.props.disabled as boolean;
    const rows = (node.props.rows as number) || 4;
    
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <textarea
          placeholder={placeholder}
          name={name}
          required={required}
          disabled={disabled}
          rows={rows}
          style={{ ...styles, opacity: disabled ? 0.6 : 1, resize: 'vertical' }}
        />
      </div>
    );
  },
};

// ============================================================================
// SELECT
// ============================================================================

export const SelectComponent: ComponentDefinition = {
  type: 'select',
  name: 'Select',
  category: 'forms',
  description: 'A dropdown select field',
  icon: 'chevron-down',
  defaultProps: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    label: 'Select',
    name: 'select',
    required: false,
    disabled: false,
    placeholder: 'Choose an option',
  },
  defaultStyles: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  meta: {
    isDroppable: false,
    description: 'Dropdown select field',
  },
  render: ({ node, styles }) => {
    const options = (node.props.options as Array<{ label: string; value: string }>) || [];
    const label = (node.props.label as string) || '';
    const name = (node.props.name as string) || 'select';
    const required = node.props.required as boolean;
    const disabled = node.props.disabled as boolean;
    const placeholder = (node.props.placeholder as string) || '';
    
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <select 
          name={name} 
          required={required} 
          disabled={disabled}
          style={{ ...styles, opacity: disabled ? 0.6 : 1 }}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
};

// ============================================================================
// CHECKBOX
// ============================================================================

export const CheckboxComponent: ComponentDefinition = {
  type: 'checkbox',
  name: 'Checkbox',
  category: 'forms',
  description: 'A checkbox input',
  icon: 'check-square',
  defaultProps: {
    label: 'I agree to the terms',
    name: 'checkbox',
    checked: false,
    required: false,
    disabled: false,
  },
  defaultStyles: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  meta: {
    isDroppable: false,
    description: 'Checkbox input',
  },
  render: ({ node, styles }) => {
    const label = (node.props.label as string) || '';
    const name = (node.props.name as string) || 'checkbox';
    const checked = node.props.checked as boolean;
    const required = node.props.required as boolean;
    const disabled = node.props.disabled as boolean;
    
    return (
      <label style={{ ...styles, opacity: disabled ? 0.6 : 1 }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          required={required}
          disabled={disabled}
        />
        <span>{label}</span>
      </label>
    );
  },
};

// ============================================================================
// RADIO
// ============================================================================

export const RadioComponent: ComponentDefinition = {
  type: 'radio',
  name: 'Radio Group',
  category: 'forms',
  description: 'Radio button group',
  icon: 'radio',
  defaultProps: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    label: 'Choose an option',
    name: 'radio',
    required: false,
    disabled: false,
    orientation: 'vertical',
  },
  defaultStyles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  meta: {
    isDroppable: false,
    description: 'Radio button group',
  },
  render: ({ node, styles }) => {
    const options = (node.props.options as Array<{ label: string; value: string }>) || [];
    const label = (node.props.label as string) || '';
    const name = (node.props.name as string) || 'radio';
    const required = node.props.required as boolean;
    const disabled = node.props.disabled as boolean;
    const orientation = (node.props.orientation as 'vertical' | 'horizontal') || 'vertical';
    
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <div style={{ ...styles, flexDirection: orientation === 'horizontal' ? 'row' : 'column', gap: orientation === 'horizontal' ? '16px' : '12px', opacity: disabled ? 0.6 : 1 }}>
          {options.map((option, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name={name}
                value={option.value}
                required={required}
                disabled={disabled}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  },
};

// ============================================================================
// BUTTON
// ============================================================================

export const ButtonComponent: ComponentDefinition = {
  type: 'button',
  name: 'Button',
  category: 'forms',
  description: 'A clickable button',
  icon: 'mouse-pointer',
  defaultProps: {
    text: 'Click Me',
    variant: 'primary',
    size: 'medium',
    href: '',
    target: '_self',
    disabled: false,
    icon: '',
  },
  defaultStyles: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  meta: {
    isDroppable: false,
    description: 'Clickable button',
  },
  render: ({ node, styles }) => {
    const text = (node.props.text as string) || 'Button';
    const variant = (node.props.variant as string) || 'primary';
    const size = (node.props.size as string) || 'medium';
    const href = (node.props.href as string) || '';
    const target = (node.props.target as string) || '_self';
    const disabled = node.props.disabled as boolean;
    const icon = (node.props.icon as string) || '';
    
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: '#3b82f6', color: '#ffffff' },
      secondary: { backgroundColor: '#6b7280', color: '#ffffff' },
      outline: { backgroundColor: 'transparent', color: '#3b82f6', border: '2px solid #3b82f6' },
      ghost: { backgroundColor: 'transparent', color: '#3b82f6' },
      danger: { backgroundColor: '#ef4444', color: '#ffffff' },
      success: { backgroundColor: '#22c55e', color: '#ffffff' },
    };
    
    const sizeStyles: Record<string, React.CSSProperties> = {
      small: { padding: '8px 16px', fontSize: '14px' },
      medium: { padding: '12px 24px', fontSize: '16px' },
      large: { padding: '16px 32px', fontSize: '18px' },
    };
    
    const buttonStyles = {
      ...styles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };
    
    const content = (
      <button
        style={buttonStyles}
        disabled={disabled}
      >
        {icon && <span>{icon}</span>}
        {text}
      </button>
    );
    
    if (href && !disabled) {
      return (
        <a href={href} target={target} style={{ textDecoration: 'none' }}>
          {content}
        </a>
      );
    }
    
    return content;
  },
};

// ============================================================================
// CONTACT FORM
// ============================================================================

export const ContactFormComponent: ComponentDefinition = {
  type: 'contactForm',
  name: 'Contact Form',
  category: 'forms',
  description: 'A complete contact form',
  icon: 'mail',
  defaultProps: {
    title: 'Contact Us',
    subtitle: 'We\'d love to hear from you',
    submitButtonText: 'Send Message',
    formAction: '/api/contact',
    showSubject: true,
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '500px',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  meta: {
    isDroppable: false,
    description: 'Complete contact form',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Contact Us';
    const subtitle = (node.props.subtitle as string) || '';
    const submitButtonText = (node.props.submitButtonText as string) || 'Send Message';
    const showSubject = node.props.showSubject as boolean;
    
    return (
      <form style={styles}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</label>
          <input
            type="text"
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            placeholder="Your email"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        {showSubject && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Subject</label>
            <input
              type="text"
              placeholder="Subject"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Message</label>
          <textarea
            placeholder="Your message"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '120px',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {submitButtonText}
        </button>
      </form>
    );
  },
};

// ============================================================================
// LOGIN FORM
// ============================================================================

export const LoginFormComponent: ComponentDefinition = {
  type: 'loginForm',
  name: 'Login Form',
  category: 'forms',
  description: 'A complete login form',
  icon: 'log-in',
  defaultProps: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    submitButtonText: 'Sign In',
    forgotPasswordLink: true,
    signupLink: true,
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '400px',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  meta: {
    isDroppable: false,
    description: 'Login form with email and password',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Welcome Back';
    const subtitle = (node.props.subtitle as string) || '';
    const submitButtonText = (node.props.submitButtonText as string) || 'Sign In';
    const forgotPasswordLink = node.props.forgotPasswordLink as boolean;
    const signupLink = node.props.signupLink as boolean;
    
    return (
      <form style={styles}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        {forgotPasswordLink && (
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <a href="#" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          {submitButtonText}
        </button>
        {signupLink && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Sign up
            </a>
          </p>
        )}
      </form>
    );
  },
};

// ============================================================================
// SIGNUP FORM
// ============================================================================

export const SignupFormComponent: ComponentDefinition = {
  type: 'signupForm',
  name: 'Signup Form',
  category: 'forms',
  description: 'A complete signup form',
  icon: 'user-plus',
  defaultProps: {
    title: 'Create Account',
    subtitle: 'Start your free trial today',
    submitButtonText: 'Sign Up',
    showName: true,
    termsLink: true,
    loginLink: true,
  },
  defaultStyles: {
    width: '100%',
    maxWidth: '400px',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  meta: {
    isDroppable: false,
    description: 'User registration form',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Create Account';
    const subtitle = (node.props.subtitle as string) || '';
    const submitButtonText = (node.props.submitButtonText as string) || 'Sign Up';
    const showName = node.props.showName as boolean;
    const termsLink = node.props.termsLink as boolean;
    const loginLink = node.props.loginLink as boolean;
    
    return (
      <form style={styles}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
            {subtitle}
          </p>
        )}
        {showName && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>
        {termsLink && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span style={{ fontSize: '14px' }}>
                I agree to the{' '}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          {submitButtonText}
        </button>
        {loginLink && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
            </a>
          </p>
        )}
      </form>
    );
  },
};

// Export all form components
export const formComponents: ComponentDefinition[] = [
  InputComponent,
  TextareaComponent,
  SelectComponent,
  CheckboxComponent,
  RadioComponent,
  ButtonComponent,
  ContactFormComponent,
  LoginFormComponent,
  SignupFormComponent,
];
