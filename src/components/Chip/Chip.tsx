import Polymorphic, { withPolymorphic } from '../Polymorphic';

interface ChipProps extends React.PropsWithChildren<{}> {};

function Chip({
  ...rest
}: ChipProps) {
  return <Polymorphic {...rest}></Polymorphic>
}

export default withPolymorphic(Chip);
