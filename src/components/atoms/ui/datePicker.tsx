import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { Calendar } from './calendar'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface SingleDatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  format?: string
}



export const SingleDatePicker = ({
  date,
  setDate,
  className,
  placeholder = "Pick a date",
  format: dateFormat = "PPP",
}: SingleDatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, dateFormat)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export const RangeDatePicker = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  className,
  placeholder = "Pick a date range", 
  format: dateFormat = "PPP",
}: {
  startDate?: Date
  endDate?: Date
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  format?: string
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-fit justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            `${format(startDate, dateFormat)} - ${format(endDate, dateFormat)}`
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={{
            from: startDate || undefined,
            to: endDate || undefined
          }}
          onSelect={(range) => {
            console.log(range);
            
            setStartDate(range?.from || undefined)
            setEndDate(range?.to || undefined)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}