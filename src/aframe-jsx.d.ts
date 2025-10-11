// TypeScript declaration for A-Frame custom elements in JSX
import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
  'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-sphere': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-cylinder': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-plane': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-animation': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-octahedron': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-sky': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-torus': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-cylinder': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-sphere': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  'a-ring': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  // Add more A-Frame primitives as needed
    }
  }
}
