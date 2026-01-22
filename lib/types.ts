
export interface OrgCardProps {
  logo: string
  name: string
  phone: string
  address: string
  onDetails?: () => void
  onShare?: () => void
  onMap?: () => void
}