// Code Execution Service - Sandboxed execution for custom code components

import { VM } from 'vm2';

export interface CodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  logs?: string[];
}

export interface ExecutionContext {
  props?: Record<string, any>;
  state?: Record<string, any>;
  api?: Record<string, any>;
  [key: string]: any;
}

// Safe modules that can be imported in sandboxed code
const SAFE_MODULES = {
  lodash: require('lodash'),
  'date-fns': require('date-fns'),
};

// Create a sandboxed VM for code execution
export function createSandbox(context: ExecutionContext = {}): VM {
  const vm = new VM({
    timeout: 5000, // 5 second timeout
    sandbox: {
      console: {
        log: (...args: any[]) => {
          // Capture console logs
        },
        error: (...args: any[]) => {
          // Capture errors
        },
        warn: (...args: any[]) => {
          // Capture warnings
        },
        info: (...args: any[]) => {
          // Capture info
        },
      },
      // Expose safe utilities
      _: SAFE_MODULES.lodash,
      // Custom context
      props: context.props || {},
      state: context.state || {},
      api: context.api || {},
      // Safe fetch wrapper (if needed)
      fetch: async (url: string, options?: any) => {
        // Validate URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error('Invalid URL scheme');
        }
        // Block internal URLs
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          throw new Error('Access to local URLs is not allowed');
        }
        return fetch(url, options);
      },
    },
    allowAsync: true,
  });

  return vm;
}

// Execute JavaScript/TypeScript code in sandbox
export async function executeCode(
  code: string,
  context: ExecutionContext = {}
): Promise<CodeExecutionResult> {
  const logs: string[] = [];
  
  try {
    const vm = createSandbox({
      ...context,
      api: {
        ...context.api,
        log: (message: string) => logs.push(message),
      },
    });

    // Wrap code to capture return value
    const wrappedCode = `
      (async () => {
        ${code}
      })()
    `;

    const result = await vm.run(wrappedCode);
    
    return {
      success: true,
      output: result,
      logs,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      logs,
    };
  }
}

// Execute React component code and return rendered output
export async function executeReactComponent(
  componentCode: string,
  props: Record<string, any> = {}
): Promise<CodeExecutionResult> {
  try {
    // For React components, we need to transpile JSX
    // In production, use @babel/standalone or a server-side transpilation service
    
    const transpiledCode = transpileJSX(componentCode);
    
    const vm = createSandbox({
      props,
      React: require('react'),
    });

    const component = vm.run(transpiledCode);
    
    // Render component (simplified - in production use react-dom/server)
    const output = typeof component === 'function' ? component(props) : component;
    
    return {
      success: true,
      output,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to execute React component',
    };
  }
}

// Simple JSX transpilation (in production, use Babel)
function transpileJSX(code: string): string {
  // This is a very simplified transpilation
  // In production, use @babel/standalone
  
  // Remove import statements for now
  let transpiled = code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

  // Basic JSX to React.createElement transformation
  // This is extremely simplified and won't handle all cases
  transpiled = transpiled.replace(
    /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g,
    (match, tag, attrs, children) => {
      const propsObj = parseAttrs(attrs);
      return `React.createElement('${tag}', ${JSON.stringify(propsObj)}, ${children})`;
    }
  );

  // Handle self-closing tags
  transpiled = transpiled.replace(
    /<(\w+)([^>]*)\/>/g,
    (match, tag, attrs) => {
      const propsObj = parseAttrs(attrs);
      return `React.createElement('${tag}', ${JSON.stringify(propsObj)})`;
    }
  );

  return transpiled;
}

function parseAttrs(attrs: string): Record<string, any> {
  const result: Record<string, any> = {};
  const attrRegex = /(\w+)={([^}]+)}/g;
  let match;
  
  while ((match = attrRegex.exec(attrs)) !== null) {
    result[match[1]] = match[2];
  }
  
  return result;
}

// Validate code for security issues
export function validateCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /eval\s*\(/g, message: 'eval() is not allowed' },
    { pattern: /Function\s*\(/g, message: 'Function constructor is not allowed' },
    { pattern: /require\s*\(['"]child_process['"]\)/g, message: 'child_process is not allowed' },
    { pattern: /require\s*\(['"]fs['"]\)/g, message: 'fs module is not allowed' },
    { pattern: /require\s*\(['"]net['"]\)/g, message: 'net module is not allowed' },
    { pattern: /process\.env/g, message: 'Access to process.env is not allowed' },
    { pattern: /global\./g, message: 'Access to global is not allowed' },
    { pattern: /__dirname/g, message: 'Access to __dirname is not allowed' },
    { pattern: /__filename/g, message: 'Access to __filename is not allowed' },
  ];
  
  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }
  
  // Check code length
  if (code.length > 10000) {
    errors.push('Code exceeds maximum length of 10000 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Execute HTML/CSS code safely (returns sanitized HTML)
export function executeHtmlComponent(
  html: string,
  css?: string
): { html: string; css: string } {
  // Sanitize HTML (in production, use DOMPurify or similar)
  const sanitizedHtml = sanitizeHtml(html);
  
  // Scope CSS to prevent global styles
  const scopedCss = css ? scopeCss(css) : '';
  
  return {
    html: sanitizedHtml,
    css: scopedCss,
  };
}

// Simple HTML sanitization (in production, use DOMPurify)
function sanitizeHtml(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

// Scope CSS to prevent global pollution
function scopeCss(css: string, scopeClass = 'component-scoped'): string {
  // Simple scoping - in production, use CSS modules or styled-components
  return css.replace(/([^{}]+)\{([^}]+)\}/g, (match, selector: string, rules: string) => {
    const scopedSelector = selector
      .split(',')
      .map((s: string) => {
        s = s.trim();
        if (s.startsWith('@')) return s; // Keep @rules as-is
        return `.${scopeClass} ${s}`;
      })
      .join(', ');

    return `${scopedSelector}{${rules}}`;
  });
}
