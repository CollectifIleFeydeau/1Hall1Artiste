// This file contains type declarations for modules that TypeScript can't find

// JSX Runtime
declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react' {
  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useRef: <T>(initialValue: T) => { current: T };
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
  export const useMemo: <T>(factory: () => T, deps: any[]) => T;
  export const createContext: <T>(defaultValue: T) => any;
  export const useContext: <T>(context: any) => T;
  export default any;
}

declare module 'react-router-dom' {
  export const useNavigate: any;
  export const useLocation: any;
  export const useParams: any;
  export const Link: any;
  export const NavLink: any;
  export const Route: any;
  export const Routes: any;
  export const BrowserRouter: any;
  export const Navigate: any;
  export default any;
}

declare module 'lucide-react' {
  export const ArrowLeft: any;
  export const Calendar: any;
  export const MapPin: any;
  export const Users: any;
  export const Heart: any;
  export const Info: any;
  export default any;
}

declare module '@/components/ui/*' {
  const component: any;
  export default component;
  export const Button: any;
  export const Card: any;
  export const CardContent: any;
  export const Tabs: any;
  export const TabsContent: any;
  export const TabsList: any;
  export const TabsTrigger: any;
  export const Dialog: any;
  export const DialogContent: any;
  export const DialogHeader: any;
  export const DialogTitle: any;
}
