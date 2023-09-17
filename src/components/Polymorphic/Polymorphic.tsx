import { forwardRef } from 'react';
type ElementType = React.ElementType;
type Merge<A, B> = B & Omit<A, keyof B>;
export type PolymorphicProps<E extends ElementType, P> = Merge<React.ComponentPropsWithRef<E>, P & { as?: E }>;
export type PolymorphicRef<E extends ElementType> = React.ComponentPropsWithRef<E>['ref'];

export function withPolymorphic<
  DefaultType extends ElementType,
  OwnProps = {}
>(conponent: React.ComponentType<Merge<React.HTMLAttributes<HTMLElement>, OwnProps>>) {
  type ComponentProps<E extends ElementType> = PolymorphicProps<E, OwnProps>;
  type PolymorphicComponent = <E extends ElementType = DefaultType>(props: ComponentProps<E>) => React.ReactElement | null;
  
  return conponent as PolymorphicComponent;
}


// type ExtendedProps<Props = {}, OverrideProps = {}> = OverrideProps &
//   Omit<Props, keyof OverrideProps>;

// type ElementType = keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>;

// type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<
//   C,
//   React.ComponentPropsWithoutRef<C>
// >;

// type ComponentProp<C> = {
//   as?: C;
// };

// type InheritedProps<C extends ElementType, Props = {}> = ExtendedProps<PropsOf<C>, Props>;

// export type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

// export type PolymorphicComponentProps<C, Props = {}> = C extends React.ElementType
//   ? InheritedProps<C, Props & ComponentProp<C>> & { ref?: PolymorphicRef<C> }
//   : Props & { as: React.ElementType };

// export function withPolymorphic<
//   ComponentDefaultType,
//   Props,
//   StaticComponents = Record<string, never>
// >(component: any) {
//   type ComponentProps<C> = PolymorphicComponentProps<C, Props>;

//   type _PolymorphicComponent = <C = ComponentDefaultType>(
//     props: ComponentProps<C>
//   ) => React.ReactElement;

//   type ComponentProperties = Omit<React.FunctionComponent<ComponentProps<any>>, never>;

//   type PolymorphicComponent = _PolymorphicComponent & ComponentProperties & StaticComponents;

//   return component as PolymorphicComponent;
// }

const Polymorphic = forwardRef<HTMLDivElement, React.PropsWithChildren<{ as?: any }>>(
  ({ as, ...rest }, ref) => {
    const Element = as || 'div';
    return (
      <Element ref={ref} {...rest} />
    );
  }
);

export default withPolymorphic<'div', React.PropsWithChildren<{}>>(Polymorphic);

