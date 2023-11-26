export interface InputProps {
  id: string
  name: string
  autoComplete?: string
  required?: boolean
  className?: string
  min: number
  max: number
  step?: number
  onChange?: (arg0: number) => void
  initialValue: number

}

export interface NumberInputProps {
  id: string
  name: string
  autoComplete?: string
  required?: boolean
  className?: string
  min: number
  max: number
  step?: number
  selected: number
  setSelected: (value: number) => void
  delay?:number
}