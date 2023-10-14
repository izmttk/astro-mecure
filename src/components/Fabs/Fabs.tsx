import ScrollToTop from "./ScrollToTop"
export interface FabsProps {

}

export default function Fabs({
  ...rest
}: FabsProps) {
  return (
    <div className="hidden md:block fixed right-4 bottom-4 z-40">
      <ScrollToTop />
    </div>
  )
}
